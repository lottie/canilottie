// Convert the files in the /json directory into a full caniuse type website in
// the /site directory.

import {
  writeFile,
} from 'fs/promises';
import { join } from 'path';
import {
  CorpusPage,
  CanIUseData,
} from './src/common';
import {
  initializeFunctions as initializePartialsFunctions,
  loadPageTemplate,
  loadIndexTemplate,
  loadAboutTemplate,
} from './partials/index';
import { buildApi } from './helpers/api';
import { buildFeaturesList } from './helpers/featuresList';
import {
  createTargetDirs, getDirPath, getSourceDirListing, htmlFilenameFromJSONFilename, jsonFilenameWithoutExtension, loadFile,
} from './helpers/file';
import { formatDate } from './helpers/date';
import { copyFile } from 'node:fs/promises';

interface FeatureInterface {
  data: CanIUseData
  name: string
  filename: string
}

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

  await writeFile(join(getDirPath('dest'), 'allData.json'), JSON.stringify(combined));
};

const buildSubFeatureRelationship = (features: FeatureInterface[]): FeatureInterface[] => {
  const featuresDict = features.reduce((dict: any, featureData) => {
    dict[featureData.name] = featureData.data;
    return dict;
  }, {});
  features.forEach((feature) => {
    if (feature.data.parent && featuresDict[feature.data.parent]) {
      featuresDict[feature.data.parent].sub_features.push(
        `[${feature.data.title}](${htmlFilenameFromJSONFilename(feature.filename)})`,
      );
    }
  });
  return features;
};

const createPageForEachDataFile = async (sourceDirListing: string[]): Promise<void> => {
  const pageTemplate = await loadPageTemplate();

  // Adding feature to subfeature relationship
  let features = await Promise.all(sourceDirListing.map(async (filename) => {
    const data = await loadFile(filename);
    data.sub_features = [];
    return {
      name: jsonFilenameWithoutExtension(filename),
      filename,
      data,
    };
  }));
  features = buildSubFeatureRelationship(features);

  const wait = features.map(async (feature) => {
    // const page = expandPage(data);
    const page = pageTemplate(feature.data);

    await writeFile(
      join(getDirPath('build'), htmlFilenameFromJSONFilename(feature.filename)),
      page,
    );
  });

  // const wait = sourceDirListing.map(async (filename) => {
  //   const data = await loadFile(filename);
  //   // const page = expandPage(data);
  //   const page = pageTemplate(data);

  //   await writeFile(
  //     join(buildDir, htmlFilenameFromJSONFilename(filename)),
  //     page,
  //   );
  // });

  Promise.all(wait);
};

const copyOverFixedFiles = async (): Promise<void> => {
  const indexTemplate = await loadIndexTemplate();
  await writeFile(
    join(getDirPath('build'), 'index.html'),
    indexTemplate(),
  );
  const aboutTemplate = await loadAboutTemplate();
  await writeFile(
    join(getDirPath('build'), 'about.html'),
    aboutTemplate({
      date: formatDate(),
    }),
  );
  // await copyFile('./pages/index.html', join(buildDir, 'index.html'));
  await copyFile('./assets/favicon.ico', join(getDirPath('build'), 'favicon.ico'));
};

const buildPages = async (sourceDirListing: string[]) => {
  await initializePartialsFunctions();
  await createPageForEachDataFile(sourceDirListing);
  await createCombinedJSONFile(sourceDirListing);
  await copyOverFixedFiles();
  await buildFeaturesList(sourceDirListing);
};

const main = async () => {
  const sourceDirListing = await getSourceDirListing();
  await createTargetDirs();
  await buildPages(sourceDirListing);
  await buildApi(sourceDirListing);
};

main();
 