import Handlebars from 'handlebars';
import { join } from 'path';
import {
  readFile,
} from 'fs/promises';
import {
  CanIUseData,
} from '../src/common';
import registerProductSupportHelper from './productSupport';
import registerVersionStatHelper from './versionStat';

const templateDir = './templates';
const loadTemplate = async (filename: string): Promise<HandlebarsTemplateDelegate<any>> => {
  const buf = await readFile(join(templateDir, filename));
  return Handlebars.compile(buf.toString());
};

const loadPageTemplate = async (): Promise<HandlebarsTemplateDelegate<CanIUseData>> => loadTemplate('page.html');

const loadSupportTableTemplate = async (): Promise<HandlebarsTemplateDelegate<CanIUseData>> => loadTemplate('support-table.html');

const registerPartials = async (): Promise<void> => {
  const partialTemplate = await loadSupportTableTemplate();
  Handlebars.registerPartial('support-table', partialTemplate);
};

const registerHelpers = async (): Promise<void> => {
  await registerProductSupportHelper();
  await registerVersionStatHelper();
};

const initializeFunctions = async (): Promise<void> => {
  await registerPartials();
  await registerHelpers();
};

export {
  loadTemplate,
  initializeFunctions,
  loadPageTemplate,
};
