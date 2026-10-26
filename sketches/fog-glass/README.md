# Fog Glass — classroom version

An interactive Creative Coding I study by Yuming Liang, developed with Codex assistance. p5.js 1.11.11 and ml5.js 1.2.1, with local MediaPipe Hands assets.

## Interaction

- Click **Enable camera** and allow access; show one or both hands. Move your index fingers to wipe the fog.
- Bring your hands together in a clap to cycle **Fingertip → Sponge → Squeegee**. Separate your hands before the next clap.
- The current material is shown in the upper-right corner. A confirmation appears when it changes.
- Click the tool button or press **B** to switch directly. Press **Space** or click **Reset fog** to reset.
- Mouse dragging works without a camera. Water droplets move slowly and leave narrow trails.

## Running

Serve the repository over localhost or HTTPS. No build is needed. The page loads p5.js and ml5.js from jsDelivr; hand models and WASM assets are included locally.

Camera input is processed in the browser. This project does not record or upload camera footage and does not request microphone access.

Clap recognition estimates a gesture from two-dimensional hand positions, not sound or physical contact. It can miss quick or occluded movements; use the button or B as an alternative. Current real-camera clap success rate has not been measured. Webcam and embedded permissions depend on browser settings.

The classroom sketch and CSS are copied unchanged from the local v0.7.1 version. The gallery adds a detail page, camera permission delegation, and an illustrated cover. That cover is an illustration, not a runtime screenshot.

MediaPipe asset license and provenance: `vendor/hands/LICENSE` and `vendor/hands/NOTICE.md`.

Classroom v0.7.2: The full 4:3 canvas now scales to the viewport space remaining after the header and controls. Resizing affects display size only; the 960×720 drawing coordinates and interactions are unchanged.


### v0.7.3 — Clap detection
Gesture sampling now tolerates lower-confidence side-on hands and off-screen fingertips independently from drawing. The detector accepts a smaller starting separation, preserves an approaching/centered-hand candidate during brief overlap, and confirms it when both hands reappear. Cooldown still requires hands to separate before rearming. `node tests/fog-clap.test.cjs` replays ten synthetic gesture scenarios plus gesture/drawing filtering; these checks do not measure real-camera accuracy.
