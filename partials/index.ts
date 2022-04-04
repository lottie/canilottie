import Handlebars from 'handlebars';
import { join } from 'path';
import {
  readFile,
} from 'fs/promises';
import { marked } from 'marked';
import {
  CanIUseData,
} from '../src/common';
import registerProductSupportHelper from './productSupport';
import registerVersionStatHelper from './versionStat';
import registerFeaturesHelper from './features';

const templateDir = './templates';
const loadTemplate = async (filename: string): Promise<HandlebarsTemplateDelegate<any>> => {
  const buf = await readFile(join(templateDir, filename));
  return Handlebars.compile(buf.toString());
};

const loadPageTemplate = async (): Promise<HandlebarsTemplateDelegate<CanIUseData>> => loadTemplate('page.html');

const loadIndexTemplate = async (): Promise<HandlebarsTemplateDelegate<void>> => loadTemplate('index.html');

const loadSupportTableTemplate = async (): Promise<HandlebarsTemplateDelegate<CanIUseData>> => loadTemplate('support-table.html');

const loadSearchResultTemplate = async (): Promise<HandlebarsTemplateDelegate<void>> => loadTemplate('search-result.html');
const loadSearchWidgetTemplate = async (): Promise<HandlebarsTemplateDelegate<void>> => loadTemplate('search-widget.html');
const loadSearchSectionTemplate = async (): Promise<HandlebarsTemplateDelegate<void>> => loadTemplate('search-section.html');
const loadMainTitleSectionTemplate = async (): Promise<HandlebarsTemplateDelegate<void>> => loadTemplate('main-title.html');
const loadFeaturesTemplate = async (): Promise<HandlebarsTemplateDelegate<void>> => loadTemplate('features-widget.html');

const registerPartials = async (): Promise<void> => {
  const partialTemplate = await loadSupportTableTemplate();
  Handlebars.registerPartial('support-table', partialTemplate);
  const searchResultTemplate = await loadSearchResultTemplate();
  Handlebars.registerPartial('search-result', searchResultTemplate);
  const searchWidgetTemplate = await loadSearchWidgetTemplate();
  Handlebars.registerPartial('search-widget', searchWidgetTemplate);
  const searchSectionTemplate = await loadSearchSectionTemplate();
  Handlebars.registerPartial('search-section', searchSectionTemplate);
  const mainTitleSectionTemplate = await loadMainTitleSectionTemplate();
  Handlebars.registerPartial('main-title', mainTitleSectionTemplate);
  const featuresTemplate = await loadFeaturesTemplate();
  Handlebars.registerPartial('features-widget', featuresTemplate);
};

const registerTernary = async (): Promise<void> => {
  Handlebars.registerHelper('ternary', (cond, v1, v2) => (cond ? v1 : v2));
};

const registerMarkdownFormatter = async (): Promise<void> => {
  Handlebars.registerHelper('markdown', (text: string) => {
    const markedString = marked(text);
    // TODO: find a way to parametrize this option and uncomment
    // markedString = markedString.replace(/<a /, '<a target="_blank" rel="nofollow" ');
    const markedText = new Handlebars.SafeString(markedString);
    return markedText;
  });
};

const registerHelpers = async (): Promise<void> => {
  await registerProductSupportHelper();
  await registerVersionStatHelper();
  await registerFeaturesHelper();
};

const initializeFunctions = async (): Promise<void> => {
  await registerPartials();
  await registerHelpers();
  await registerTernary();
  await registerMarkdownFormatter();
};

export {
  loadTemplate,
  initializeFunctions,
  loadPageTemplate,
  loadIndexTemplate,
};
