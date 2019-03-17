## {{ opt.npmFullName }}

> {{ opt.moduleDescr }}

[![npm](https://img.shields.io/npm/v/{{ opt.npmFullName }}/latest.svg)](https://www.npmjs.com/package/{{ opt.npmFullName }})
[![](https://circleci.com/gh/{{ opt.githubFullName }}.svg?style=shield&circle-token={{ opt.circleCiStatusToken }})](https://circleci.com/gh/{{ opt.githubFullName }})
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Features

- ...

# Packaging

- `engines.node >= 10.13`: Latest Node.js LTS
- `main: dist/index.js`: commonjs, es2018
- `types: dist/index.d.ts`: typescript types
- `/src` folder with source `*.ts` files included
