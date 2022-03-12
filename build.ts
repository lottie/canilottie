// Convert the files in the /json directory into a full caniuse type website in
// the /site directory.

import {
  readdir, writeFile, readFile, mkdir, copyFile,
} from 'fs/promises';
import { join, extname } from 'path';
import {
  CorpusPage,
  CanIUseData,
} from './src/common';
import {
  initializeFunctions as initializePartialsFunctions,
  loadPageTemplate,
} from './partials/index';

const sourceDataDir = './data';
const buildDir = './build';
const destDir = './dist';

const loadFile = async (filename: string): Promise<CanIUseData> => {
  const buf = await readFile(join(sourceDataDir, filename));
  return JSON.parse(buf.toString());
};

const jsonFilenameWithoutExtension = (jsonFilename: string): string => jsonFilename.slice(
  0,
  jsonFilename.length - extname(jsonFilename).length,
);

const htmlFilenameFromJSONFilename = (jsonFilename: string): string => `${jsonFilenameWithoutExtension(jsonFilename)}.html`;

const createCombinedJSONFile = async (sourceDirListing: string[]) => {
  // First create the combined output file.
  const combined: CorpusPage[] = [];
  const wait = sourceDirListing.map(async (filename) => {
    const parsed: CanIUseData = await loadFile(filename);

    // Remove info we don't want to search on.
    const { stats, ...searchableData } = parsed; // eslint-disable-line @typescript-eslint/no-unused-vars

    combined.push({
      url: jsonFilenameWithoutExtension(filename),
      title: searchableData.title,
      content: JSON.stringify(searchableData).toLowerCase(),
    });
  });
  await Promise.all(wait);

  await writeFile(join(destDir, 'allData.json'), JSON.stringify(combined));
};

const createPageForEachDataFile = async (sourceDirListing: string[]): Promise<void> => {
  const pageTemplate = await loadPageTemplate();

  const wait = sourceDirListing.map(async (filename) => {
    const data = await loadFile(filename);
    // const page = expandPage(data);
    const page = pageTemplate(data);

    await writeFile(
      join(buildDir, htmlFilenameFromJSONFilename(filename)),
      page,
    );
  });

  Promise.all(wait);
};

const createTargetDirs = async (): Promise<void> => {
  await mkdir(destDir, { mode: 0o755, recursive: true });
  await mkdir(buildDir, { mode: 0o755, recursive: true });
};

const copyOverFixedFiles = async (): Promise<void> => {
  await copyFile('./pages/index.html', join(buildDir, 'index.html'));
};

const main = async () => {
  const sourceDirListing = await readdir(sourceDataDir);

  await createTargetDirs();
  await initializePartialsFunctions();
  await createPageForEachDataFile(sourceDirListing);
  await createCombinedJSONFile(sourceDirListing);
  await copyOverFixedFiles();
};

main();
