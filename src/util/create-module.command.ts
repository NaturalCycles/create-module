import * as fs from 'fs-extra'
import * as c from 'ansi-colors'
import { Questions } from 'inquirer'
import { kpy } from 'kpy'
import * as Nunjucks from 'nunjucks'
import { tmplDir } from '../cnst/paths.cnst'
import { execCommand } from './exec.util'
import * as inquirer from 'inquirer'
import * as yargs from 'yargs'

export const MODULE_TEMPLATES: string[] = ['nodejs-lib']

const YARN_DEV_DEPS: string[] = [
  '@naturalcycles/semantic-release',
  '@naturalcycles/shared-module',
  '@types/jest',
  '@types/node',
  'jest',
  'jest-junit',
  'prettier',
  'ts-jest',
  'ts-node',
  'tslint',
  'typescript',
  // '',
]

interface Opt extends Answers, TemplateConfig {
  moduleDir: string
  npmFullName: string
  githubFullName: string
  circleCiStatusToken: string // todo
}

interface Answers {
  npmScope: string
  npmModuleName: string
  githubOrg: string
  moduleAuthor: string
  moduleLicense: string
  moduleTemplate: string
  npmAccess: 'public' | 'protected'
}

interface TemplateConfig {
  descr: string
  // [k: string]: string
}

const QUESTIONS: Questions<Answers> = [
  {
    type: 'list',
    name: 'moduleTemplate',
    message: 'Module template',
    default: 'nodejs-lib',
    choices: MODULE_TEMPLATES,
  },
  {
    name: 'npmScope',
    message: 'NPM @scope of the module (e.g `@angular`). Default to empty (no scope).',
    default: '',
    // todo: validate, should start with @ and be valid npm scope
  },
  {
    name: 'npmModuleName',
    message: 'Module name (without scope), e.g `js-lib`',
    // todo: validate with Joi schema
  },
  {
    name: 'githubOrg',
    message: 'GitHub Org / Author, e.g `NaturalCycles`',
    default: 'NaturalCycles',
  },
  {
    name: 'moduleAuthor',
    message: 'package.json author',
    default: 'Natural Cycles Team',
  },
  {
    name: 'moduleLicense',
    message: 'package.json license',
    default: 'MIT',
  },
  {
    name: 'npmAccess',
    message: 'NPM access',
    default: 'public',
    choices: ['public', 'protected'],
  },
]

const DEBUG_ANSWERS: Answers = {
  moduleTemplate: 'nodejs-lib',
  npmScope: '@naturalcycles',
  npmModuleName: 'some-lib',
  githubOrg: 'NaturalCycles',
  moduleAuthor: 'test author',
  moduleLicense: 'MIT',
  npmAccess: 'public',
}

export async function createModuleCommand (): Promise<void> {
  let { moduleDir, debug } = yargs
    .options({
      moduleDir: {
        type: 'string',
        descr: 'Directory to create module in',
      },
      debug: {
        type: 'boolean',
      },
    })
    .argv

  let answers: Answers

  if (debug) {
    moduleDir = moduleDir || './m'
    await fs.emptyDir(moduleDir)
    answers = DEBUG_ANSWERS
  } else {
    moduleDir = moduleDir || process.cwd()
    await ensureDirEmpty(moduleDir)
    answers = await inquirer.prompt(QUESTIONS)
  }

  // console.log(answers)

  const cfg = await readTemplateConfig(answers.moduleTemplate)
  const opt = createOptFromAnswers(answers, cfg, moduleDir)

  await generatePackageJson(opt)

  await copyTemplateFiles(opt)

  await generateReadmeMd(opt)

  await yarnAdd(opt)

  await setupGit(opt)
}

function createOptFromAnswers (answers: Answers, cfg: TemplateConfig, moduleDir: string): Opt {
  return {
    ...answers,
    ...cfg,
    moduleDir,
    npmFullName: `${answers.npmScope}/${answers.npmModuleName}`,
    githubFullName: `${answers.githubOrg}/${answers.npmModuleName}`,
    circleCiStatusToken: '123', // todo
  }
}

/**
 * Directory should be empty
 */
async function ensureDirEmpty (moduleDir: string): Promise<void> {
  await fs.mkdirp(moduleDir)
  const files = await fs.readdir(moduleDir)
  // console.log(files)

  if (files.length) {
    throw new Error(`\n\nPlease make sure your working directory is empty:\n${moduleDir}\n\n`)
  }
}

async function generatePackageJson (opt: Opt): Promise<void> {
  const packageJsonPath = `${opt.moduleDir}/package.json`

  const packageJson = {
    name: opt.npmFullName,
    scripts: {},
    dependencies: {},
    devDependencies: {},
    files: [
      'dist',
      "src",
      "!src/test",
      "!src/**/*.test.ts",
      "!src/**/__snapshots__",
      "!src/**/__exclude",
    ],
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    publishConfig: {
      "access": "public", // todo: question
    },
    "repository": {
      type: "git",
      url: `https://github.com/${opt.githubFullName}`,
    },
    engines: {
      node: '>=10.13',
    },
    version: '0.0.0',
    description: '',
    author: opt.moduleAuthor,
    license: opt.moduleLicense,
  }

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log(`Generated ${c.grey.bold('package.json')}`)
}

async function copyTemplateFiles (opt: Opt): Promise<void> {
  await kpy({
    baseDir: `${tmplDir}/${opt.moduleTemplate}/files`,
    outputDir: opt.moduleDir,
    dotfiles: true,
    verbose: true,
  })
}

async function generateReadmeMd (opt: Opt): Promise<void> {
  const readmePath = `${opt.moduleDir}/readme.md`

  let s = await fs.readFile(readmePath, 'utf8')
  s = await nunjucks().renderString(s, {
    opt,
  })
  await fs.writeFile(readmePath, s)

  console.log(`Generated ${c.grey.bold('readme.md')}`)
}

async function yarnAdd (opt: Opt): Promise<void> {
  const cmd = [`yarn add -D`, ...YARN_DEV_DEPS].join(' ')
  // console.log(`Will do ${c.bold.green(cmd)}`)

  const opts = {
    cwd: opt.moduleDir,
  }

  await execCommand(cmd, true, opts)

  await execCommand(`yarn update-from-shared-module`, true, opts)
}


async function setupGit (opt: Opt): Promise<void> {
  const cmd = [
    `git init`,
    `git remote add origin git@github.com:${opt.githubFullName}.git`,
    `git add -A`,
    `git commit -a -m "feat: init project by create-module"`,
    `git status`,
  ].join(' && ')

  const opts = {
    cwd: opt.moduleDir,
  }

  await execCommand(cmd, true, opts)
}

async function readTemplateConfig (moduleTemplate: string): Promise<TemplateConfig> {
  return fs.readJson(`${tmplDir}/${moduleTemplate}/config.json`)
}

function nunjucks (): typeof Nunjucks {
  const nun = Nunjucks
  nun.configure({
    // So it does NOT escape e.g <br> tags in our email templates
    autoescape: false,
  })
  return nun
}

async function waitForEnterPressed (message = ''): Promise<void> {
  await readline(['', message, c.grey('Press [ENTER] to proceed...'), ''].join('\n'))
}

/**
 * Returns answered input as string
 */
async function readline (message: string): Promise<string> {
  const data = await inquirer.prompt<any>({
    name: 'answer',
    message,
  })
  return data.answer
}
