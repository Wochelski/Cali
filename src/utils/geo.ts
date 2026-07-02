import * as THREE from 'three'

/**
 * Zamiana współrzędnych geograficznych na punkt na sferze.
 * Konwencja: (lat 0, lon 0) leży na osi +Z, czyli "przodem" do kamery.
 */
export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat)
  const theta = THREE.MathUtils.degToRad(lon)
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta),
  )
}

/**
 * Rotacja globusa (kolejność Eulera 'XYZ'), która ustawia dany punkt
 * dokładnie na wprost kamery patrzącej wzdłuż −Z:
 * najpierw obrót Y o −lon (długość geograficzna na środek),
 * potem obrót X o +lat (szerokość geograficzna na środek).
 */
export function rotationForLatLon(lat: number, lon: number): { x: number; y: number } {
  return {
    x: THREE.MathUtils.degToRad(lat),
    y: THREE.MathUtils.degToRad(-lon),
  }
}

/**
 * Siatka południków i równoleżników jako pozycje dla LineSegments.
 */
export function buildGraticule(radius: number, stepDeg = 15, segments = 72): THREE.BufferGeometry {
  const positions: number[] = []

  const push = (a: THREE.Vector3, b: THREE.Vector3) => {
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
  }

  // równoleżniki (bez biegunów)
  for (let lat = -75; lat <= 75; lat += stepDeg) {
    for (let i = 0; i < segments; i++) {
      const lonA = (i / segments) * 360 - 180
      const lonB = ((i + 1) / segments) * 360 - 180
      push(latLonToVector3(lat, lonA, radius), latLonToVector3(lat, lonB, radius))
    }
  }

  // południki
  for (let lon = -180; lon < 180; lon += stepDeg) {
    for (let i = 0; i < segments; i++) {
      const latA = (i / segments) * 180 - 90
      const latB = ((i + 1) / segments) * 180 - 90
      push(latLonToVector3(latA, lon, radius), latLonToVector3(latB, lon, radius))
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

/**
 * Łuk pomiędzy dwoma punktami na sferze — sferyczna interpolacja
 * z uniesieniem proporcjonalnym do odległości kątowej.
 */
export function buildArcPoints(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  radius: number,
  segments = 64,
): THREE.Vector3[] {
  const a = latLonToVector3(from.lat, from.lon, 1)
  const b = latLonToVector3(to.lat, to.lon, 1)
  const angle = a.angleTo(b)
  const lift = radius * (0.06 + 0.3 * (angle / Math.PI))

  const qa = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), a.clone().normalize())
  const qb = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), b.clone().normalize())
  const q = new THREE.Quaternion()
  const forward = new THREE.Vector3(0, 0, 1)

  const points: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    q.slerpQuaternions(qa, qb, t)
    const dir = forward.clone().applyQuaternion(q)
    const r = radius + Math.sin(Math.PI * t) * lift
    points.push(dir.multiplyScalar(r))
  }
  return points
}
