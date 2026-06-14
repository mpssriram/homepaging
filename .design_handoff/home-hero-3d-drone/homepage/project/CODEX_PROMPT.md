# Codex Prompt — Cockpit Backgrounds + 3D Drone Hero (IIT Mandi · Dev Cell)

Paste this whole document into Codex. The two visual references live in the same project root:
- `Home Hero 3D Drone.html` — the new home hero (drone + Himalayan ridge + Kamand HUD)
- `Page Backgrounds Exploration.html` — the four cockpit-themed per-page backgrounds (tab switcher inside the file lets you flip between them)

Read both files end-to-end before writing any code. They are the **canonical visual spec**. CSS values, animation timings, keyframe shapes, HUD coordinates, drone construction (joint counts, propeller geometry, halo ring, antenna beacon) — all match the mocks exactly. Treat any deviation as a bug.

---

## 0. Project context

- Repo: Vite + React 18 + TypeScript + Tailwind, framer-motion already installed. Real source under `src/`. Read `AGENTS.md` for build commands and code conventions.
- Existing background system: `src/components/backgrounds/SiteBackground.tsx` + `site-background.css` currently render one `LightRays` shader recolored per `variant` prop. The dispatch wiring stays — you're replacing the per-variant *visuals*, not the surrounding plumbing.
- Existing home cockpit: `src/components/cinematic-hero/*`. Do not break it. The drone hero is a **new section that mounts directly after** the existing cinematic-hero block on `/`, with a connected transition (option B below).
- Brand: Dev Cell Club, student dev community at IIT Mandi, Kamand campus. Coordinates: **31.78° N · 76.99° E**. Don't hardcode the year — derive from `new Date().getFullYear()`.
- Accent tokens (already in use across pages — match exactly):
  - home / community: `#ff3b6b` (pink-red)
  - team: `#8beaff` (cyan)
  - events: `#a594ff` (violet, `#7c6cff` underlying)
  - projects: `#f06bff` (magenta)
  - Shared HUD cyan line: `rgba(139,234,255,0.22)`
  - Floor: `#010204`, body bg: `#020508`, soft top: `#03070e`

---

## 1. Deliverables

### A. Four per-page background components
Each replaces the recolored LightRays for that variant. They share a base layer (dark gradient + grid + grain + vignette + HUD corner brackets + Kamand coordinate marks + slow horizontal scan sweep) and add their own variant-specific visual on top.

Create:

```
src/components/backgrounds/CommunityBackground.tsx   // Signal Cluster
src/components/backgrounds/TeamBackground.tsx        // Crew Console
src/components/backgrounds/EventsBackground.tsx      // Time Stream
src/components/backgrounds/ProjectsBackground.tsx    // Schematic Lab
src/components/backgrounds/SharedHud.tsx             // HUD corners, coord marks, scan sweep, ridge — reused everywhere
src/components/backgrounds/HimalayanRidge.tsx        // SVG path component
```

Visual spec for each is the corresponding `.bg-layer.<variant>` block in `Page Backgrounds Exploration.html` plus the shared layers in the same file. Lift the CSS as-is into `site-background.css` (or per-component modules — match existing convention; the file currently uses a single CSS file with `.site-background--<variant>` selectors, keep that pattern).

#### A1. Community — Signal Cluster
- 5 beacon nodes positioned at the same %s as in the mock; each has two CSS pulse rings (`@keyframes pulse-ring`, 4s ease-out infinite, alternating 2s delay).
- 7 cyan satellite dots at the same positions.
- 4 hairline links (CSS divs rotated, with linear-gradient pink→cyan).
- Horizontal scan sweep (shared).

#### A2. Team — Crew Console
- Drifting grid (96px squares, `@keyframes drift` 60s linear, translating `-96px -96px` for a seamless loop).
- Cursor-following reticule (2rem crosshair lines) + a 3rem ring around the cursor + a 36rem soft cyan glow disc, all `mix-blend-mode: screen`. Use a single `pointermove` listener at the component level with `requestAnimationFrame` smoothing (lerp factor ~0.18). Detach on `prefers-reduced-motion`.
- Vertical data strip at the left edge with two perpendicular tick marks.
- Horizontal scan sweep (shared).

