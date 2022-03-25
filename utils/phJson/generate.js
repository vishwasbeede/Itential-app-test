#!/usr/bin/env node

const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const glob = require('glob');

const filesToCheck = fs.readFileSync('./utils/phJson/filesToCheck', 'utf8');
const KEYS = ['id', 'title', 'export', 'displayName', 'type', 'summary', 'version', 'src', 'encrypted', 'roles', 'methods', 'views'];
const addKeys = {};
let override = false;
// Edit this to define files to be included in pronghorn.json generation
const files = filesToCheck.split('\n');
console.log(`File paths currently included for generation: ${JSON.stringify(files)}
Change the list at ./utils/phJson/filesToCheck to include or exclude files for generation 
`);

function processView(view) {
  const viewToPush = {};
  viewToPush.path = view.path;
  viewToPush.roles = view.roles;
  if (view.view) { // dialogs don't have view
    viewToPush.view = view.view;
  }
  if (view.icon) { // not mandatory
    viewToPush.icon = view.icon;
  }
  viewToPush.title = view.title;
  viewToPush.type = view.pronghornType;
  viewToPush.template = view.pronghornTemplate;
  return (viewToPush);
}

function processTask(task) {
  const taskToPush = {};
  taskToPush.path = task.path;
  taskToPush.deprecated = !!task.deprecated;
  taskToPush.roles = task.roles;
  taskToPush.template = task.pronghornTemplate;
  taskToPush.title = task.title;
  taskToPush.type = task.pronghornType;
  taskToPush.variables = { incoming: {}, outgoing: {} };
  if (task.incomingVariables !== undefined) {
    task.incomingVariables.forEach((inVar) => {
      taskToPush.variables.incoming[inVar.name] = inVar.type;
    });
  }
  if (task.outgoingVariables !== undefined) {
    task.outgoingVariables.forEach((outVar) => {
      taskToPush.variables.outgoing[outVar.name] = outVar.type;
    });
  }
  return (taskToPush);
}

function checkMethod(method) {
  if (!method.description) {
    console.warn(`Method ${method.name} has no description field. Using empty string`);
  }
  if (!method.summary) {
    console.warn(`Method ${method.name} has no summary field. Using empty string`);
  }
  if (!method.route) {
    console.warn(`Method ${method.name} has no route field`);
  }
  if (!method.roles) {
    console.warn(`Method ${method.name} has no roles field`);
  }
}

function processMethod(method) {
  checkMethod(method);
  const methodToPush = {};
  methodToPush.name = method.name;
  methodToPush.description = method.description;
  if (methodToPush.description === undefined) {
    methodToPush.description = '';
  } else {
    methodToPush.description = methodToPush.description.replace(/\n/g, ' ');
  }
  methodToPush.summary = method.summary;
  if (methodToPush.summary === undefined) {
    methodToPush.summary = '';
  } else {
    methodToPush.summary = methodToPush.summary.replace(/\n/g, ' ');
  }
  methodToPush.deprecated = !!method.deprecated;
  methodToPush.roles = method.roles;
  if (method.route && method.route.type) {
    methodToPush.route = {
      path: method.route.name,
      verb: method.route.type,
    };
  }
  methodToPush.input = [];
  const outputName = method.returns[0].description.split(' ')[0];
  const outputDescription = method.returns[0].description.split(' ');
  outputDescription.shift();
  methodToPush.output = {
    name: outputName,
    description: outputDescription.join(' ').replace(/\n/g, ' '),
    type: method.returns[0].type.names[0],
  };
  if (method.params !== undefined) {
    method.params.forEach((param) => {
      if (param.name !== 'callback') {
        const toPush = {
          name: param.name,
          type: param.type.names[0],
          description: (param.description === undefined) ? '' : param.description.replace(/\n/g, ' '),
        };
        if (toPush.type === 'enum') {
          if (method.task === undefined || method.task === false) {
            console.warn(`enum input found for non-task method ${method.name}!`);
          }
          method.enumerals.forEach((enumeral) => {
            if (enumeral.name[0] === toPush.name) {
              toPush.enumerals = enumeral.value;
              if (enumeral.display_name) {
                [toPush.display_name] = enumeral.display_name;
              }
            }
          });
        }
        methodToPush.input.push(toPush);
        if (param.optional === true) {
          methodToPush.input[methodToPush.input.length - 1].required = false;
        }
        // If this method is a task, look for a tooltip for the current parameter
        if (method.task) {
          // Get the tooltip corresponding to this parameter if it exists. This takes the first
          // matching tooltip, so subsequent entries for the same variable will be ignored.
          const tooltipForParam =
            (method.variableTooltips || [])
              .reduce((found, next) => {
                if (found) return found;
                if (next.variableName === toPush.name) return next;
                return null;
              }, null); // <- Default to null

          if (tooltipForParam) toPush.info = tooltipForParam.value;
        }
      }
    });
  }
  methodToPush.task = method.task;
  return (methodToPush);
}

