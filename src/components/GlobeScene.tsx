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
import { DESTINATIONS, CALIFORNIA } from '../data/trips'
import { latLonToVector3, rotationForLatLon, buildGraticule, buildArcPoints } from '../utils/geo'
import { clamp01, destinationSlice } from '../utils/animation'
import LAND_DOTS from '../data/land-dots.json'

const GLOBE_RADIUS = 2
const N = DESTINATIONS.length

const DEST_ROTATIONS = DESTINATIONS.map((d) => rotationForLatLon(d.lat, d.lon))
const CALIFORNIA_ROTATION = rotationForLatLon(CALIFORNIA.lat, CALIFORNIA.lon)

const PIN_DIM = new THREE.Color('#8f8468')
const PIN_BRIGHT = new THREE.Color('#ffb473')
// zmierzch nad Pacyfikiem → kalifornijski zachód przy odsłonięciu
const ATMO_DUSK = new THREE.Color('#6b82a0')
const ATMO_WARM = new THREE.Color('#e08a4e')

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** Poświata wokół globusa — fresnel na sferze renderowanej od środka. */
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
 * Rotacja globusa: przed pierwszym miejscem — leniwy dryf,
 * potem płynne przejścia między kolejnymi celami (z chwilą "postoju"
 * przy każdym), na końcu obrót w stronę Kalifornii.
 */
function rotationTarget(slice: number, revealProgress: number): { x: number; y: number } | null {
  if (revealProgress > 0.002) return CALIFORNIA_ROTATION
  if (slice < 0) return slice > -0.5 ? DEST_ROTATIONS[0] : null
  const j = Math.min(N - 1, Math.floor(slice))
  const next = Math.min(N - 1, j + 1)
  // postój przy każdym miejscu: ruch dopiero między 25% a 75% odcinka
  const f = smoothstep(clamp01((slice - j - 0.25) / 0.5))
  return {
    x: THREE.MathUtils.lerp(DEST_ROTATIONS[j].x, DEST_ROTATIONS[next].x, f),
    y: THREE.MathUtils.lerp(DEST_ROTATIONS[j].y, DEST_ROTATIONS[next].y, f),
  }
}

function Globe() {
  const groupRef = useRef<THREE.Group>(null)
  const graticuleMaterialRef = useRef<THREE.LineBasicMaterial>(null)
  const landMaterialRef = useRef<THREE.PointsMaterial>(null)
  const atmosphereMaterialRef = useRef<THREE.ShaderMaterial>(null)
  const pinRefs = useRef<(THREE.Mesh | null)[]>([])
  const californiaPinRef = useRef<THREE.Mesh>(null)

  const graticule = useMemo(() => buildGraticule(GLOBE_RADIUS, 15), [])
  const pinGeometry = useMemo(() => new THREE.SphereGeometry(0.028, 12, 12), [])

  // kontynenty z kropek (Natural Earth → scripts/generate-land-dots.mjs)
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
    () => DESTINATIONS.map((d) => latLonToVector3(d.lat, d.lon, GLOBE_RADIUS * 1.005)),
    [],
  )
  const californiaPosition = useMemo(
    () => latLonToVector3(CALIFORNIA.lat, CALIFORNIA.lon, GLOBE_RADIUS * 1.005),
    [],
  )

  const atmosphereUniforms = useMemo(
    () => ({
      uColor: { value: ATMO_DUSK.clone() },
      uIntensity: { value: 0.55 },
    }),
    [],
  )

  // łuki między kolejnymi miejscami — rysowane przez setDrawRange
  const arcs = useMemo(() => {
    return DESTINATIONS.slice(0, -1).map((from, i) => {
      const to = DESTINATIONS[i + 1]
      const points = buildArcPoints(from, to, GLOBE_RADIUS * 1.005, 64)
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      geometry.setDrawRange(0, 0)
      const material = new THREE.LineBasicMaterial({
        color: '#f0a869',
        transparent: true,
        opacity: 0.7,
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
    if (group) group.rotation.set(0.35, -0.7, 0)
  }, [])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    const { introProgress: ip, memoryProgress: mp, revealProgress: rp } = useSceneStore.getState()
    const slice = destinationSlice(mp, N)
    const target = rotationTarget(slice, rp)

    if (target) {
      damp(group.rotation, 'x', target.x, 0.55, delta)
      damp(group.rotation, 'y', target.y, 0.55, delta)
    } else {
      // dryf, zanim zacznie się opowieść — z zawinięciem kąta,
      // żeby przejście do pierwszego celu nigdy nie robiło pełnych obrotów
      group.rotation.y += delta * 0.045
      if (group.rotation.y > Math.PI) group.rotation.y -= Math.PI * 2
      damp(group.rotation, 'x', 0.35, 1.2, delta)
    }

    // siatka: bardzo dyskretna — kontynenty niosą teraz obraz globusa
    const grat = graticuleMaterialRef.current
    if (grat) grat.opacity = 0.06 + 0.1 * clamp01(ip + mp * 3)

    // kontynenty wyłaniają się w miarę zbliżania
    const land = landMaterialRef.current
    if (land) land.opacity = 0.22 + 0.22 * clamp01(ip + mp * 3)

    // atmosfera ociepla się przy przejściu do Kalifornii
    const atmo = atmosphereMaterialRef.current
    if (atmo) {
      ;(atmo.uniforms.uColor.value as THREE.Color).lerpColors(ATMO_DUSK, ATMO_WARM, clamp01(rp * 1.3))
      atmo.uniforms.uIntensity.value = 0.65 + 0.45 * clamp01(rp)
    }

    const arcFade = 1 - clamp01(rp * 2.2)
    arcs.forEach((arc, j) => {
      // łuk j rysuje się w drodze z miejsca j do j+1
      const draw = clamp01(slice - j)
      const count = draw <= 0 ? 0 : Math.max(2, Math.ceil(draw * arc.segments) + 1)
      arc.geometry.setDrawRange(0, count)
      arc.material.opacity = 0.7 * arcFade
    })

    const pinFade = 1 - clamp01(rp * 2.2)
    const pulse = 1 + 0.12 * Math.sin(state.clock.elapsedTime * 2.6)
    pinRefs.current.forEach((pin, i) => {
      if (!pin) return
      const pop = clamp01((slice - i + 0.35) / 0.35)
      const activeT = clamp01(1 - Math.abs(slice - i) * 1.6)
      const scale = Math.max(0.001, pop * (1 + activeT * 0.9) * (activeT > 0.5 ? pulse : 1))
      pin.scale.setScalar(scale)
      const material = pin.material as THREE.MeshBasicMaterial
      material.color.lerpColors(PIN_DIM, PIN_BRIGHT, activeT)
      material.opacity = pop * pinFade
    })

    const caPin = californiaPinRef.current
    if (caPin) {
      const t = clamp01((rp - 0.18) / 0.25)
      caPin.scale.setScalar(Math.max(0.001, t * 1.7 * pulse))
      const material = caPin.material as THREE.MeshBasicMaterial
      material.opacity = t
    }
  })

  return (
    <group ref={groupRef}>
      {/* ciemne wnętrze — zasłania tylną część siatki, daje głębię */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.99, 48, 48]} />
        <meshBasicMaterial color="#0d1424" />
      </mesh>

      <lineSegments geometry={graticule}>
        <lineBasicMaterial
          ref={graticuleMaterialRef}
          color="#5d6a7c"
          transparent
          opacity={0.08}
        />
      </lineSegments>

      {/* kontynenty z kropek — ciepły piasek */}
      <points geometry={landGeometry}>
        <pointsMaterial
          ref={landMaterialRef}
          color="#c9b892"
          size={0.021}
          sizeAttenuation
          transparent
          opacity={0.25}
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
        <primitive key={DESTINATIONS[i].id} object={arc.line} />
      ))}

      {DESTINATIONS.map((d, i) => (
        <mesh
          key={d.id}
          position={pinPositions[i]}
          geometry={pinGeometry}
          ref={(el) => {
            pinRefs.current[i] = el
          }}
        >
          <meshBasicMaterial transparent opacity={0} color={PIN_DIM} />
        </mesh>
      ))}

      <mesh ref={californiaPinRef} position={californiaPosition} geometry={pinGeometry}>
        <meshBasicMaterial transparent opacity={0} color={PIN_BRIGHT} />
      </mesh>
    </group>
  )
}

