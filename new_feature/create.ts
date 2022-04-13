import * as github from '@actions/github';
import * as core from '@actions/core';
import { readdir, readFile, writeFile, access } from 'fs/promises';
import path from 'path';

const template = {
  title: "",
  description: "",
  spec: "",
  status: "ls",
  links: [],
  bugs: [],
  categories: [],
  stats: {
  },
  notes_by_num: {},
  parent: "",
  keywords: ""
}

const templateExtension = '.json';

interface FeatureData {
  title: string
  description: string
  filename: string
  template: string
  parent: string
}

const getRootPath = () => process.env.GITHUB_WORKSPACE || '../';
const dataFolder = 'data';

const getTemplatePathFromDataFolder = async() => {
  
  const dirPath = path.join(getRootPath(), dataFolder);
  const files = await readdir(dirPath)
  return files[0];
}

const checkFileExists = async(filePath: string): Promise<boolean> => {
  try {
    return !!(await access(filePath));
  } catch (error) {
    return false
  }
}

const buildFileNameWithExtension = (filename: string) => {
  const extension = filename.substr(filename.lastIndexOf('.')) === templateExtension
      ? ''
      : templateExtension
  return `${filename}${extension}`
}

const getTemplateReference = async (templatePath: string) => {
  templatePath = buildFileNameWithExtension(templatePath);
  const dirPath = path.join(getRootPath(), dataFolder);
  if (!templatePath || !(await checkFileExists(`${dirPath}/${templatePath}`))) {
    templatePath = await getTemplatePathFromDataFolder();
  }
  const file = await readFile(`${dirPath}/${templatePath}`, 'utf-8');
  const fileData = JSON.parse(file);
  return fileData;
}

const createFile = async (featureData: FeatureData) => {
  try {
    const templateReference = await getTemplateReference(featureData.template);
    const templateData = {
      ...template,
    }
    templateData.title = featureData.title
    templateData.description = featureData.description
    templateData.parent = featureData.parent
    templateData.stats = templateReference.stats
    const updateFileString = JSON.stringify(templateData, null, 2);
    const fileName = buildFileNameWithExtension(featureData.filename);
    const filePath = path.join(getRootPath(), dataFolder, fileName);
    return writeFile(filePath, updateFileString);
  } catch (error) {
    console.log('readFiles error');
    console.log(error);
  }
};

const getFeatureData = async (issueBody: string): Promise<FeatureData> => {
  const split = issueBody.split('\r\n');
  const keys: FeatureData = split.reduce((dict, value) => {
    const keyValue = value.split(':');
    dict[keyValue[0].trim()] = keyValue[1].trim();
    return dict;
  }, {
    title: '',
    description: '',
    filename: '',
    template: '',
    parent: '',
  });

  return keys;
};

const setOutputs = async (featureData: FeatureData, issue_number: string) => {
  const branchName = `feature_${featureData.filename}`;
  core.setOutput('branch_name', branchName);
  core.setOutput('feature_title', featureData.title);
  core.setOutput('issue_number', issue_number);
};

async function run() {
  try {
    const issue = github.context.payload.issue;
    const featureData = await getFeatureData(issue.body);
    if (!featureData.filename) {
      throw new Error('filename is missing');
    }
    await setOutputs(featureData, issue.number.toString());
    await createFile(featureData);
  } catch (error) {
    console.log(error);
    core.setOutput('cancelled', 'true');
    // core.setFailed(error.message);
  }
}

run();
