# Yuming Liang — Creative Coding I

A simple static coursework portfolio with seven original p5.js sketches.

## View

https://JeremyLiang10.github.io/creative-coding-portfolio/

## Run locally

From this folder, run `python3 -m http.server 8000`, then open http://localhost:8000/.
No build step or package installation is required.

## Files

- `index.html`: gallery, descriptions, and project links
- `style.css`: dark responsive layout
- `images/`: screenshots captured from the actual sketches
- `sketches/`: seven independent original sketches and collage assets
- `vendor/`: matching p5.js runtimes
- `projects.json`: project metadata and original source links
- `PROJECT-INVENTORY.md`: provenance and integration changes

To add a project, create its sketch folder, capture a cover, and add an article in index.html. projects.json is a reference inventory, not a runtime dependency.

## Interaction

Select a cover to open a standalone sketch in a new tab. Source Code opens the original p5.js Editor project. The homepage runs no sketches. Close the artwork tab to stop its runtime.

This simplified version replaces the earlier experimental gallery UI. Original course files and the professional portfolio are untouched.

Layout reference: https://languel.github.io/portfolio-example/ (implemented independently). Website implementation assisted by Codex; coursework sketches copied from the linked p5.js collection.
