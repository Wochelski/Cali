import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { damp } from 'maath/easing'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSceneStore } from '../store'
import { PAST_TRIPS, HOME, WEST } from '../data/trips'
import { latLonToVector3, rotationForLatLon, buildGraticule, buildArcPoints } from '../utils/geo'
import { clamp01, memorySlice } from '../utils/animation'
import LAND_DOTS from '../data/land-dots.json'

const GLOBE_RADIUS = 2
const N = PAST_TRIPS.length

const MEMORY_ROTATIONS = PAST_TRIPS.map((m) => rotationForLatLon(m.lat, m.lon))
const WEST_ROTATION = rotationForLatLon(WEST.lat, WEST.lon)
const LOS_ANGELES = { lat: 34.05, lon: -118.25 }

const PIN_DIM = new THREE.Color('#BDAF9F')
const PIN_BRIGHT = new THREE.Color('#FFCB8A')
// moonlit Pacific → sunset gold as the story pulls west
const ATMO_PACIFIC = new THREE.Color('#6FA3B8')
const ATMO_GOLD = new THREE.Color('#E6B66A')

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** Fresnel halo around the globe, rendered from the inside of a larger sphere. */
const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  void main() {
    float rim = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    gl_FragColor = vec4(uColor, 1.0) * rim * uIntensity;
  }
