import Handlebars from 'handlebars';
import { loadTemplate } from './index';
import {
  ProductStat,
  SupportStats,
} from '../src/common';

const registerProductSupportHelper = async (): Promise<void> => {
  const productSupport = await loadTemplate('product-support.html') as HandlebarsTemplateDelegate<ProductStat>;
  Handlebars.registerHelper('product-stats', (stats: SupportStats) => Object.keys(stats).map((key: string) => {
    const productStats = {
      name: key,
      product: stats[key],
    };
    return productSupport(productStats);
  }).join(''));
};

export default registerProductSupportHelper;
