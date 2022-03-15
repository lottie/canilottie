import Handlebars from 'handlebars';
import { loadTemplate } from './index';
import {
  Product,
  VersionStat,
  YesNo,
} from '../src/common';

const MAX_LAST_VERSIONS_TO_DISPLAY = 3;

interface VersionStatPartial {
  initialVersion: string,
  finalVersion: string,
  support: YesNo,
}

const YesNoToClassName : Record<YesNo, string> = {
  "y": 'stats-card__content__box--supported',
  "n": 'stats-card__content__box--unsupported',
}

const registerVersionStatHelper = async (): Promise<void> => {
  const versionStatTemplate = await loadTemplate('version-stat.html') as HandlebarsTemplateDelegate<VersionStat>;
  Handlebars.registerHelper('versions-stats', (product: Product) => {
    const versions = Object.keys(product);
    const versionsByGroup = versions.reduce((accumulator: Array<VersionStatPartial>, key: string, currentIndex: number) => {
      const lastVersion: VersionStatPartial = accumulator.length
        ? accumulator[accumulator.length - 1]
        : {
          initialVersion: key,
          finalVersion: key,
          support: product[key],
        };
      if (lastVersion.support === product[key] && currentIndex < versions.length - MAX_LAST_VERSIONS_TO_DISPLAY) {
        lastVersion.finalVersion = key;
        if (!accumulator.length) {
          accumulator.push(lastVersion);
        }
      } else {
        accumulator.push({
          initialVersion: key,
          finalVersion: key,
          support: product[key],
        });
      }

      return accumulator;
    }, []);
    return versionsByGroup.map((versionStatPartial) => {
      const data = {
        version: versionStatPartial.initialVersion === versionStatPartial.finalVersion
          ? versionStatPartial.initialVersion
          : `${versionStatPartial.initialVersion} - ${versionStatPartial.finalVersion}`,
        className: YesNoToClassName[versionStatPartial.support],
      };
      return versionStatTemplate(data);
    }).join('');
  });
};

export default registerVersionStatHelper;