/** Kamera: scroll dopycha ją w głąb sceny, z lekkim bocznym dryfem. */
function CameraRig() {
  useFrame(({ camera }, delta) => {
    const { introProgress: ip, memoryProgress: mp, revealProgress: rp, isMobile } = useSceneStore.getState()
    const slice = destinationSlice(mp, N)

    const approach = clamp01(mp / 0.08)
    const drift = clamp01((mp - 0.08) / 0.86)
    // na pionowym ekranie kamera trzyma większy dystans, żeby globus
    // nie wychodził za bardzo poza wąski kadr
    const distanceScale = isMobile ? 1.22 : 1
    const targetZ = (13 - 2.4 * ip - 2.8 * approach - 0.7 * drift - 2.4 * clamp01(rp * 1.05)) * distanceScale
    const targetX = slice > 0 ? Math.sin(slice * 0.8) * 0.3 : 0
    const targetY = 0.12 - 0.3 * clamp01(rp)

    damp(camera.position, 'z', targetZ, 0.4, delta)
    damp(camera.position, 'x', targetX, 0.8, delta)
    damp(camera.position, 'y', targetY, 0.8, delta)
    camera.lookAt(0, 0, 0)
  })
  return null
}

/**
 * Stały canvas pod scenami 1–3. Wygaszany (opacity na #globe-root)
 * pod koniec sceny "California Reveal" — dalej opowieść przejmuje mapa SVG.
 */
export function GlobeScene() {
  const calm = useSceneStore((s) => s.calm)
  const isMobile = useSceneStore((s) => s.isMobile)
  const lowPower = calm || isMobile

  // od sceny trasy globus jest niewidoczny — zatrzymujemy pętlę renderowania
  const [running, setRunning] = useState(true)
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.create({
      trigger: '#route',
      start: 'top bottom',
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
        camera={{ fov: 42, near: 0.1, far: 120, position: [0, 0.12, 13] }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Stars
          radius={46}
          depth={28}
          count={lowPower ? 700 : 1800}
          factor={3}
          saturation={0}
          fade
          speed={calm ? 0.15 : 0.6}
        />
        <Globe />
        <CameraRig />
        {!lowPower && (
          <EffectComposer>
            <Bloom
              mipmapBlur
              intensity={0.5}
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
