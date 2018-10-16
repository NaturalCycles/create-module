## @naturalcycles/create-module

> `npx @naturalcycles/create-module` to bootstrap a new module

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![](https://circleci.com/gh/NaturalCycles/create-module.svg?style=shield&circle-token=cbb20b471eb9c1d5ed975e28c2a79a45671d78ea)](https://circleci.com/gh/NaturalCycles/create-module)

# Usage

    mkdir my-new-module
    cd my-new-module
    npx @naturalcycles/create-module

# Features

- Generates new opinionated project from the _project template_. Currently supported templates:
  - `node-lib`: NodeJS library
- Typescript setup
- Follows the folders conventions of [@naturalcycles/shared-module](https://github.com/NaturalCycles/SharedModule)
- Non-extendable configs
  - `.gitgnore`
  - `.editorconfig`
  - `.codeclimate.yml`
  - `tsconfig.json`, `tsconfig.test.json`
- Extendable configs
  - Jest
  - Prettier
  - TSLint
  - Husky, Lint-staged
- Template-based generation (based on interactive CLI answers)
  - `package.json`
  - `readme.md` with badges, CircleCI build status link
- CircleCI build config
- Adds predefined deps and devDeps to `package.json`, installs them with `yarn`
- Does `git init`, `git add`, `git commit`

## TODO

- Create git repo automatically, do `git push`
- Create CircleCI build (click _start building_ automatically), run first build
- Allow global config with secrets (e.g `NPM_TOKEN`, `GITHUB_TOKEN`) to allow previous commands
- Add more templates, e.g:
  - `js-lib` (universal js lib for both node and browser)
  - `browser-lib`
  - `backend-service` (gets automatically deployed to the cloud, includes all server boilerplate, monitoring, analytics, etc.)
