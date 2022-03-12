import Handlebars from 'handlebars';
import { join } from 'path';
import {
  readFile,
} from 'fs/promises';

const templateDir = './templates';
const loadTemplate = async (filename: string): Promise<HandlebarsTemplateDelegate<any>> => {
  const buf = await readFile(join(templateDir, filename));
  return Handlebars.compile(buf.toString());
};

export {
  loadTemplate,
};
