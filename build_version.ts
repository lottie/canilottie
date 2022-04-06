import core from '@actions/core';
import github from '@actions/github';
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

interface PlayerData {
  player: string
  version: string
}

const editFile = async (filePath: string, player: string, version: string) => {
  const file = await readFile(filePath, 'utf-8');
  const fileData = JSON.parse(file);
  if (!fileData.stats[player]) {
    throw new Error('Player does not exist');
  }
  const playerStats = fileData.stats[player];
  const objKeys = Object.keys(playerStats);
  fileData.stats[player][version] = playerStats[objKeys[objKeys.length - 1]];
  const updateFileString = JSON.stringify(fileData, null, 2);
  return writeFile(filePath, updateFileString);
};

const updateFiles = async (player, version) => {
  const dirPath = path.join(process.env.GITHUB_WORKSPACE || './', 'data');
  try {
    const data = (await readdir(
      dirPath,
    )).map((fileName) => `${dirPath}/${fileName}`);
    // console.log(data)
    await Promise.all(
      data.map(async (filePath) => editFile(filePath, player, version)),
    );
  } catch (error) {
    console.log('readFiles error');
    console.log(error);
  }
};

const getPlayerData = async (issueBody: string): Promise<PlayerData> => {
  const split = issueBody.split('\r\n');
  const keys: PlayerData = split.reduce((dict, value) => {
    const keyValue = value.split(':');
    dict[keyValue[0].trim()] = keyValue[1].trim();
    return dict;
  }, {
    player: '',
    version: '',
  });

  return keys;
};

const setOutputs = async (playerData: PlayerData) => {
  const branchName = `${playerData.player}__${playerData.version}`;
  core.setOutput('branch_name', branchName);
  core.setOutput('version', playerData.version);
  core.setOutput('player', playerData.player);
};

async function run() {
  try {
    const issue = github.context.payload.issue;
    if (issue.title.toLowerCase() !== 'new version') {
      throw new Error('not a versioning issue');
    }
    const playerData = await getPlayerData(issue.body);
    if (!playerData.player || !playerData.version) {
      throw new Error('player or version are missing');
    }
    await setOutputs(playerData);
    await updateFiles(playerData.player, playerData.version);
  } catch (error) {
    core.setOutput('cancelled', 'true');
    // core.setFailed(error.message);
  }
}

run();
