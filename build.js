import { readdir, writeFile, readFile, copyFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';

const sourceDataDir = './data';
const destDir = './site';

const dir = await readdir(sourceDataDir);

const parseFile = async (filename) => {
  const buf = await readFile(join(sourceDataDir, filename));
  return JSON.parse(buf.toString());
};

const htmlFilenameFromJSONFilename = (jsonFilename) => {
  const rootFileName = jsonFilename.slice(
    0,
    jsonFilename.length - extname(jsonFilename).length
  );

  return rootFileName + '.html';
};

const createCombinedJSONFile = async () => {
  // First create the combined output file.
  const combined = [];
  const wait = dir.map(async (filename) => {
    const buf = await readFile(join(sourceDataDir, filename));
    const parsed = JSON.parse(buf.toString());

    // Remove info we don't want to search on.
    delete parsed.stats;

    combined.push({
      url: htmlFilenameFromJSONFilename(filename),
      title: parsed.title,
      content: JSON.stringify(parsed),
    });
  });
  await Promise.all(wait);

  await writeFile(join(destDir, 'allData.json'), JSON.stringify(combined));
};

const expandTemplate = (data) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>${data.title}</title>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
<section>
    <h1><a href="${data.spec}">${data.title}</a></h1>
    <p>${data.description}</p>
</section>
<section>
    <h2>Notes</h2>
    <p>${data.notes}</p>
</section>
</body>
</html>
`;
};

const createPageForEachDataFile = async () => {
  const wait = dir.map(async (filename) => {
    const data = await parseFile(filename);
    const page = expandTemplate(data);

    const rootFileName = filename.slice(
      0,
      filename.length - extname(filename).length
    );

    await writeFile(
      join(destDir, htmlFilenameFromJSONFilename(filename)),
      page
    );
  });
  Promise.all(wait);
};

const copyOverFixedFiles = async () => {
  await copyFile('./index.html', join(destDir, 'index.html'));
  await copyFile('./index.js', join(destDir, 'index.js'));
};

const createTargetDir = async () => {
  await mkdir(destDir, { mode: 0o755, recursive: true });
};

const main = async () => {
  await createTargetDir();
  await createPageForEachDataFile();
  await createCombinedJSONFile();
  await copyOverFixedFiles();
};

main();
