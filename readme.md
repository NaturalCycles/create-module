## @naturalcycles/create-module

> `npx @naturalcycles/create-module` to bootstrap a new module

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![](https://circleci.com/gh/NaturalCycles/create-module.svg?style=shield&circle-token=cbb20b471eb9c1d5ed975e28c2a79a45671d78ea)](https://circleci.com/gh/NaturalCycles/create-module)

# Usage

Create GitHub repository manually.

    mkdir my-new-module
    cd my-new-module
    npx @naturalcycles/create-module
    
    git push
    
    CircleCI > "Start building", cancel, add NPM_TOKEN, GH_TOKEN, restart Workflow

# Features

- Generates new opinionated project from the _project template_. Currently supported templates:
  - `nodejs-lib`: NodeJS library
  - more to come...
- Template-based generation (based on interactive CLI answers)
  - `package.json`
  - `readme.md` with badges, CircleCI build status link
- Adds predefined deps and devDeps (e.g `prettier`, `jest`, `typescript` etc.) to `package.json`, installs them with `yarn`
- Typescript setup (`tsonfig.json`, etc)
- Gets all the goodies from [@naturalcycles/shared-module](https://github.com/NaturalCycles/SharedModule):
  - Folders conventions
  - All yarn commands, e.g `prettier-all`, `build`, `bt`, `update-from-shared-module`, `test-ci`, `clean-dist`, etc
  - DevDeps that are needed for these commands (`husky`, `lint-staged`, etc)
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
- CircleCI setup
- CodeClimate setup (via `.codeclimate.yml` and CircleCI)
- Git setup (`git init`, `git add`, `git commit`)

## TODO

- Create git repo automatically, do `git push`
- Create CircleCI build (click _start building_ automatically), run first build
- Allow global config with secrets (e.g `NPM_TOKEN`, `GITHUB_TOKEN`) to allow previous commands
- Add more templates, e.g:
  - `js-lib` (universal js lib for both node and browser)
  - `browser-lib`
  - `backend-service` (gets automatically deployed to the cloud, includes all server boilerplate, monitoring, analytics, etc.)
