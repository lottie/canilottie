import {
  readFile, readdir, mkdir,
} from 'fs/promises';
import { join, extname } from 'path';
import { CanIUseData } from '../src/common';

const sourceDataDir = './data';
const buildDir = './build';
const destDir = './dist';
const apiDir = join(destDir, 'api');

type DirName = 'source' | 'build' | 'dest' | 'api'

const dirPaths = {
  source: sourceDataDir,
  build: buildDir,
  dest: destDir,
  api: apiDir,
};

export const loadFile = async (filename: string): Promise<CanIUseData> => {
  const buf = await readFile(join(sourceDataDir, filename));
  return JSON.parse(buf.toString());
};

export const getSourceDirListing = async (): Promise<string[]> => readdir(sourceDataDir);

export const createTargetDirs = async (): Promise<void> => {
  await mkdir(destDir, { mode: 0o755, recursive: true });
  await mkdir(buildDir, { mode: 0o755, recursive: true });
};

export const getDirPath = (name: DirName): string => dirPaths[name];

export const jsonFilenameWithoutExtension = (jsonFilename: string): string => jsonFilename.slice(
  0,
  jsonFilename.length - extname(jsonFilename).length,
);

export const htmlFilenameFromJSONFilename = (jsonFilename: string): string => `${jsonFilenameWithoutExtension(jsonFilename)}.html`;