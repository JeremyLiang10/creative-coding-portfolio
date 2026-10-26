# Yuming Liang — Creative Coding I

A simple static coursework portfolio with seven p5.js coursework sketches.

## View

https://JeremyLiang10.github.io/creative-coding-portfolio/

## Run locally

From this folder, run `python3 -m http.server 8000`, then open http://localhost:8000/.
No build step or package installation is required.

## Files

- `index.html`: gallery, descriptions, and project links
- `projects/`: seven static project detail pages
- `style.css`: dark responsive layout
- `images/`: six runtime screenshots and an illustrated Fog Glass cover
- `sketches/`: seven independent sketches and collage assets
- `vendor/`: matching p5.js runtimes
- `projects.json`: project metadata and original source links
- `PROJECT-INVENTORY.md`: provenance and integration changes

To add a project, create its sketch folder, capture a cover, and add an article in index.html. projects.json is a reference inventory, not a runtime dependency.

## Interaction

Hover or focus a cover to reveal its title and View project prompt. Select a cover to open an editorial detail page with a description, interaction guide, and embedded interactive sketch. Each detail page loads only its own artwork in an isolated iframe. Source Code opens the original p5.js Editor project or the Fog Glass classroom source on GitHub. The homepage runs no sketches. Leave the detail page to stop its runtime.

This simplified version replaces the earlier experimental gallery UI. Original course files and the professional portfolio are untouched.

Layout reference: https://languel.github.io/portfolio-example/ (implemented independently). Website implementation assisted by Codex; the six earlier coursework sketches were copied from the linked p5.js collection; Fog Glass was developed locally with Codex assistance.

## Fog Glass classroom addition

The seventh project includes the English v0.7.1 classroom interface, camera hand tracking, three wiping tools, and slow-moving water droplets. Camera access is delegated by the project iframe; a standalone link is provided as an alternative. Its cover is an illustration, not a screenshot. See `sketches/fog-glass/README.md` for interaction, dependency provenance, and current verification limits.
