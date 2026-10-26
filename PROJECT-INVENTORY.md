# Project inventory

Source collection: https://editor.p5js.org/Jeremylym/collections/b3MRGTDb6

| Display title | Original title | p5.js | Source |
|---|---|---|---|
| Self Portrait | self portrait | 2.3.2 | [Editor](https://editor.p5js.org/Jeremylym/sketches/tQujCTqIr) |
| Generative Portrait | Self portrait | 2.3.2 | [Editor](https://editor.p5js.org/Jeremylym/sketches/I4KBEj1a1) |
| Particle Network | Jeremy work3 | 2.3.2 | [Editor](https://editor.p5js.org/Jeremylym/sketches/xSAf7nBqZ) |
| Particle Brush | Jeremy assignment3 | 2.3.2 | [Editor](https://editor.p5js.org/Jeremylym/sketches/q9yrpQBSG) |
| DADA Collage | Assignment4 | 2.3.4 | [Editor](https://editor.p5js.org/Jeremylym/sketches/U3Hd-DtXm) |

## Integration changes

Original sketch.js and style.css files are copied unchanged. Wrapper index.html files use relative local p5.js paths and descriptive titles. Unused p5.sound loading was omitted because these sketches contain no sound API calls. Each project retains its original canvas sizing and interactions. DADA image assets are copied locally, including the unused Dali.jpg asset. Covers are screenshots of the actual sketches, not recreated artwork. Display titles clarify the original generic assignment names; original names remain listed above.

The original p5.js Editor projects are not modified. No Kinetic Typography source was present in this collection.

## Validation

All six local sketch pages were opened and rendered in a browser. Particle Brush pointer interaction, Particle Network click interaction, and DADA dragging and Space-to-clear were checked. DADA save-to-file was not tested. Fixed-size original canvases may extend beyond narrow phone viewports; the gallery itself is responsive.

## Fog Glass — classroom addition

- Local source: Fog Glass v0.7.1, developed with Codex assistance; not part of the original p5.js collection.
- Classroom `sketch.js`, `style.css`, and English `index.html` copied unchanged.
- p5.js 1.11.11 / ml5.js 1.2.1 (CDN); local MediaPipe Hands 0.4.1675469240 assets with license and provenance notice.
- New gallery card, metadata, and detail page. The iframe delegates camera access; a full-page alternative is linked.
- The Fog Glass cover is a purpose-made illustration, not a runtime screenshot. Earlier covers remain unchanged.
- JavaScript syntax, synthetic gesture state tests, local model file serving, and static link checks are separate from real-camera validation. Classroom clap success rate and published camera permission behavior remain unverified.

## Fog Glass viewport fix (v0.7.2)

The classroom page uses a bounded viewport layout and ResizeObserver to fit the entire canvas above its controls. A Fog Glass-only detail stylesheet fits the embed beneath the gallery header. Shared gallery styles and the six earlier sketches are unchanged.

- Fog Glass v0.7.3: relaxed visual-clap sampling, overlap recovery, and replay tests. Real-camera recognition rate remains unmeasured.

- Fog Glass v0.7.4: stable status rows and button widths; browser layout regression passed across five iframe sizes and six UI states per size.

## Portrait framing adjustment
Self Portrait retains its original 500×500 canvas. Generative Portrait uses an 800×600 canvas so its fixed-coordinate eyes remain balanced. Both canvases are centered and scaled proportionally within the available viewport using sketch-local CSS. Classroom originals are unchanged. Portrait in Motion was removed from the portfolio at the owner’s request.