function pronghornizeJson(json) {
  const methodArray = [];
  const viewArray = [];
  const outputJson = {
    id: 'TBD',
    title: 'TBD',
    export: 'TBD',
    displayName: 'TBD',
    type: 'TBD',
    summary: 'TBD',
    version: 'TBD',
    src: 'TBD',
    encrypted: 'TBD',
    roles: [],
    methods: [],
    views: [],
  };
  json.forEach((block) => {
    switch (block.name) {
      case ('pronghornTitleBlock'): // this is the title block
        outputJson.id = block.pronghornId;
        outputJson.title = block.title;
        outputJson.export = block.export;
        outputJson.displayName = block.displayName;
        [outputJson.type] = block.type.names;
        outputJson.summary = block.summary;
        outputJson.version = block.version;
        outputJson.src = block.src;
        outputJson.encrypted = block.encrypted;
        outputJson.roles = block.roles;
        Object.keys(addKeys).forEach((key) => {
          outputJson[key] = addKeys[key];
        });
        break;
      default: // this is a method block
        if (!block.ignore) {
          if (block.pronghornType === 'method') {
            methodArray.push(processMethod(block));
          } else if (block.pronghornType === 'view') {
            viewArray.push(processView(block));
          } else if (block.pronghornType === 'task') {
            viewArray.push(processTask(block));
          } else {
            console.warn('Unidentified jsdoc block: ');
            console.warn(block);
          }
        }
    }
  });
  outputJson.methods = methodArray;
  outputJson.views = viewArray;
  fs.writeFile(
    './pronghorn.json',
    JSON.stringify(outputJson, null, 2),
    (err) => {
      if (err) {
        console.error(`Error encountered while writing to pronghorn.json:\n${err.stack}`);
      }
    },
  );
}


if (process.argv.includes('-o')) {
  override = true;
}
fs.readFile('./pronghorn.json', 'utf8', (err, data) => {
  if (!err) {
    const jsonData = JSON.parse(data);
    const keys = Object.keys(jsonData);
    keys.forEach((key) => {
      if (!KEYS.includes(key)) {
        if (override) {
          console.warn(`Overriding additional key: ${key}. Its value is: ${JSON.stringify(jsonData[key], null, 4)}`);
        } else {
          console.warn(`Additional field found: ${key}. It will be kept in pronghorn.json. Use 'npm run generate_override' to override it`);
          addKeys[key] = jsonData[key];
        }
      }
    });
  }

  const proms = [];
  const found = [];
  files.forEach((file) => {
    const pathProm = new Promise((resolve, reject) => {
      glob(file, (err2, list) => {
        if (err2) reject();
        if (Array.isArray(list) && list.length !== 0) {
          console.warn(`found js files for ${file}`);
          found.push(file);
          resolve();
        } else {
          console.warn(`files not found for ${file}`);
          resolve();
        }
      });
    });
    proms.push(pathProm);
  });

  Promise.all(proms).then(() => {
    const options = {
      json: true,
      configure: './utils/phJson/jsdoc.conf',
      files: found,
      'no-cache': true,
    };
    jsdoc2md.getTemplateData(options)
      .then((json) => {
        pronghornizeJson(json);
        console.info('pronghorn.json generated');
      })
      .catch((err4) => {
        console.error(`Error parsing files: ${err4.toString()}`);
      });
  });
});
