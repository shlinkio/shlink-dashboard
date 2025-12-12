import AdmZip from 'adm-zip';
import chalk from 'chalk';
import fs from 'fs';
import { execSync } from 'node:child_process';

const version = process.env.VERSION;
if (!version) {
  const rightCommand = `VERSION=1.2.3 ${process.argv[1]}`;
  console.log(chalk.red(`You need to provide the package version via env: ${chalk.bold(rightCommand)}`));
  process.exit(1);
}

const fileBaseName = `shlink-dashboard_${version}_dist`;
const versionFileName = `./dist/${fileBaseName}.zip`;

console.log(chalk.cyan(`Generating dist file for version ${chalk.bold(version)}...`));
const zip = new AdmZip();

try {
  if (fs.existsSync(versionFileName)) {
    fs.unlinkSync(versionFileName);
  }

  fs.cpSync('./package.json', './build/package.json');
  fs.cpSync('./package-lock.json', './build/package-lock.json');
  fs.cpSync('./LICENSE', './build/LICENSE');
  fs.cpSync('./README.md', './build/README.md');

  // Install prod dependencies inside build dir
  execSync('npm ci --omit=dev', { cwd: './build' });

  // Move bundled src to node_modules, so that it is treated as an external package
  fs.renameSync('./build/src', './build/node_modules/@shlinkio/dashboard-server');

  zip.addLocalFolder('./build', fileBaseName);
  zip.writeZip(versionFileName);
  console.log(chalk.green('Dist file properly generated'));
} catch (e) {
  console.log(chalk.red('An error occurred while generating dist file'));
  console.log(e);
}
console.log();
