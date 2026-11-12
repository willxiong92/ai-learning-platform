# AI guide content source

`catalog.json` is the repository-maintained article and model catalog. The `imports/` files are immutable authorized source snapshots; each article records its SHA-256 and source URL. Images are stored once under `public/ai-guide/media/`.

After editing the catalog, run `npm run content:guide`, then `npm run test:guide`. This generates `src/data/ai-guide.json` and its reading markup. Classification is maintained in `src/data/ai-guide-learning-path.json`; every article belongs to exactly one category.

Anonymous web refresh is blocked while authorized full text exists. Do not replace complete articles with public excerpts. Keep provenance in the catalog. The original course/terminology pipeline remains separate and is not run during ordinary builds.
