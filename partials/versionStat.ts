import Handlebars from 'handlebars';
import { loadTemplate } from './index';
import {
  Product,
  VersionStat,
} from '../src/common';

interface VersionStatPartial {
  initialVersion: string,
  finalVersion: string,
  support: string,
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
      if (lastVersion.support === product[key] && currentIndex < versions.length - 3) {
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
      const className = versionStatPartial.support === 'y'
        ? 'stats-card__content__box--supported'
        : 'stats-card__content__box--unsupported';
      const data = {
        version: versionStatPartial.initialVersion === versionStatPartial.finalVersion
          ? versionStatPartial.initialVersion
          : `${versionStatPartial.initialVersion} - ${versionStatPartial.finalVersion}`,
        className: className,
      };
      return versionStatTemplate(data);
    }).join('');
  });
};

export default registerVersionStatHelper;
