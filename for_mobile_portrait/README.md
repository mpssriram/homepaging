# for_mobile_portrait

Source frames for the **portrait** mobile cockpit sequence served at
`/cockpit-mobile-portrait`.

- Drop the 120 portrait frames here as `*.jpg` (either `frame_0001.jpg ...
  frame_0120.jpg` or any zero-padded numbered names like `ezgif-frame-001.jpg`).
- Frames must be true portrait: **720x1280** or **1080x1920**.
- `npm run frames:mobile-portrait` copies/renames them to
  `public/cockpit-mobile-portrait/frame_0001.jpg ... frame_0120.jpg`
  (dimensions preserved, no resize/stretch). This runs automatically in
  `npm run build`.

If this folder is empty the prepare script warns and skips, so the build still
succeeds — the phone just won't have the portrait set until frames are added.