`

/**
 * Globe rotation: lazy hidden drift, then memory-to-memory travel with
 * a dwell at every place, and finally the pull toward the American West
 * as the new line draws itself from home to Los Angeles.
 */
function rotationTarget(slice: number, pull: number): { x: number; y: number } | null {
  if (pull > 0.002) return WEST_ROTATION
  if (slice >= 0) {
    const j = Math.min(N - 1, Math.floor(slice))
    const next = Math.min(N - 1, j + 1)
    // dwell at each memory: travel only between 25% and 75% of a segment
    const f = smoothstep(clamp01((slice - j - 0.25) / 0.5))
    return {
      x: THREE.MathUtils.lerp(MEMORY_ROTATIONS[j].x, MEMORY_ROTATIONS[next].x, f),
      y: THREE.MathUtils.lerp(MEMORY_ROTATIONS[j].y, MEMORY_ROTATIONS[next].y, f),
    }
  }
  if (slice > -0.5) return MEMORY_ROTATIONS[0]
  return null
}

function Globe() {
  const groupRef = useRef<THREE.Group>(null)
  const graticuleMaterialRef = useRef<THREE.LineBasicMaterial>(null)
  const landMaterialRef = useRef<THREE.PointsMaterial>(null)
  const atmosphereMaterialRef = useRef<THREE.ShaderMaterial>(null)
  const pinRefs = useRef<(THREE.Mesh | null)[]>([])

  const graticule = useMemo(() => buildGraticule(GLOBE_RADIUS, 15), [])
  const pinGeometry = useMemo(() => new THREE.SphereGeometry(0.022, 12, 12), [])

  // dotted continents (Natural Earth → scripts/generate-land-dots.mjs)
  const landGeometry = useMemo(() => {
    const positions = new Float32Array(LAND_DOTS.length * 3)
    ;(LAND_DOTS as [number, number][]).forEach(([lat, lon], i) => {
      const v = latLonToVector3(lat, lon, GLOBE_RADIUS * 1.001)
      positions[i * 3] = v.x
      positions[i * 3 + 1] = v.y
      positions[i * 3 + 2] = v.z
    })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [])

  const pinPositions = useMemo(
    () => PAST_TRIPS.map((m) => latLonToVector3(m.lat, m.lon, GLOBE_RADIUS * 1.005)),
    [],
  )

  const atmosphereUniforms = useMemo(
    () => ({
      uColor: { value: ATMO_PACIFIC.clone() },
      uIntensity: { value: 0 },
    }),
    [],
  )

  // memory route arcs — drawn via setDrawRange
  const arcs = useMemo(() => {
    return PAST_TRIPS.slice(0, -1).map((from, i) => {
      const to = PAST_TRIPS[i + 1]
      const points = buildArcPoints(from, to, GLOBE_RADIUS * 1.005, 64)
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      geometry.setDrawRange(0, 0)
      const material = new THREE.LineBasicMaterial({
        color: '#EFC881',
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      return { line: new THREE.Line(geometry, material), geometry, material, segments: 64 }
    })
  }, [])

  // the new line: home → Los Angeles, drawn during the build-up
  const westArc = useMemo(() => {
    const points = buildArcPoints(HOME, LOS_ANGELES, GLOBE_RADIUS * 1.008, 96)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    geometry.setDrawRange(0, 0)
    const material = new THREE.LineBasicMaterial({
      color: '#FFCB8A',
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    return { line: new THREE.Line(geometry, material), geometry, material, segments: 96 }
  }, [])

  useEffect(() => {
    return () => {
      graticule.dispose()
      pinGeometry.dispose()
      landGeometry.dispose()
      westArc.geometry.dispose()
      westArc.material.dispose()
      arcs.forEach(({ geometry, material }) => {
        geometry.dispose()
        material.dispose()
      })
    }
  }, [graticule, pinGeometry, landGeometry, arcs, westArc])

  useEffect(() => {
    const group = groupRef.current
    if (group) group.rotation.set(0.35, -0.7, 0)
  }, [])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    const {
      memIntroProgress: mi,
      memoryProgress: mp,
      pullProgress: pp,
    } = useSceneStore.getState()
    const slice = memorySlice(mp)
    const target = rotationTarget(slice, pp)

    if (target) {
      damp(group.rotation, 'x', target.x, 0.55, delta)
      damp(group.rotation, 'y', target.y, 0.55, delta)
    } else {
      // hidden pre-emerge drift, wrapped so the first real target
      // never triggers a full extra turn
      group.rotation.y += delta * 0.04
      if (group.rotation.y > Math.PI) group.rotation.y -= Math.PI * 2
      damp(group.rotation, 'x', 0.35, 1.2, delta)
    }

    // the globe emerges while "our map of memories" plays
    const emerge = clamp01(mi * 1.8 + mp * 3)
    const closeness = clamp01(mp * 2 + pp)

    const grat = graticuleMaterialRef.current
    if (grat) grat.opacity = emerge * (0.05 + 0.07 * closeness)

    const land = landMaterialRef.current
    if (land) land.opacity = emerge * (0.24 + 0.18 * closeness)

    // atmosphere warms as the story pulls toward the West
    const warmth = clamp01(pp * 1.1)
    const atmo = atmosphereMaterialRef.current
    if (atmo) {
      ;(atmo.uniforms.uColor.value as THREE.Color).lerpColors(ATMO_PACIFIC, ATMO_GOLD, warmth)
      atmo.uniforms.uIntensity.value = emerge * (0.6 + 0.35 * warmth)
    }

    // memory traces soften during the pull so the new line stands alone
    const traceFade = 1 - clamp01(pp * 1.4)
    arcs.forEach((arc, j) => {
      // arc j draws on the way from memory j to j+1
      const draw = clamp01(slice - j)
      const count = draw <= 0 ? 0 : Math.max(2, Math.ceil(draw * arc.segments) + 1)
      arc.geometry.setDrawRange(0, count)
      arc.material.opacity = 0.6 * emerge * traceFade
    })

    // the new line draws itself once the build-up begins
    const westDraw = clamp01((pp - 0.18) / 0.6)
    const westCount = westDraw <= 0 ? 0 : Math.max(2, Math.ceil(westDraw * westArc.segments) + 1)
    westArc.geometry.setDrawRange(0, westCount)
    westArc.material.opacity = 0.9 * emerge

    const pulse = 1 + 0.1 * Math.sin(state.clock.elapsedTime * 2.2)
    pinRefs.current.forEach((pin, i) => {
      if (!pin) return
      const pop = clamp01((slice - i + 0.35) / 0.35)
      const activeT = clamp01(1 - Math.abs(slice - i) * 1.6)
      const scale = Math.max(0.001, pop * (1 + activeT * 0.8) * (activeT > 0.5 ? pulse : 1))
      pin.scale.setScalar(scale)
      const material = pin.material as THREE.MeshBasicMaterial
      material.color.lerpColors(PIN_DIM, PIN_BRIGHT, activeT)
      // old pins soften into constellation points during the pull
      material.opacity = pop * emerge * (1 - clamp01(pp) * 0.55)
    })
  })

  return (
    <group ref={groupRef}>
      {/* dark inner sphere — occludes the far side, gives depth */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.99, 48, 48]} />
        <meshBasicMaterial color="#081426" />
      </mesh>

      <lineSegments geometry={graticule}>
        <lineBasicMaterial ref={graticuleMaterialRef} color="#46607A" transparent opacity={0} />
      </lineSegments>

      {/* moonlit dotted continents */}
      <points geometry={landGeometry}>
        <pointsMaterial
          ref={landMaterialRef}
          color="#9DB3C4"
          size={0.021}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>

      <mesh scale={1.18}>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
        <shaderMaterial
          ref={atmosphereMaterialRef}
          vertexShader={ATMOSPHERE_VERTEX}
          fragmentShader={ATMOSPHERE_FRAGMENT}
          uniforms={atmosphereUniforms}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>

      {arcs.map((arc, i) => (
        <primitive key={PAST_TRIPS[i].id} object={arc.line} />
      ))}
      <primitive object={westArc.line} />

      {PAST_TRIPS.map((m, i) => (
        <mesh
          key={m.id}
          position={pinPositions[i]}
          geometry={pinGeometry}
          ref={(el) => {
            pinRefs.current[i] = el
          }}
        >
          <meshBasicMaterial transparent opacity={0} color={PIN_DIM} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Camera: approaches through the memories, then dives inward as the
 * new line pulls west. On phones the globe rides high in the frame;
 * captions and photo cards live below.
 */
function CameraRig() {
  useFrame(({ camera }, delta) => {
    const {
      memIntroProgress: mi,
      memoryProgress: mp,
      pullProgress: pp,
      isMobile,
    } = useSceneStore.getState()
    const slice = memorySlice(mp)

    const approach = clamp01((slice + 1) / 1.5)
    const distanceScale = isMobile ? 1.24 : 1
    const targetZ = (14 - 4.6 * mi - 1.6 * approach - 0.4 * clamp01(slice / 9) - 3.6 * pp) * distanceScale

    const targetX = slice > 0 && pp <= 0 ? Math.sin(slice * 0.8) * 0.28 : 0
    const targetY = isMobile ? -0.52 : 0.1

    damp(camera.position, 'z', targetZ, 0.4, delta)
    damp(camera.position, 'x', targetX, 0.8, delta)
    damp(camera.position, 'y', targetY, 0.8, delta)
    camera.lookAt(0, 0, 0)
  })
  return null
}

/** The persistent canvas behind the memory half of the story. */
export function GlobeScene() {
  const isMobile = useSceneStore((s) => s.isMobile)
  const reducedMotion = useSceneStore((s) => s.reducedMotion)
  const lowPower = isMobile || reducedMotion

  // once the reveal owns the screen the globe is invisible — stop rendering
  const [running, setRunning] = useState(true)
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.create({
      trigger: '#reveal',
      start: 'top 60%',
      onEnter: () => setRunning(false),
      onLeaveBack: () => setRunning(true),
    })
  })

  return (
    <div id="globe-root" className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        flat
        frameloop={running ? 'always' : 'never'}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{ fov: 42, near: 0.1, far: 120, position: [0, 0.1, 14] }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Stars
          radius={46}
          depth={28}
          count={lowPower ? 420 : 1400}
          factor={3}
          saturation={0}
          fade
          speed={reducedMotion ? 0.1 : 0.5}
        />
        <Globe />
        <CameraRig />
        {!lowPower && (
          <EffectComposer>
            <Bloom
              mipmapBlur
              intensity={0.45}
              luminanceThreshold={0.25}
              luminanceSmoothing={0.35}
              radius={0.72}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
