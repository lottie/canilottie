// Convert the files in the /json directory into a full caniuse type website in
// the /site directory.

import {
  readdir, writeFile, readFile, mkdir,
} from 'fs/promises';
import { join, extname } from 'path';
import { CorpusPage } from './src/common';

const sourceDataDir = './data';
const destDir = './site';

interface Link {
  url: string
  title: string
}

type YesNo = 'yes' | 'no'

type Product = { [key: string]: YesNo}

/** The format of the CanIUse data. */
interface CanIUseData {
  title: string
  description: string
  spec: string
  links: Link[]
  categories: string[],
  stats?: {[key: string]: Product}
  notes: string
  parent: string
  keywords: string

  // TODO(jcgregorio) Figure out the shape of the following:
  bugs: any[]
  notes_by_num: any,
}

const loadFile = async (filename: string): Promise<CanIUseData> => {
  const buf = await readFile(join(sourceDataDir, filename));
  return JSON.parse(buf.toString());
};

const htmlFilenameFromJSONFilename = (jsonFilename: string): string => {
  const rootFileName = jsonFilename.slice(
    0,
    jsonFilename.length - extname(jsonFilename).length,
  );

  return `${rootFileName}.html`;
};

const createCombinedJSONFile = async (sourceDirListing: string[]) => {
  // First create the combined output file.
  const combined: CorpusPage[] = [];
  const wait = sourceDirListing.map(async (filename) => {
    const parsed: CanIUseData = await loadFile(filename);

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

const expandTemplate = (data: CanIUseData) => `
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

const createPageForEachDataFile = async (sourceDirListing: string[]): Promise<void> => {
  const wait = sourceDirListing.map(async (filename) => {
    const data = await loadFile(filename);
    const page = expandTemplate(data);

    await writeFile(
      join(destDir, htmlFilenameFromJSONFilename(filename)),
      page,
    );
  });
  Promise.all(wait);
};

const createTargetDir = async (): Promise<void> => {
  await mkdir(destDir, { mode: 0o755, recursive: true });
};

const main = async () => {
  const sourceDirListing = await readdir(sourceDataDir);

  await createTargetDir();
  await createPageForEachDataFile(sourceDirListing);
  await createCombinedJSONFile(sourceDirListing);
};

main();
