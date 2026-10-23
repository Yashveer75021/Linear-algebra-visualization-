# Linear Algebra Lab

Interactive lessons on linear algebra. Every idea is a picture you can drag, with the numbers beside it. Lessons that benefit from it switch between 2D and 3D.

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies at runtime.

## Lessons

| # | Lesson | 2D | 3D |
|---|---|:-:|:-:|
| 1 | What is a vector? | yes | yes |
| 2 | Adding and scaling vectors | yes | |
| 3 | Linear combinations and span | yes | yes |
| 4 | Dot product and projection | yes | |
| 5 | Cross product | | yes |
| 6 | Matrices as transformations | yes | yes |
| 7 | Matrix multiplication | yes | |
| 8 | Determinant and inverse | yes | yes |
| 9 | Systems and Cramer's rule | yes | |
| 10 | Eigenvectors and eigenvalues | yes | |

## Run it

Open `index.html` in a browser. That is all.

Or serve the folder:

```bash
npm start        # runs: npx serve .
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository, go to **Settings > Pages**.
3. Set the source to **Deploy from a branch**, pick `main` and `/ (root)`, and save.

The site appears at `https://<your-user>.github.io/<repo-name>/`. The `.nojekyll` file tells GitHub Pages to serve the files as they are.

## Project structure

```
linear-algebra-lab/
├── index.html              Page shell and the list of script tags
├── css/
│   ├── tokens.css          Colours for light and dark mode
│   └── styles.css          Layout and components
├── js/
│   ├── core/               The reusable engine (no lesson content)
│   │   ├── utils.js          number formatting, DOM helpers
│   │   ├── theme.js          reads CSS colours for the canvases
│   │   ├── math.js           2x2 / 3x3 matrices, vectors, matrix HTML
│   │   ├── animation.js      tween()
│   │   ├── ui.js             Slider, Seg, Check, MatrixInput
│   │   ├── plot2d.js         Plot2D: 2D canvas, arrows, draggable handles
│   │   ├── scene3d.js        Scene3D: 3D canvas with orbit camera
│   │   └── draw.js           shared drawing (transformed grid)
│   ├── topics/             One file per lesson
│   │   ├── _helpers.js       TOPICS list and shared helpers (load first)
│   │   └── 01-vector.js ... 10-eigen.js
│   └── app/                The site around the lessons
│       ├── thumbnails.js     tile-world pictures for the home blocks
│       ├── hero.js           live demo on the home page
│       ├── router.js         home page, lesson page, hash routing
│       ├── theme-toggle.js   light/dark button
│       └── main.js           first render
├── scripts/build_single_file.py   bundles everything into one HTML file
├── tests/smoke.test.js            opens every lesson and moves every control
└── docs/ADDING_A_TOPIC.md         step-by-step guide for new lessons
```

Scripts are plain `<script>` tags, loaded in order, sharing top-level names. This keeps the project working when opened straight from disk.

## Tests

```bash
npm install
npx playwright install chromium
npm test
```

The smoke test opens every lesson, switches 2D and 3D, moves every slider, presses every button, and fails if the page logs an error.

## Single-file build

```bash
npm run build:single
```

Writes `dist/linear-algebra-lab.html`, a self-contained copy of the site.

## Adding a lesson

See [docs/ADDING_A_TOPIC.md](docs/ADDING_A_TOPIC.md).

## Licence

MIT. See [LICENSE](LICENSE).
