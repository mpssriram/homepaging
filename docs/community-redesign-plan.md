# Community Page Redesign Plan

## Goal

Make the Dev Cell Club community page feel shorter, clearer, and easier for a student to act on. The page should work as a quick invitation, not a long handbook.

## Current Decision

Keep the cinematic Dev Cell identity, but reduce the content to one direct story:

1. You belong here.
2. Here is what you get.
3. Here is how to start.
4. Here is the action to take.

## Implemented Site Structure

The React implementation in `src/pages/CommunityPage.tsx` now uses this structure:

1. Hero: "A home for student builders."
2. Signal strip: open access, weekly builds, mentor support.
3. Value section: Learn, Build, Get Help, Ship.
4. Start section: Join a session, Pick a small task, Build with feedback.
5. Final CTA: join, meet the crew, or view events.

## Figma Plan

Use Figma as the visual handoff and review layer.

Created file:

- `Dev Cell Community Page Redesign Plan`
- https://www.figma.com/design/wPasqfyE7Bes5MMoxN1lxf

Deliverables:

1. Desktop frame for `/community`.
2. Mobile frame for `/community`.
3. Component notes for:
   - Cinematic hero.
   - Signal strip.
   - Value cards.
   - Three-step start cards.
   - CTA panel.
4. Annotation layer showing what was removed from the old long version.

Design direction:

- Keep the cinematic red/cyan command-center mood in the hero.
- Make the middle sections more readable and student-facing.
- Avoid adding extra sections unless they answer a real student question.
- Use the implementation as the source of truth for spacing, copy, and section order.

Acceptance checks:

- The first viewport clearly says what Dev Cell is.
- A new student can understand how to start within one scroll.
- Desktop and mobile frames match the implemented section order.
- The page does not feel like a full handbook.

## Remotion Plan

Use Remotion only for a short promotional motion piece, not for the page itself.

Video concept:

- Length: 12 to 18 seconds.
- Format: 16:9 first, with a possible 9:16 cut later.
- Purpose: announce the redesigned Community page or promote joining Dev Cell.

Storyboard:

1. 0-3s: Cinematic cockpit-style opening with "A home for student builders."
2. 3-7s: Four quick beats: Learn, Build, Get Help, Ship.
3. 7-12s: Three start steps: Join a session, Pick a task, Build with feedback.
4. 12-18s: CTA: "Join Dev Cell" with site/community route.

Motion direction:

- Use existing site colors: cyan, red, near-black.
- Keep transitions sharp and technical.
- Avoid overexplaining features on screen.
- Use short text phrases that match the page copy.

Acceptance checks:

- The video communicates the same shortened message as the page.
- Text remains readable at social preview sizes.
- No motion sequence introduces content that is not present on the page.

## Lovable Plan

Use Lovable as a fast alternate prototype path if the team wants to test a simpler version outside the current codebase.

Created project:

- Project ID: `fa1942df-cbba-45d6-9857-00578ab1e092`
- https://lovable.dev/projects/fa1942df-cbba-45d6-9857-00578ab1e092
- Last checked status: ready

Prototype prompt:

Build a responsive Dev Cell Club community page for a student developer club. The page should be short and direct, with a cinematic dark cyber style using cyan and red accents. It should include a hero with the headline "A home for student builders.", a compact signal strip for open access, weekly builds, and mentor support, a four-card value section for Learn, Build, Get Help, and Ship, a three-step start section for Join a session, Pick a small task, and Build with feedback, and a final CTA to join the community, meet the team, or view events. Keep the tone warm, student-facing, and beginner-friendly. Do not create a long landing page or add extra marketing sections.

Acceptance checks:

- Prototype has the same five-section flow as the implemented React page.
- Copy stays beginner-friendly.
- Visual style remains close to Dev Cell Club, not a generic SaaS page.
- Any useful Lovable ideas must be brought back into `src/pages/CommunityPage.tsx` before production.

## Implementation Notes

Completed in the current React app:

- Removed overlapping long sections:
  - What is Dev Cell?
  - Who can join?
  - Long activity list.
  - Five-step journey.
  - Culture grid.
- Replaced them with:
  - Four clear value cards.
  - Three clear first steps.
  - Shorter CTA copy.
- Preserved:
  - Cinematic hero.
  - Navbar.
  - CommandBand.
  - Existing shared UI components.

## Verification

Required checks after changes:

1. Run `npm run build`.
2. Open `/community` locally.
3. Check desktop layout for section order and no horizontal overflow.
4. Check mobile layout for stacked cards and no horizontal overflow.
5. Confirm the document title remains `Community | Dev Cell Club`.

Latest verification:

- `npm run build` passed.
- Local browser check passed on desktop.
- Local browser check passed on mobile.
- No browser console errors were observed.
