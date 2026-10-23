# Adding a lesson

A lesson is one file that adds one object to the `TOPICS` list. The home page block, the lesson page, the previous/next buttons and the dashed path all appear automatically.

## 1. Create the file

Copy the closest existing lesson, for example `js/topics/04-dot.js` for a 2D lesson or `js/topics/05-cross.js` for a 3D one. Name it with the next number: `js/topics/11-your-topic.js`.

## 2. Describe the lesson

```js
TOPICS.push({
  id: 'your-topic',            // used in the URL: #/topic/your-topic
  cat: 'vec',                  // 'vec' (green), 'prod' (orange) or 'mat' (blue)
  dims: ['2D'],                // chips on the home block: '2D', '3D' or both
  title: 'Your topic',
  short: 'One line shown on the home block.',
  lede: 'Two sentences shown under the lesson title.',
  ideas: [['Bold lead.', 'One or two sentences.']],   // "Key ideas" box (HTML allowed)
  tries: ['Something to try.'],                       // "Try this" list (HTML allowed)
  build(ctx) { /* the interactive part, see below */ }
});
```

## 3. Build the interactive part

`build(ctx)` runs when the lesson opens. It receives:

| `ctx` | What it is |
|---|---|
| `ctx.canvas()` | adds a canvas to the picture area and returns it |
| `ctx.panel` | the control panel on the right; append sections to it |
| `ctx.bar` | the strip above the picture, for 2D/3D or view switches |
| `ctx.tools` | small buttons in the corner of the picture (for example Reset view) |
| `ctx.note(text)` | caption inside the picture |
| `ctx.hint(text)` | hint text above the picture |
| `ctx.own(obj)` | registers a Plot2D or Scene3D so it is cleaned up when you leave |
| `ctx.tween(ms, fn, done)` | animation that is cancelled automatically |
| `ctx.cleanup(fn)` | run `fn` when the lesson closes |

Building blocks, all in `js/core/`:

- `new Plot2D(canvas, { x: [-6, 6], y: [-4.5, 4.5], snap: .5 })`
  - set `plot.onDraw = p => { ... }`, then call `plot.render()`
  - draw with `p.grid()`, `p.arrow()`, `p.line()`, `p.poly()`, `p.arc()`, `p.dot()`, `p.text()`
  - make something draggable with `plot.addHandle({ get, set, color: 'blue' })`
- `new Scene3D(canvas, { range: 4 })`
  - set `scene.onDraw = s => { ... }`
  - draw with `s.axes()`, `s.arrow()`, `s.line()`, `s.poly()`, `s.para()` (a box), `s.dot()`, `s.label()`
  - dragging the scene rotates it automatically
- `Slider`, `Seg` (tabs and chips), `Check`, `MatrixInput`, and `sec(title, ...nodes)` to group controls
- `vecHTML`, `matHTML`, `num()` for readouts, and `M2` / `M3` / `cross3` / `dot3` for the maths

Always take colours from `TH` (for example `TH.blue`, `TH.orange`) rather than hard-coding them, so the canvas follows light and dark mode.

For 2D plus 3D lessons, see `js/topics/01-vector.js`: it creates both canvases, hides one, and uses `dimToggle(ctx, '2d', setMode)`.

## 4. Register it

1. Add `<script src="js/topics/11-your-topic.js"></script>` to `index.html`, after the last lesson and before the `app` scripts.
2. Add a thumbnail drawing to `THUMBS` in `js/app/thumbnails.js`, keyed by your `id`. It is a few SVG paths on a 200 by 120 canvas; copy an existing one. Without it the block shows only the coloured tiles.
3. Run `npm test`.

The home page grid, the headline count ("Eleven topics, one path"), the path between blocks and the previous/next buttons update on their own.

## Colour groups

The `cat` value sets the block border colour and the group name on the lesson page. To add a group, edit `catName` in `js/app/router.js` (`renderTopic`), the `.block[data-cat=...]` rules in `css/styles.css`, and the legend in `renderHome`.