#### A3. Events — Time Stream
- 8 vertical "time columns" (1px wide, 8% / 22% / 32% / 42% / 52% / 62% / 72% / 82% from left), each with a pseudo-element pulse dropping from top to bottom (`@keyframes pulse-down`, 6s ease-in-out infinite, **per-column animation-delay** spaced ~0.55s apart — write the delays in a small `<style>` injected at component mount or as TS-generated style props).
- Drifting "NOW" line (horizontal 1px violet line, `@keyframes now-drift` 18s alternate, top 38% ↔ 62%).
- Day markers bottom row: MON TUE WED THU FRI SAT in JetBrains Mono, 0.55rem, letter-spacing 0.22em, color `rgba(165,148,255,0.4)`.

#### A4. Projects — Schematic Lab
- Perspective grid: 96px CSS grid background with `transform: perspective(800px) rotateX(58deg)`, masked to fade out at top, slow `@keyframes schematic-drift` (40s linear, animating `background-position-y 0 → 96px`).
- 4 diamond-shaped junction markers along the horizon axis at 22% / 38% / 60% / 78% horizontal (6px rotated 45°, magenta border, magenta-tinted fill, glow box-shadow).
- Blueprint strip above the horizon with two tick marks.
- Subtle top vignette in magenta (`radial-gradient(ellipse at 50% 25%, rgba(240,107,255,0.08), transparent 45%)`).

### B. The 3D drone hero
File: `src/components/cinematic-hero/HomeDroneHero.tsx` (or wherever fits — keep colocated with `Navbar.tsx` and the rest of cinematic-hero).

Use **react-three-fiber + drei** (`@react-three/fiber`, `@react-three/drei`, `three`). The HTML mock uses raw Three.js — port the scene faithfully:

