# Contributing

You can help without writing code: suggest a subject, report something wrong in a drawing or a caption, or point to a better source. Use the [issue tracker](https://github.com/ChaseHendrick/cross-section/issues).

## What belongs here

A real building or machine that rewards being cut open: many rooms, many people, things that move. It starts from research with sources, and its captions say only what the sources support. It shares the engine and the shell; it does not bring a second renderer, a framework or recorded media.

## How to work

1. Fork, or branch off `main`. One change per branch.
2. For a new subject, write the research dossier first (`docs/research/<id>.md`; the existing ones show the shape), then copy `src/scenes/_template.js` to `src/scenes/<id>.js` and add it to `src/main.js`.
3. Look at it constantly: `node tools/shot.cjs <id>`. Read [docs/SCENE-GUIDE.md](docs/SCENE-GUIDE.md).
4. Run `node tools/lint.js`, `node tools/build.js` and `node tools/check.cjs <id>`. Commit the regenerated `dist/cross-sections.html` with your change.
5. Open a pull request against `main`. CI has to be green.

## Commits

One subject line, sentence case, ending with a full stop, saying what changed. A body only when the subject cannot carry the why. Not Conventional Commits prefixes: the log is read as English.

```
The liner's engine room gets its turbines and stokers.
```

A real vulnerability is not a pull request: see [SECURITY.md](SECURITY.md).
