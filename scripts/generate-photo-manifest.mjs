/**
 * Scans public/photos and writes src/data/photo-manifest.json:
 *   { "past/spain": [{ "src": "photos/past/spain/01.jpg", "w": 1320, "h": 1696 }], ... }
 *
 * - src paths are URL-encoded per segment (the "new york" folder contains
 *   a space) and have no leading slash — the app prefixes BASE_URL.
 * - dimensions come from `sips` (macOS); if unavailable, w/h are omitted
 *   and the UI falls back to aspect-ratio-free layout.
 *
 * Usage: node scripts/generate-photo-manifest.mjs
 */
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, extname } from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = 'public/photos'
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...walk(path))
    else if (EXTENSIONS.has(extname(entry).toLowerCase())) out.push(path)
  }
  return out
}

function dimensions(path) {
  try {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path], {
      encoding: 'utf8',
    })
    const w = Number(/pixelWidth: (\d+)/.exec(out)?.[1])
    const h = Number(/pixelHeight: (\d+)/.exec(out)?.[1])
    if (w && h) return { w, h }
  } catch {
    /* sips unavailable — omit dimensions */
  }
  return {}
}

const manifest = {}
for (const file of walk(ROOT).sort()) {
  const rel = relative('public', file) // photos/past/new york/01.jpg
  const key = relative(ROOT, join(file, '..')).split('/').join('/') // past/new york
  // normalize the manifest key (folder names may contain spaces)
  const normalizedKey = key.replace(/\s+/g, '-') // past/new-york
  const src = rel.split('/').map(encodeURIComponent).join('/')
  ;(manifest[normalizedKey] ??= []).push({ src, ...dimensions(file) })
}

writeFileSync('src/data/photo-manifest.json', JSON.stringify(manifest, null, 1))
console.log(
  `manifest: ${Object.keys(manifest).length} folders, ${Object.values(manifest).flat().length} photos`,
)
