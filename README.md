# Klusia · California Road Trip 2026

Jednostronicowa, mobile-first, immersyjna opowieść sterowana scrollem:
minimalne otwarcie (współrzędne startu) → dziewięć wspólnych miejsc na
stylizowanym globusie 3D → odsłonięcie nowego rozdziału → filmowa mapa trasy
przez Kalifornię → finał jednym słowem.

## Stack

- React 19 + Vite + TypeScript + Tailwind CSS
- GSAP ScrollTrigger — cała choreografia scrolla (sceny sticky + scrubbed timelines)
- Lenis — płynny scroll, spięty z tickerem GSAP
- React Three Fiber + drei + three.js — globus (siatka geograficzna, piny, łuki, atmosfera)
- @react-three/postprocessing — subtelny bloom (wyłączany na mobile / w trybie spokojnym)
- zustand — most między ScrollTriggerami (DOM) a `useFrame` (canvas)
- maath — wygładzanie ruchu kamery i rotacji globusa

Bez map API, bez kluczy, bez backendu — czysty statyczny build.

## Uruchomienie

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc --noEmit + vite build → dist/
npm run preview  # podgląd builda
```

## Deploy

Build jest w pełni statyczny (`dist/`), a `base: './'` w `vite.config.ts` sprawia,
że te same pliki działają na domenie głównej i w podkatalogu.

### 1. Vercel

```bash
npm i -g vercel
vercel          # zaakceptuj wykryte ustawienia (framework: Vite)
vercel --prod
```

Lub przez dashboard: **Add New → Project → import repo** — `vercel.json` już ustawia
`npm run build` i katalog `dist`.

### 2. Netlify

```bash
npm i -g netlify-cli
netlify deploy --build --prod
```

Lub przez dashboard: **Add new site → Import an existing project** — `netlify.toml`
już ustawia build command i publish dir.

### 3. GitHub Pages

```bash
git init && git add -A && git commit -m "California 2026"
git remote add origin https://github.com/TWOJ-LOGIN/NAZWA-REPO.git
git push -u origin main
```

Następnie najprościej przez `gh-pages`:

```bash
npm i -D gh-pages
npm run build
npx gh-pages -d dist
```

W ustawieniach repo: **Settings → Pages → Branch: `gh-pages`**. Dzięki `base: './'`
strona działa też pod `https://twoj-login.github.io/nazwa-repo/` bez zmian w konfigu.

## Struktura

```
src/
  main.tsx, App.tsx          # kompozycja scen + rejestracja pluginów GSAP
  store.ts                   # zustand: postęp scen, tryb spokojny, instancja Lenis
  styles/globals.css
  data/trips.ts              # miejsca, trasa, plan, loty — całe dane w jednym pliku
  hooks/
    useLenis.ts              # Lenis ⇆ ScrollTrigger
    useGSAPScroll.ts         # timeline przypięty do sekcji-sceny
  components/
    GlobeScene.tsx           # stały canvas R3F: globus, piny, łuki, kamera, bloom
    SceneLayout.tsx          # wysoka sekcja + sticky pełnoekranowe wnętrze
    CaliforniaMap.tsx        # scena trasy: autorska mapa SVG rysowana scrollem
    Progress.tsx             # dyskretna oś postępu
    CalmModeToggle.tsx       # „Tryb spokojny” (auto przy prefers-reduced-motion)
    scenes/                  # Intro, MemoryScene, CaliforniaReveal, FinalScene (Klusia)
  utils/
    geo.ts                   # lat/lon → sfera, rotacje, siatka, łuki
    animation.ts             # mapowanie postępu scrolla na indeksy scen
```