- `<Canvas>` with `gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}`, `dpr={[1, 2]}`, `camera={{ position: [-2.5, 1.2, 10], fov: 28 }}`.
- A single `<group>` named `Drone` positioned at `[1.8, 0, 0]` (offset to the right so it doesn't fight the headline).
- Drone parts — all wireframe (LineSegments + EdgesGeometry). Construct exactly as in the HTML script:
  - Body: `OctahedronGeometry(0.55, 0)`, cyan (`#8beaff`) at 0.85 opacity.
  - Inner core: small magenta sphere (`#ff3b6b`, radius 0.08) — solid `MeshBasicMaterial`.
  - 4 arms at 45° corners with arm length 1.6: `BoxGeometry(0.08, 0.08, 1.6)` rotated to point outward; cyan 0.45 opacity.
  - 4 motors at arm tips: `CylinderGeometry(0.18, 0.18, 0.16, 8)`.
  - 4 propeller rings: `TorusGeometry(0.55, 0.02, 6, 32)` rotated `Math.PI/2` on X.
  - 4 propeller blade pairs: custom `BufferGeometry` with two crossed line segments, spinning around Y. Tag with `userData.isProp` for per-frame rotation.
  - Vertical antenna line from `[0, 0.5, 0]` to `[0, 1.0, 0]`.
  - Magenta beacon sphere at antenna tip (`radius 0.045`); blink via `useFrame` (`visible = Math.sin(t * 3) > -0.4`).
  - Bottom sensor dome: half-sphere `SphereGeometry(0.18, 8, 6, 0, Math.PI*2, Math.PI/2, Math.PI/2)`.
  - Body stabilizer ring: `TorusGeometry(0.85, 0.012, 4, 48)` rotated X by `Math.PI/2`.
  - Faint floor halo (separate from drone): `TorusGeometry(2.3, 0.006, 4, 96)` at world position `[1.8, -1.5, 0]`, rotated `Math.PI/2` on X.
- Animation in `useFrame`:
  - Auto-rotate Y by `0.0045` per frame.
  - Lerp toward mouse target (factor 0.05). Convert mouse position to NDC at the Canvas level.
  - `rotation.x = smoothY * 0.18`, `position.x = 1.8 + smoothX * 0.3`, `position.y = sin(t * 0.6) * 0.12 + smoothY * 0.12`.
  - Spin all `isProp` blade meshes by `0.5` per frame.
- `prefers-reduced-motion`: hook `useReducedMotion` (already in repo at `src/hooks/`); when true, set `rotation = (0.12, 0.4, 0)` once and short-circuit `useFrame`.

### C. The cockpit → drone transition (option B)
This is the connected handoff. The existing cinematic-hero ends on its current beat — keep that timeline as-is. Add **at the very end**:

1. A small HUD callout fades in bottom-right of the cockpit scene: `DC-01 · ACQUIRED · TRACKING` (JetBrains Mono, 0.55rem, accent-cyan, with a 1px cyan glow underline). Hold 800ms.
2. The cinematic-hero scrolls/translates out (existing exit). As it does, the drone hero's `HomeDroneHero` block enters from the bottom with a parallax offset:
   - Container starts at `translateY(40px)` opacity `0.7`.
   - Driven by `framer-motion` `useScroll` + `useTransform`. As page scroll passes the cinematic-hero handoff point (use a `<motion.div ref>` sentinel at the bottom of the cinematic-hero), the drone container goes to `translateY(0) opacity(1)` over 600ms.
3. In the drone hero, the `DC-01` callout label (top-right text in `HomeDroneHero`) shares the same string and fades in 200ms after the cockpit one fades out — visual continuity, the reader feels like the cockpit handed the unit off.
4. The Himalayan ridge silhouette at the bottom is **only on the drone hero**, not the cockpit. It serves as the visual "horizon line" where the drone unit is operating.

If `prefers-reduced-motion`: drop the translateY parallax; just fade in at full opacity. Keep the callout cross-fade — it's not motion, it's just text.

### D. SiteBackground.tsx refactor
`SiteBackground.tsx` becomes a thin dispatcher:

```tsx
const VARIANT_BG: Record<SiteBackgroundVariant, FC<{ reducedMotion: boolean }>> = {
  home: HomeCockpitBackground,   // existing — keep your current LightRays setup here
  community: CommunityBackground,
  team: TeamBackground,
  events: EventsBackground,
  projects: ProjectsBackground,
  challenges: CommunityBackground, // fallback for now
  join: CommunityBackground,
};
```

Keep the `afterCockpit` scroll-opacity behavior for `home`. Pull the shared HUD (corners, Kamand coords, scan sweep, base gradient, grid, grain, vignette) into a `<SharedHud variant={variant} />` component that all variants render. The variant-specific component only adds *its* extra layer (signal cluster / crew console / time stream / schematic lab).

---

## 2. Files to create

```
src/components/backgrounds/CommunityBackground.tsx
src/components/backgrounds/TeamBackground.tsx
src/components/backgrounds/EventsBackground.tsx
src/components/backgrounds/ProjectsBackground.tsx
src/components/backgrounds/SharedHud.tsx
src/components/backgrounds/HimalayanRidge.tsx
src/components/backgrounds/HomeCockpitBackground.tsx   // extract existing LightRays setup into its own component
src/components/cinematic-hero/HomeDroneHero.tsx
src/components/cinematic-hero/HomeDroneHero.css        // or use Tailwind — match existing convention
src/components/cinematic-hero/CockpitAcquireCallout.tsx // the "DC-01 · ACQUIRED" callout
```

## 3. Files to modify

```
src/components/backgrounds/SiteBackground.tsx    // becomes the dispatcher described above
src/components/backgrounds/site-background.css   // add cockpit tokens (HUD lines, coord styles, scan sweep keyframes, etc.) — extract from both HTML mocks
src/pages/HomePage.tsx                           // mount HomeDroneHero after the existing cinematic hero block, wire the transition
package.json                                     // add three, @react-three/fiber, @react-three/drei
```

Do **not** edit:
- The other page files (`CommunityPage.tsx`, `TeamPage.tsx`, `EventsPage.tsx`, `ProjectsPage.tsx`) — they already wire `variant` through `App.tsx`; just give the new backgrounds and they pick up automatically.
- `App.tsx` — already routes variant correctly.
- The existing cinematic-hero internals — only append the `CockpitAcquireCallout` at the end of its timeline.

## 4. Dependencies

```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

Pin to a known-good triplet: `three@0.160.x`, `@react-three/fiber@8.x`, `@react-three/drei@9.x`. Vite + r3f works out of the box.

## 5. Accessibility

- All canvases / decorative SVG / animated CSS divs: `aria-hidden="true"`.
- The drone Canvas: `style={{ pointerEvents: 'none' }}`, no `tabIndex`.
- All looped animations: gate on `useReducedMotion()` from `src/hooks/`. The drone scene's `useFrame` should early-return when reduced; the CSS keyframes should be killed via `@media (prefers-reduced-motion: reduce) { animation: none !important; }` in `site-background.css`.
- The `DC-01 · ACQUIRED` callout cross-fade is just opacity, ok to keep at all motion settings.
- Cursor reticule on Team: only attach `pointermove` when `@media (hover: hover)` and not reduced-motion. On touch, hide it (`display: none`).

## 6. Performance budget

- One `<Canvas>` on the page, only mounted on `/`. Lazy-import via `React.lazy` + `Suspense` so other routes don't ship Three.
- No post-processing, no shadows, no envmap. Pure LineBasicMaterial + MeshBasicMaterial.
- Drone scene polycount target: < 2k triangles total. The geometry list above lands well under that.
- Other backgrounds: pure CSS (no canvas, no WebGL). No `backdrop-filter` on full-viewport layers — only on small UI chips like the caption.

## 7. Code style

- Read `AGENTS.md` first. Follow the existing patterns: function components, named exports, `type` aliases over `interface`, props destructured in signature, Tailwind classes for layout / arbitrary values for the cockpit specifics, CSS file for animation keyframes.
- Match the cleanup pattern from `LightRays.tsx` for any imperative WebGL: IntersectionObserver to start/stop the rAF loop when offscreen, dispose geometries/materials on unmount.
- Strict TypeScript. No `any`. The Three types from `@types/three` cover everything we use.

## 8. Acceptance criteria

A reviewer should be able to:

1. `npm install && npm run dev`, no console errors.
2. Visit `/` — see the existing cinematic-hero play. At its end, "DC-01 · ACQUIRED · TRACKING" fades in bottom-right. Then the drone hero scrolls into view with the wireframe drone hovering to the right of the "BUILD WITH / THE CELL." headline, Himalayan ridge along the bottom, Kamand coordinates in the HUD corners.
3. Move the cursor — drone tilts and parallaxes toward it. Propellers spin. Antenna beacon blinks. Halo ring stays under it.
4. Visit `/community` — Signal Cluster background (5 pulsing red beacons, cyan satellites, hairline links). Same dark grid, same Kamand HUD coords.
5. Visit `/team` — Crew Console (drifting grid, cyan reticule following the cursor with crosshair + ring + glow disc, left data strip).
6. Visit `/events` — Time Stream (8 vertical violet columns with sequenced pulse drops, drifting NOW line, day markers MON–SAT at the bottom).
7. Visit `/projects` — Schematic Lab (perspective magenta grid, 4 diamond junctions on the horizon axis, blueprint strip).
8. Enable `prefers-reduced-motion` (DevTools rendering tab) — every animation freezes; all visuals still readable; drone stops at a 0.12 / 0.4 rest pose, propellers stop, beacon stays on.
9. Resize to 720px — drone hero stacks vertically (drone above text), HUD corners shrink, coord marks shrink, day markers wrap or scroll cleanly.
10. Bundle size: route `/community`/`/team`/`/events`/`/projects` should NOT ship the three.js chunk — verify via `npm run build` + bundle inspection.

## 9. Out of scope (don't do these)

- Don't redesign the existing cinematic-hero. Only append the acquire callout at the end of its timeline.
- Don't change page typography, copy, or layout grids.
- Don't add Spline. Don't add bloom/postprocessing.
- Don't replace `LightRays` for the home page — it stays.
- Don't add a navbar redesign, footer redesign, or color tweaks to existing tokens.

---

## 10. Reference quick-table

| Variant | Background concept | Primary color | Component |
|---|---|---|---|
| home | Cockpit (existing) + drone (new) | cyan + pink core | `HomeCockpitBackground` + `HomeDroneHero` |
| community | Signal Cluster | pink-red `#ff3b6b` | `CommunityBackground` |
| team | Crew Console | cyan `#8beaff` | `TeamBackground` |
| events | Time Stream | violet `#a594ff` | `EventsBackground` |
| projects | Schematic Lab | magenta `#f06bff` | `ProjectsBackground` |

Shared everywhere: dark base gradient, 72px cyan grid, grain, vignette, HUD corner brackets, IIT Mandi · Kamand HUD coordinates, ticking T-stamp, slow horizontal scan sweep.

When in doubt, the two HTML mocks are the source of truth. Open them in the browser, inspect the DOM, copy the CSS.
