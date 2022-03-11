# Design

When running `npm run build` the following actions take place:

1. All the JSON files in `/data` are combined into a single JSON list and put in
   the file `/dist/allData.json`.
2. Each individual file in `/data` is used as the data to expand the
   `/templates/page.html` template, and the resulting file is written into
   `/build`.
3. The files in `/pages` are copied over to the `/build` directory.
4. Parcel is then run over all the files in the `/build` directory to produce
   final files in `/dist`.

# Directory Structure

- `./data` - The raw JSON files.
- `./css` - CSS files.
- `./src` - TypeScript source files.
- `./templates` - Handlebars templated HTML files.
- `./pages` - Fixed pages, like `index.html`.
- `./dist` - The final output directory. (Not checked in.)
- `./build` - Staging are for files passed into Parcel. (Not checked in.)
