#!/usr/bin/env node
/* @copyright Itential, LLC 2019 */

const fs = require('fs-extra');
const path = require('path');

async function createBundle(appOldDir) {
  // set directories
  const artifactDir = path.join(appOldDir, '../artifactTemp');
  const workflowsDir = path.join(appOldDir, 'workflows');

  // read app's package and set names
  const appPackage = fs.readJSONSync(path.join(appOldDir, 'package.json'));
  const originalName = appPackage.name.substring(appPackage.name.lastIndexOf('/') + 1);
  const shortenedName = originalName.replace('app-', '');
  const artifactName = originalName.replace('app', 'bundled-app');

  // create keywords for generated package.json, including required keywords not already present
  const { keywords } = appPackage;
  const keywordsMap = {};
  const requiredKeywords = [
    'IAP',
    'Itential',
    'Pronghorn',
    'Application',
    'App-Artifacts',
    'artifacts',
    shortenedName
  ];
  keywords.forEach((keyword) => {
    keywordsMap[keyword] = true;
  });
  requiredKeywords.forEach((keyword) => {
    if (!keywordsMap[keyword]) keywords.push(keyword);
  });

  const appNewDir = path.join(artifactDir, 'bundles', 'apps', originalName);
  fs.ensureDirSync(appNewDir);

  const ops = [];

  // copy old appDir to bundled hierarchy location
  ops.push(() => fs.copySync(appOldDir, appNewDir));

  // copy readme
  ops.push(() => fs.copySync(path.join(appOldDir, 'README.md'), path.join(artifactDir, 'README.md')));

  // copy changelog
  if (fs.existsSync(path.join(appOldDir, 'CHANGELOG.md'))) {
    ops.push(() => fs.copySync(path.join(appOldDir, 'CHANGELOG.md'), path.join(artifactDir, 'CHANGELOG.md')));
  }

  // copy license
  if (fs.existsSync(path.join(appOldDir, 'LICENSE'))) {
    ops.push(() => fs.copySync(path.join(appOldDir, 'LICENSE'), path.join(artifactDir, 'LICENSE')));
  }

  // create package
  const artifactPackage = {
    name: artifactName,
    version: appPackage.version,
    description: `A bundled version of the ${originalName} to be used in app-artifacts for easy installation`,
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
      deploy: 'npm publish --registry=http://registry.npmjs.org'
    },
    keywords,
    author: 'Itential Artifacts',
    license: 'Apache-2.0',
    repository: appPackage.repository,
    private: false,
    devDependencies: {
      r2: '^2.0.1',
      ajv: '6.10.0',
      'better-ajv-errors': '^0.6.1',
      'fs-extra': '^7.0.1'
    }
  };

  ops.push(() => fs.writeJSONSync(path.join(artifactDir, 'package.json'), artifactPackage, { spaces: 2 }));

  // create manifest
  const manifest = {
    bundleName: originalName,
    version: appPackage.version,
    fingerprint: 'Some verifiable token',
    createdEpoch: Date.now().toString(),
    artifacts: [
      {
        id: `${shortenedName}-app`,
        name: `${shortenedName}-app`,
        type: 'app',
        location: `/bundles/apps/${originalName}`,
        description: artifactPackage.description,
        properties: {
          entryPoint: false
        }
      }
    ]
  };

  // add workflows into artifact
  if (fs.existsSync(workflowsDir)) {
    let workflowFileNames = fs.readdirSync(workflowsDir);

    // if folder isnt empty and only file is not readme
    if (workflowFileNames.length !== 0 && (!(workflowFileNames.length === 1 && workflowFileNames[0].split('.')[1] === 'md'))) {
      // add workflows to correct location in bundle
      ops.push(() => fs.copySync(workflowsDir, path.join(artifactDir, 'bundles', 'workflows')));

      // check for entrypoint
      let entryPointLocation;
      let entryPointOptions;
      if (workflowFileNames.includes('entry.json')) {
        // remove entry.json from list of file names
        workflowFileNames = workflowFileNames.filter(filename => filename !== 'entry.json');

        const entryPointFile = JSON.parse(fs.readFileSync(path.join(workflowsDir, 'entry.json')));
        entryPointLocation = entryPointFile.location;
        entryPointOptions = entryPointFile.options;
      }

      // add workflows to manifest
      workflowFileNames.forEach((filename) => {
        const [filenameNoExt, ext] = filename.split('.');
        if (ext === 'json') {
          const entryPoint = (entryPointLocation && entryPointLocation === filename);
          const workflowObj = {
            id: `workflow-${filenameNoExt}`,
            name: filenameNoExt,
            type: 'workflow',
            location: `/bundles/workflows/${filename}`,
            description: 'Main entry point to artifact',
            properties: {
              entryPoint
            }
          };
          if (entryPoint) {
            workflowObj.properties.entryPointObj = {
              options: entryPointOptions
            };
          }
          manifest.artifacts.push(workflowObj);
        }
      });
    }
  }

  ops.push(() => fs.writeJSONSync(path.join(artifactDir, 'manifest.json'), manifest, { spaces: 2 }));

  // Run the commands in parallel
  try {
    await Promise.all(ops.map(async op => op()));
  } catch (e) {
    throw new Error(e);
  }

  const pathObj = {
    bundlePath: artifactDir,
    bundledAppPath: path.join(artifactDir, 'bundles', 'apps', originalName)
  };
  return pathObj;
}

async function artifactize(entryPathToApp) {
  try {
    const truePath = path.resolve(entryPathToApp);
    const packagePath = path.join(truePath, 'package');
    // remove app from package and move bundle in
    const pathObj = await createBundle(packagePath);
    const { bundlePath } = pathObj;
    fs.removeSync(packagePath);
    fs.moveSync(bundlePath, packagePath);
    return 'Bundle successfully created and old folder system removed';
  } catch (e) {
    throw e;
  }
}

module.exports = { createBundle, artifactize };
