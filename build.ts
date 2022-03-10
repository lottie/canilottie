// Convert the files in the /json directory into a full caniuse type website in
// the /site directory.

import {
  readdir, writeFile, readFile, mkdir,
} from 'fs/promises';
import { join, extname } from 'path';
import { compile } from 'handlebars';
import { CorpusPage } from './src/common';

const sourceDataDir = './data';
const buildDir = './build';
const templateDir = './templates';
const destDir = './dist';

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

const loadTemplate = async (filename: string): Promise<HandlebarsTemplateDelegate<any>> => {
  const buf = await readFile(join(templateDir, filename));
  return compile(buf.toString());
};

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
    delete parsed.stats;

    combined.push({
      url: jsonFilenameWithoutExtension(filename),
      title: parsed.title,
      content: JSON.stringify(parsed).toLowerCase(),
    });
  });
  await Promise.all(wait);

  await writeFile(join(destDir, 'allData.json'), JSON.stringify(combined));
};

const createPageForEachDataFile = async (sourceDirListing: string[]): Promise<void> => {
  const pageTemplate = await loadTemplate('page.html');
  const wait = sourceDirListing.map(async (filename) => {
    const data = await loadFile(filename);
    const page = pageTemplate(data);

    await writeFile(
      join(buildDir, htmlFilenameFromJSONFilename(filename)),
      page,
    );
  });
  Promise.all(wait);
};

const createTargetDir = async (): Promise<void> => {
  await mkdir(destDir, { mode: 0o755, recursive: true });
  await mkdir(buildDir, { mode: 0o755, recursive: true });
};

const main = async () => {
  const sourceDirListing = await readdir(sourceDataDir);

  await createTargetDir();
  await createPageForEachDataFile(sourceDirListing);
  await createCombinedJSONFile(sourceDirListing);
};

main();
