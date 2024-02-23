import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export default function hasChanged(sourceFile, targetPath) {
  if (!fs.existsSync(targetPath)) {
    console.log(chalk.green('processing, create ') + path.basename(targetPath) + '.');
    return sourceFile;
  }
  const targetStat = fs.statSync(targetPath);
  if (sourceFile.stat && Math.floor(sourceFile.stat.mtimeMs) > Math.ceil(targetStat.mtimeMs)) {
    console.log(chalk.yellow('processing, update ') + path.basename(targetPath) + '.');
    return sourceFile;
  }
}
