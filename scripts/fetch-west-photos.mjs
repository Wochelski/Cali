/**
 * One-off downloader for American West destination photos.
 * Source: Wikimedia Commons (free-licensed by policy). For every
 * destination it searches curated queries, picks large landscape JPEGs,
 * downloads ~1600px thumbnails into public/photos/california/<slug>/
 * and records source pages in public/photos/california/ATTRIBUTIONS.md.
 *
 * Usage: node scripts/fetch-west-photos.mjs
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DESTINATIONS = [
  {
    slug: 'lone-pine-alabama-hills',
    queries: ['Alabama Hills arch', 'Mono Lake tufa', 'Alabama Hills Sierra Nevada'],
  },
  {
    slug: 'grand-canyon',
    queries: ['Grand Canyon South Rim', 'Grand Canyon Mather Point'],
  },
  {
    slug: 'monument-valley',
    queries: ['Monument Valley Arizona'],
  },
  {
    slug: 'page-horseshoe-bend',
    queries: ['Horseshoe Bend', 'Lake Powell'],
  },
  {
    slug: 'antelope-canyon',
    queries: ['Antelope Canyon', 'Lower Antelope Canyon'],
    allowPortrait: true,
  },
]

const BLOCKLIST = /map|diagram|logo|chart|plan_|panorama_360|banner|collage|montage/i
const API = 'https://commons.wikimedia.org/w/api.php'
const HEADERS = { 'User-Agent': 'private-birthday-site-photo-fetch/1.0 (one-off, personal project)' }
const PER_DESTINATION = 3

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function searchCandidates(query) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: `${query} filemime:jpeg`,
    gsrnamespace: '6',
    gsrlimit: '8',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '1600',
  })
  let res = await fetch(`${API}?${params}`, { headers: HEADERS })
  if (res.status === 429) {
    await sleep(30_000)
    res = await fetch(`${API}?${params}`, { headers: HEADERS })
  }
  if (!res.ok) return []
  const data = await res.json()
  const pages = Object.values(data?.query?.pages ?? {})
  return pages
    .map((p) => {
      const info = p.imageinfo?.[0]
      if (!info) return null
      return {
        title: p.title,
        width: info.width,
        height: info.height,
        thumburl: info.thumburl,
        page: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
        license: info.extmetadata?.LicenseShortName?.value ?? 'see file page',
        artist: (info.extmetadata?.Artist?.value ?? '').replace(/<[^>]+>/g, '').slice(0, 80),
        index: p.index ?? 99,
      }
    })
    .filter(Boolean)
    .filter((c) => c.thumburl && c.width >= 1200 && !BLOCKLIST.test(c.title))
    .sort((a, b) => a.index - b.index)
}

const attributions = ['# Photo sources (Wikimedia Commons)', '']
let totalSaved = 0

for (const dest of DESTINATIONS) {
  const dir = join('public/photos/california', dest.slug)
  mkdirSync(dir, { recursive: true })
  const saved = []
  const seen = new Set()

  for (const query of dest.queries) {
    if (saved.length >= PER_DESTINATION) break
    let candidates = []
    try {
      await sleep(4500) // stay well under the API rate limit
      candidates = await searchCandidates(query)
    } catch {
      continue
    }
    for (const c of candidates) {
      if (saved.length >= PER_DESTINATION) break
      if (!dest.allowPortrait && c.height > c.width) continue
      if (seen.has(c.title)) continue
      seen.add(c.title)
      const filename = `${String(saved.length + 1).padStart(2, '0')}.jpg`
      const path = join(dir, filename)
      if (existsSync(path)) {
        saved.push({ ...c, filename })
        continue
      }
      try {
        const res = await fetch(c.thumburl, { headers: HEADERS })
        if (!res.ok) continue
        const buf = Buffer.from(await res.arrayBuffer())
        if (buf.length < 30_000) continue // suspiciously small
        writeFileSync(path, buf)
        saved.push({ ...c, filename })
        totalSaved++
      } catch {
        /* skip on network error */
      }
      // stay polite with the file server
      await sleep(1500)
    }
  }

  attributions.push(`## ${dest.slug}`)
  for (const s of saved) {
    attributions.push(`- ${s.filename}: ${s.title} — ${s.license} — ${s.page}`)
  }
  attributions.push('')
  console.log(`${dest.slug}: ${saved.length} photos`)
}

writeFileSync('public/photos/california/ATTRIBUTIONS.md', attributions.join('\n'))
console.log(`total: ${totalSaved} downloaded`)
