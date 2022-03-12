// Convert the files in the /json directory into a full caniuse type website in
// the /site directory.

import {
  readdir, writeFile, readFile, mkdir, copyFile,
} from 'fs/promises';
import { join, extname } from 'path';
import Handlebars from 'handlebars';
import {
  CorpusPage,
  CanIUseData,
  Product,
  SupportStats,
  ProductStat,
  VersionStat,
} from './src/common';
import {
  loadTemplate,
} from './partials/index';
import { version } from 'os';

const sourceDataDir = './data';
const buildDir = './build';
const destDir = './dist';

const loadPageTemplate = async (filename: string): Promise<HandlebarsTemplateDelegate<CanIUseData>> => loadTemplate(filename);

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
    const { stats, ...searchableData } = parsed;

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
  const pageTemplate = await loadPageTemplate('page.html');

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

const registerPartials = async (): Promise<void> => {
  const partialTemplate = await loadTemplate('support-table.html') as HandlebarsTemplateDelegate<CanIUseData>;
  Handlebars.registerPartial('support-table', partialTemplate);
};

const registerCardHelper = async (): Promise<void> => {
  const productSupport = await loadTemplate('product-support.html') as HandlebarsTemplateDelegate<ProductStat>;
  Handlebars.registerHelper('product-stats', (stats: SupportStats) => Object.keys(stats).map((key: string) => {
    const productStats = {
      name: key,
      product: stats[key],
    };
    return productSupport(productStats);
  }).join(''));
};

const registerStatusHelper = async (): Promise<void> => {
  const versionStat = await loadTemplate('version-stat.html') as HandlebarsTemplateDelegate<VersionStat>;
  Handlebars.registerHelper('versions-stats', (product: Product) => {
    const versions = Object.keys(product);
    return versions.map((key: string) => {
      const className = product[key] === 'y'
        ? 'stats-card__content__box--supported'
        : 'stats-card__content__box--unsupported';
      const data = {
        version: key,
        className: className,
      };
      return versionStat(data);
    }).join('');
  });
};

const registerHelpers = async (): Promise<void> => {
  await registerCardHelper();
  await registerStatusHelper();
};

const registerHandlebarsFunctions = async (): Promise<void> => {
  await registerPartials();
  await registerHelpers();
};

const main = async () => {
  const sourceDirListing = await readdir(sourceDataDir);

  await createTargetDirs();
  await registerHandlebarsFunctions();
  await createPageForEachDataFile(sourceDirListing);
  await createCombinedJSONFile(sourceDirListing);
  await copyOverFixedFiles();
};

main();
