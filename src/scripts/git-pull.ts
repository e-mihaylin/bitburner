import { NS } from './types/ns.d';
import { Config } from './types/git-pull';

const config: Config = {
  githubUrl: `https://raw.githubusercontent.com/e-mihaylin/bitburner/master/src/`,
  extensions: ['js', 'jsx', 'ts', 'tsx', 'txt', 'json'],
  newFiles: [],
  excludeFiles: [],
};

export const main = async (ns: NS): Promise<void> => {
  const { githubUrl, extensions, newFiles, excludeFiles }: Config = config;
  const homeFiles: string[] = ns
    .ls('home')
    .filter((file: string) => extensions.includes(file.split('.').pop()!));
  const targetFiles: string[] = [...newFiles, ...homeFiles].filter(
    (file: string) => !excludeFiles.includes(file),
  );
  for (const filePath of targetFiles) {
    const remoteFilePath: string = githubUrl + filePath;
    ns.tprint(`Trying to update ${filePath} from ${remoteFilePath}`);
    if (await ns.wget(`${remoteFilePath}?ts=${new Date().getTime()}`, `/${filePath}`)) {
      ns.tprint(`SUCCESS: Updated ${filePath} to the latest from ${remoteFilePath}`);
    } else {
      ns.tprint(
        `ERROR: ${filePath} was not updated. File is running or not found at ${remoteFilePath}`,
      );
    }
  }
};