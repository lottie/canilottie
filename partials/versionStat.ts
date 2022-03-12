import Handlebars from 'handlebars';
import { loadTemplate } from './index';
import {
  Product,
  VersionStat,
} from '../src/common';

const registerVersionStatHelper = async (): Promise<void> => {
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

export default registerVersionStatHelper;
