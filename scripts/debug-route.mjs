/**
 * Visual verification for the West map route: drives an iPhone-sized
 * page with real wheel events (so Lenis behaves as in production),
 * stops inside the #westmap section and samples route state.
 * Usage: node scripts/debug-route.mjs [outDir]
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = process.argv[2] ?? 'route-debug'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
page.on('pageerror', (err) => console.log('pageerror:', err.message))

await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

const metrics = await page.evaluate(() => {
  const el = document.getElementById('westmap')
  return { top: el.getBoundingClientRect().top + window.scrollY, height: el.offsetHeight, vh: window.innerHeight }
})
console.log('westmap:', JSON.stringify(metrics))

const sample = () =>
  page.evaluate(() => {
    const q = (sel) => document.querySelector(`#westmap ${sel}`)
    const paths = [...document.querySelectorAll('#westmap svg path[stroke-dasharray="1"]')]
    const dash = paths.map((p) => Number(p.getAttribute('stroke-dashoffset')).toFixed(3))
    const el = document.getElementById('westmap')
    const progress =
      (window.scrollY - (el.getBoundingClientRect().top + window.scrollY - 0)) /
      (el.offsetHeight - window.innerHeight)
    return {
      scrollY: Math.round(window.scrollY),
      dash,
      chapter: q('[data-chapter-caption] h2')?.textContent ?? '(none)',
    }
  })

// wheel down through the whole section, sampling as we go
let shots = 0
let lastDrawn = -1
let monotonic = true
const results = []
// first: wheel until the section top reaches the viewport
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(600)
let guard = 0
while (guard++ < 400) {
  await page.mouse.wheel(0, 900)
  await page.waitForTimeout(90)
  const y = await page.evaluate(() => window.scrollY)
  if (y >= metrics.top - 10) break
}
// now walk the section in steps, settling for scrub+snap each time
for (let step = 0; step < 26; step++) {
  await page.mouse.wheel(0, 260)
  await page.waitForTimeout(80)
  await page.mouse.wheel(0, 20)
  await page.waitForTimeout(1900) // scrub 1.15s + snap settle
  const s = await sample()
  const p = (s.scrollY - metrics.top) / (metrics.height - metrics.vh)
  if (p > 1.02) break
  const drawn = 1 - Number(s.dash[1] ?? 1) // main route line drawn fraction
  if (drawn < lastDrawn - 0.02) monotonic = false
  lastDrawn = Math.max(lastDrawn, drawn)
  results.push({ p: +p.toFixed(3), drawn: +drawn.toFixed(3), chapter: s.chapter })
  console.log(`p=${p.toFixed(3)} drawn=${drawn.toFixed(3)} return=${(1 - Number(s.dash[2] ?? 1)).toFixed(2)} chapter=${s.chapter}`)
  if (step % 3 === 0) {
    await page.screenshot({ path: `${OUT}/route-${String(++shots).padStart(2, '0')}-p${Math.round(p * 100)}.png` })
  }
}

console.log('monotonic growth:', monotonic)
console.log(
  'starts from zero-ish:',
  results.length > 0 && results[0].drawn < 0.2 ? 'yes' : `NO (first sample drawn=${results[0]?.drawn})`,
)
await browser.close()
console.log('done →', OUT)
