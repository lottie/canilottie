// Convert the files in the /json directory into a full caniuse type website in
// the /site directory.

import {
  readdir, writeFile, readFile, copyFile, mkdir,
} from 'fs/promises';
import { join, extname } from 'path';
import { CorpusPage, CanIUseData } from './src/common';
import expandPage from './src/templates/expandPage';

const sourceDataDir = './data';
const destDir = './site';

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

const createPageForEachDataFile = async (sourceDirListing: string[]): Promise<void> => {
  const wait = sourceDirListing.map(async (filename) => {
    const data = await loadFile(filename);
    const page = expandPage(data);

    await writeFile(
      join(destDir, htmlFilenameFromJSONFilename(filename)),
      page,
    );
  });
  Promise.all(wait);
};

const copyOverFixedFiles = async (): Promise<void> => {
  await copyFile('./index.html', join(destDir, 'index.html'));
};

const createTargetDir = async (): Promise<void> => {
  await mkdir(destDir, { mode: 0o755, recursive: true });
};

const main = async () => {
  const sourceDirListing = await readdir(sourceDataDir);

  await createTargetDir();
  await createPageForEachDataFile(sourceDirListing);
  await createCombinedJSONFile(sourceDirListing);
  await copyOverFixedFiles();
};

main();
