import Handlebars from 'handlebars';
import { loadTemplate } from './index';
import { Link, NotesByNum } from '../src/common';

const featuresIds = {
  NOTES: 'notes',
  RESOURCES: 'resources',
};

const tabPrefix = 'tab-';
const viewPrefix = 'view-';

const registerNavigation = async (): Promise<void> => {
  const featuresTab = await loadTemplate('features-tab.html') as HandlebarsTemplateDelegate<any>;

  const buildNotesTab = (notes: string, notesByNum: NotesByNum) => {
    const notesToArray = Object.keys(notesByNum).map((key) => ({
      id: key,
      value: notesByNum[key],
    }
    ));
    if (!notes && !notesToArray.length) {
      return null;
    }
    return featuresTab({
      id: `${tabPrefix}${featuresIds.NOTES}`,
      name: `Notes (${notesToArray.length + (notes ? 1 : 0)})`,
    });
  };

  const buildResourcesTab = (spec: string, links: Link[]) => {
    if (!spec && !links.length) {
      return null;
    }
    return featuresTab({
      id: `${tabPrefix}${featuresIds.RESOURCES}`,
      name: `Resources (${links.length + (spec ? 1 : 0)})`,
    });
  };

  Handlebars.registerHelper('features-navigation', (
    notes: string,
    notesByNum: NotesByNum,
    spec: string,
    links: Link[],
  ) => {
    const tabElements = [
      buildNotesTab(notes, notesByNum),
      buildResourcesTab(spec, links),
    ];
    return tabElements.filter((tab) => tab).join('');
  });
};

const registerNotes = async (): Promise<void> => {
  const featuresNotes = await loadTemplate('features-notes.html') as HandlebarsTemplateDelegate<any>;
  Handlebars.registerHelper('features-notes', (
    notes: string,
    notesByNum: NotesByNum,
  ) => {
    const elements = [];
    if (notes) {
      elements.push({
        label: '',
        text: notes,
      });
    }
    Object.keys(notesByNum).forEach((noteKey) => {
      elements.push({
        label: noteKey,
        text: notesByNum[noteKey],
      });
    });
    return featuresNotes({
      id: `${viewPrefix}${featuresIds.NOTES}`,
      elements,
    });
  });
};

const registerResources = async (): Promise<void> => {
  const featuresResources = await loadTemplate('features-resources.html') as HandlebarsTemplateDelegate<any>;
  Handlebars.registerHelper('features-resources', (
    spec: string,
    links: Link[],
  ) => {
    const elements = [...links];
    if (spec) {
      elements.push({
        title: 'Spec',
        url: spec,
      });
    }
    return featuresResources({
      id: `${viewPrefix}${featuresIds.RESOURCES}`,
      elements,
    });
  });
};

const registerFeaturesHelper = async (): Promise<void> => {
  await registerNavigation();
  await registerNotes();
  await registerResources();
};

export default registerFeaturesHelper;
