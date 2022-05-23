import {
  writeFile,
} from 'fs/promises';
import { join } from 'path';
import {
  getDirPath,
  htmlFilenameFromJSONFilename,
  jsonFilenameWithoutExtension,
  loadFile,
} from './file';
import {
  loadFeaturesListTemplate,
} from '../partials/index';
import { CanIUseData } from '../src/common';

const players = {
  skottie: 'skottie',
  'lottie-web': 'lottie-web',
  'lottie-android': 'lottie-android',
  'lottie-ios': 'lottie-ios',
};

export type PlayerTypes = typeof players;

export type PlayerTypesKeys = keyof PlayerTypes;

interface FeatureData extends CanIUseData {
  sub_features_data: FeatureData[]
  sub_level: number
  is_sub_level: boolean
  players: PlayerTypes
  link: string
}

interface FeatureInterface {
  data: FeatureData
  name: string
  filename: string
}

const unwrapSubfeatures = (subfeatures: FeatureData[], level: number) => {
  let list: FeatureData[] = [];
  subfeatures.forEach((subfeature) => {
    subfeature.sub_level = level;
    subfeature.is_sub_level = level > 0;
    list.push(subfeature);
    list = list.concat(unwrapSubfeatures(subfeature.sub_features_data, level + 1));
  });
  return list;
};

const buildSubFeatureRelationship = (features: FeatureInterface[]): FeatureData[] => {
  const featuresDict = features.reduce((dict: any, featureData) => {
    dict[featureData.name] = featureData.data;
    return dict;
  }, {});
  features.forEach((feature) => {
    if (feature.data.parent && featuresDict[feature.data.parent]) {
      featuresDict[feature.data.parent].sub_features_data.push(
        feature.data,
      );
    }
  });
  const rootFeatures = Object.keys(featuresDict)
    .filter((key) => !featuresDict[key].parent)
    .map((key) => featuresDict[key]);
  return unwrapSubfeatures(rootFeatures, 0);
};

const buildPlayers = (data: CanIUseData) => {
  const playerValues: PlayerTypes = Object.keys(players)
    .reduce((acc, key) => {
      const playerKeys = Object.keys(data.stats[key]);
      const playerValue = data.stats[key][playerKeys[playerKeys.length - 1]];
      acc[key as PlayerTypesKeys] = playerValue.split(' ')[0];
      return acc;
    }, {
      skottie: 'y',
      'lottie-web': 'y',
      'lottie-ios': 'y',
      'lottie-android': 'y',
    });
  return playerValues;
};

export const buildFeaturesList = async (sourceDirListing: string[]) => {
  const features = await Promise.all(sourceDirListing.map(async (filename) => {
    const featureData = await loadFile(filename);
    const data: FeatureData = {
      ...featureData,
      sub_features_data: [],
      sub_level: 0,
      is_sub_level: false,
      link: htmlFilenameFromJSONFilename(filename),
      players: buildPlayers(featureData),
    };
    return {
      name: jsonFilenameWithoutExtension(filename),
      filename,
      data,
    };
  }));
  const formattedFeatures = buildSubFeatureRelationship(features);

  const template = await loadFeaturesListTemplate();
  await writeFile(
    join(getDirPath('build'), 'features.html'),
    template({
      features: formattedFeatures,
    }),
  );
};
