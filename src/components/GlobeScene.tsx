import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { damp } from 'maath/easing'
import { useSceneStore } from '../store'
import { CHAPTERS, CALIFORNIA } from '../data/trips'
import { latLonToVector3, rotationForLatLon, buildGraticule, buildArcPoints } from '../utils/geo'
import { clamp01, chapterSlice } from '../utils/animation'
import LAND_DOTS from '../data/land-dots.json'

const GLOBE_RADIUS = 2
const N = CHAPTERS.length

const CHAPTER_ROTATIONS = CHAPTERS.map((c) => rotationForLatLon(c.lat, c.lon))
const CALIFORNIA_ROTATION = rotationForLatLon(CALIFORNIA.lat, CALIFORNIA.lon)

const PIN_DIM = new THREE.Color('#BDAF9F')
const PIN_BRIGHT = new THREE.Color('#FFCB8A')
// Pacific moonlight → sunset gold as the story warms up
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
 * Globe rotation: lazy drift while hidden, California during the reveal,
 * then smooth chapter-to-chapter travel with a dwell at every stop,
 * and a slow westward drift as the final scene pulls away.
 */
function rotationTarget(
  slice: number,
  revealDrive: number,
  finalDrive: number,
): { x: number; y: number } | null {
  if (finalDrive > 0.002) {
    const boston = CHAPTER_ROTATIONS[N - 1]
    return { x: boston.x - finalDrive * 0.15, y: boston.y + finalDrive * 0.55 }
  }
  if (slice >= 0 || slice > -0.5) {
    if (slice < 0) return revealDrive > 0.002 ? CHAPTER_ROTATIONS[0] : null
    const j = Math.min(N - 1, Math.floor(slice))
    const next = Math.min(N - 1, j + 1)
    // dwell at each chapter: travel only between 25% and 75% of a segment
    const f = smoothstep(clamp01((slice - j - 0.25) / 0.5))
    return {
      x: THREE.MathUtils.lerp(CHAPTER_ROTATIONS[j].x, CHAPTER_ROTATIONS[next].x, f),
      y: THREE.MathUtils.lerp(CHAPTER_ROTATIONS[j].y, CHAPTER_ROTATIONS[next].y, f),
    }
  }
  if (revealDrive > 0.002) return CALIFORNIA_ROTATION
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
    () => CHAPTERS.map((c) => latLonToVector3(c.lat, c.lon, GLOBE_RADIUS * 1.005)),
    [],
  )

  const atmosphereUniforms = useMemo(
    () => ({
      uColor: { value: ATMO_PACIFIC.clone() },
      uIntensity: { value: 0 },
    }),
    [],
  )

  // route arcs between consecutive chapters — drawn via setDrawRange
  const arcs = useMemo(() => {
    return CHAPTERS.slice(0, -1).map((from, i) => {
      const to = CHAPTERS[i + 1]
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

  useEffect(() => {
    return () => {
      graticule.dispose()
      pinGeometry.dispose()
      landGeometry.dispose()
      arcs.forEach(({ geometry, material }) => {
        geometry.dispose()
        material.dispose()
      })
    }
  }, [graticule, pinGeometry, landGeometry, arcs])

  useEffect(() => {
    const group = groupRef.current
    if (group) group.rotation.set(0.35, 1.6, 0)
  }, [])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    const {
      revealProgress: rp,
      transitionProgress: tp,
      chapterProgress: cp,
      finalProgress: fp,
    } = useSceneStore.getState()
    const slice = chapterSlice(cp)
    const target = rotationTarget(slice, clamp01(rp * 2), fp)

    if (target) {
      damp(group.rotation, 'x', target.x, 0.55, delta)
      damp(group.rotation, 'y', target.y, 0.55, delta)
    } else {
      // hidden pre-reveal drift, wrapped so the first real target
      // never triggers a full extra turn
      group.rotation.y += delta * 0.04
      if (group.rotation.y > Math.PI) group.rotation.y -= Math.PI * 2
      damp(group.rotation, 'x', 0.35, 1.2, delta)
    }

    // the globe emerges from darkness during the reveal
    const emerge = clamp01(rp * 2.2)
    const closeness = clamp01(tp + cp * 3)

    const grat = graticuleMaterialRef.current
    if (grat) grat.opacity = emerge * (0.05 + 0.07 * closeness)

    const land = landMaterialRef.current
    if (land) land.opacity = emerge * (0.24 + 0.18 * closeness)

    // atmosphere: moonlit Pacific → warm sunset as the road unfolds
    const warmth = clamp01(rp * 0.35 + clamp01(slice + 1) * 0.15 + clamp01(slice - 4) * 0.1 + fp * 0.3)
    const atmo = atmosphereMaterialRef.current
    if (atmo) {
      ;(atmo.uniforms.uColor.value as THREE.Color).lerpColors(ATMO_PACIFIC, ATMO_GOLD, warmth)
      atmo.uniforms.uIntensity.value = emerge * (0.6 + 0.35 * warmth)
    }

    arcs.forEach((arc, j) => {
      // arc j draws on the way from chapter j to j+1
      const draw = clamp01(slice - j)
      const count = draw <= 0 ? 0 : Math.max(2, Math.ceil(draw * arc.segments) + 1)
      arc.geometry.setDrawRange(0, count)
      arc.material.opacity = emerge * (0.55 + 0.2 * fp)
    })

    const pulse = 1 + 0.1 * Math.sin(state.clock.elapsedTime * 2.2)
    pinRefs.current.forEach((pin, i) => {
      if (!pin) return
      // the first pin glows early as the reveal names California
      const revealHint = i === 0 ? clamp01((rp - 0.45) / 0.3) : 0
      const pop = Math.max(clamp01((slice - i + 0.35) / 0.35), revealHint)
      const activeT = clamp01(1 - Math.abs(slice - i) * 1.6)
      const scale = Math.max(0.001, pop * (1 + activeT * 0.8) * (activeT > 0.5 ? pulse : 1))
      pin.scale.setScalar(scale)
      const material = pin.material as THREE.MeshBasicMaterial
      material.color.lerpColors(PIN_DIM, PIN_BRIGHT, Math.max(activeT, revealHint * 0.7))
      material.opacity = pop * emerge
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
        <primitive key={CHAPTERS[i].id} object={arc.line} />
      ))}

      {CHAPTERS.map((c, i) => (
        <mesh
          key={c.id}
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
 * Camera: pushes in as the story unfolds, keeps the globe in the upper
 * part of a phone frame so chapter text at the bottom stays clear of
 * pins and route lines, and pulls slowly away for the ending.
 */
function CameraRig() {
  useFrame(({ camera }, delta) => {
    const {
      revealProgress: rp,
      transitionProgress: tp,
      chapterProgress: cp,
      finalProgress: fp,
      isMobile,
    } = useSceneStore.getState()
    const slice = chapterSlice(cp)

    const approach = clamp01((slice + 1) / 1.5)
    const eastSwing = clamp01((slice - 6) / 2) // pull out for the NY / Boston hop
    const distanceScale = isMobile ? 1.24 : 1
    const targetZ =
      (14 - 5.2 * clamp01(rp) - 1.4 * tp - 1.3 * approach + 1.1 * eastSwing + 3 * fp) * distanceScale

    const targetX = slice > 0 ? Math.sin(slice * 0.8) * 0.28 : 0
    // keep the globe high in the frame on phones — the text zone is below
    const targetY = (isMobile ? -0.52 : 0.1) - 0.25 * fp

    damp(camera.position, 'z', targetZ, 0.4, delta)
    damp(camera.position, 'x', targetX, 0.8, delta)
    damp(camera.position, 'y', targetY, 0.8, delta)
    camera.lookAt(0, 0, 0)
  })
  return null
}

/** The persistent canvas behind every scene. */
export function GlobeScene() {
  const isMobile = useSceneStore((s) => s.isMobile)
  const reducedMotion = useSceneStore((s) => s.reducedMotion)
  const lowPower = isMobile || reducedMotion

  return (
    <div id="globe-root" className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        flat
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{ fov: 42, near: 0.1, far: 120, position: [0, 0.1, 14] }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Stars
          radius={46}
          depth={28}
          count={lowPower ? 550 : 1500}
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
