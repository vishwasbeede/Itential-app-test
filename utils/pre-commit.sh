#!/bin/sh

#exit on any failure in the pipeline
set -e

# --------------------------------------------------
# pre-commit
# --------------------------------------------------
# Contains the standard set of tasks to run before
# committing changes to the repo. If any tasks fail
# then the commit will be aborted.
# --------------------------------------------------

printf "%b" "Running pre-commit hooks...\\n"

# security audit on the code
if ! npm audit --registry=https://registry.npmjs.org; then
    echo "Fixing vulnerabilities.";
    npm audit fix --registry=https://registry.npmjs.org;
    echo "Running audit scan again.";
    npm audit --registry=https://registry.npmjs.org;
fi

# lint the code
npm run lint

# check if pronghorn.json and pronghorn_temp.json are different, prompt user if they are okay with the auto-generated file
pronghornJsonDiff=$(git diff pronghorn.json)
if [ -n "$pronghornJsonDiff" ]; then
    read -p "You have manually changed pronghorn.json. We're going to overwrite pronghorn.json and api.md with JSDocs. Your changes will be lost. If you have not annotated your cog.js, please do so before commiting. Overwrite pronghorn.json? (Y/N): " confirmOverwrite;
    if ! ([ $confirmOverwrite ] && [[ $confirmOverwrite == [yY] || $confirmOverwrite == [yY][eE][sS] ]]); then
        exit 1;
    fi
fi

# generate pronghorn.json and api.md from jsdocs
npm run generate
npm run docs

# git add pronghorn.json and api.md
git add pronghorn.json
git add api.md

# test the code
npm run test:unit

printf "%b" "Finished running pre-commit hooks\\n"
