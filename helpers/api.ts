import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { getDirPath, htmlFilenameFromJSONFilename, loadFile } from './file';

type FeaturePartial = {
  ae_codes: string[],
  file_name: string
  title: string
}

const createAPIForEachDataFile = async (sourceDirListing: string[]): Promise<void> => {
  const features: FeaturePartial[] = await Promise.all(sourceDirListing.map(async (filename) => {
    const data = await loadFile(filename);
    if (data.ae_codes) {
      const apiData: FeaturePartial = {
        ae_codes: data.ae_codes,
        file_name: htmlFilenameFromJSONFilename(filename),
        title: data.title,
      };
      return apiData;
    }
    // console.log(data);
    return {
      ae_codes: [],
      file_name: '',
      title: '',
    };
  }));
  const formattedFeatures: any = features
    .filter((feature) => !!feature.ae_codes.length)
    .reduce((acc: any, feature: FeaturePartial) => {
      if (feature) {
        feature.ae_codes.forEach((code) => {
          acc[code] = {
            file_name: feature.file_name,
            title: feature.title,
          };
        });
      }
      return acc;
    }, {});
  await writeFile(
    join(getDirPath('api'), 'index.json'),
    JSON.stringify({
      rootPath: 'https://lottie-animation-community.web.app/',
      features: formattedFeatures,
    }),
  );
};

export const buildApi = async (sourceDirListing: string[]) => {
  await mkdir(getDirPath('api'), { mode: 0o755, recursive: true });
  await createAPIForEachDataFile(sourceDirListing);
  return true;
};
