# Design

When running `npm run build` the following actions take place:

1. All the JSON files in /data are combined into a single JSON list and put in
   the file `/dist/allData.json`.
2. Each individual file in /data is used as the data to expand the
   `/templates/page.html` template, and the resulting file is written into
   `/build`.
3. Parcel is then run over both the `index.html` in the root directory and all
   the files in the `/build` directory to produce final files in `/dist`.

# Directory Structure

- `/data` - The raw JSON files.
- `/css` - CSS files.
- `/src` - TypeScript source files.
- `/dist` - The final output directory.
