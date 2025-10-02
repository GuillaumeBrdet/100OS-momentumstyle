# Assets Folder

This folder contains all the images and icons for your Chrome extension.

## File Structure

```
assets/
├── bg-img.png              # Main illustration shown inside the stage (new tab card)
├── icons/                  # Extension icons
│   ├── icon16.png          # 16x16 extension icon (toolbar)
│   ├── icon32.png          # 32x32 extension icon
│   ├── icon48.png          # 48x48 extension icon (extensions page)
│   └── icon128.png         # 128x128 extension icon (Chrome Web Store)
└── link-icons/             # Icons for sidebar links (SVG)
    ├── community2.svg
    ├── folder.svg
    ├── home2.svg
    ├── human2.svg
    └── newsletter2.svg
```

## How assets are used

### 1) Background illustration (`assets/bg-img.png`)
- Displayed inside the rounded main card (`.stage`) in `newtab.html`.
- Scales with `background-size: contain` to keep the full image visible.
- Layered over a subtle vertical gradient.
- Recommended size: ~1920×1080 or a large transparent PNG/SVG.
- To replace: overwrite `assets/bg-img.png` with your image (PNG/JPG/WebP).

### 2) Extension icons (`assets/icons/`)
- Four sizes are used by the extension: `16`, `32`, `48`, `128`.
- Paths are defined in `manifest.json` under the `"icons"` field.
- Keep icons square and visually crisp on both light and dark UIs.

### 3) Link icons (`assets/link-icons/`)
- SVG files are inlined at runtime by `newtab.js` so they inherit color from CSS.
- Add new SVGs to this folder and reference them in `newtab.html` using `data-src`.
- Prefer SVGs that use `stroke="currentColor"` or `fill="currentColor"`.

Example usage in `newtab.html`:
```html
<a href="https://example.com" class="icon-btn svg-inline" data-src="assets/link-icons/your-icon.svg" aria-label="Example"></a>
```

Notes about inlining (from `newtab.js`):
- Elements with class `svg-inline` and a `data-src` path are fetched and their SVG markup is inserted.
- Any `tabindex` attributes inside the SVG are removed to avoid stray focus targets.

## Tips
- Use high-quality, optimized assets (consider WebP/SVG where possible) for faster loading.
- Keep file sizes reasonable; compress large PNGs (e.g., TinyPNG).
- Test on different screen sizes; with `contain`, the full image remains visible.
- Keep consistent styling for link icons for a clean, unified look.