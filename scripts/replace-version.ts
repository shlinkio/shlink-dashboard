import fs from 'fs';

function replaceVersionPlaceholder(version: string) {
  const staticJsFilesPaths = ['./build/client/assets', './build/server'];
  const versionPlaceholder = '%_VERSION_%';

  staticJsFilesPaths.forEach((dir) => {
    const jsFiles = fs.readdirSync(dir).filter((file) => file.endsWith('.js'));
    jsFiles.forEach((jsFile) => {
      const filePath = `${dir}/${jsFile}`;
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const replaced = fileContent.replace(versionPlaceholder, version);

      fs.writeFileSync(filePath, replaced, 'utf-8');
    });
  });
}

const version = process.env.VERSION;

if (version) {
  replaceVersionPlaceholder(version);
}
