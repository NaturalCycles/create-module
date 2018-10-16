import { Questions } from 'inquirer'
import * as inquirer from 'inquirer'
import * as fs from 'fs-extra'
import * as Nunjucks from 'nunjucks'
import * as cpx from 'cpx'
import chalk from 'chalk'
import { packageJsonTemplate } from '../tmpl/package.json.tmpl'
import { tmplDir } from '../cnst/paths.cnst'
import { execCommand } from './exec.util'

const DEFAULT_MODULE_DIR = process.cwd()
// const DEFAULT_MODULE_DIR = process.cwd() + '/m' // uncomment to debug

export const MODULE_TEMPLATES: string[] = [
  'node-lib',
]

const YARN_DEV_DEPS: string[] = [
  '@naturalcycles/shared-module',
  '@types/node@^10.0.0',
  '@types/jest',
  'prettier',
  'tslint',
  'typescript@^3.0.0',
  'ts-node',
  'jest',
  'ts-jest',
  'jest-junit',
  // '',
]

interface Answers extends TemplateConfig {
  moduleName: string
  moduleDir: string
  moduleAuthor: string
  moduleLicense: string
  moduleTemplate: string
}

interface TemplateConfig {
  descr: string
  [k: string]: string
}

const QUESTIONS: Questions<Answers> = [
  {
    name: 'moduleName',
    message: 'Module name (e.g `@naturalcycles/js-lib`)',
    // default: 'qqq', // uncomment for debugging
    // todo: validate with Joi schema when `@naturalcycles/lib-nodejs` is ready
  },
  {
    name: 'moduleDir',
    message: 'Directory to initialize project in',
    default: DEFAULT_MODULE_DIR,
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
    type: 'list',
    name: 'moduleTemplate',
    message: 'Module template',
    default: 'node-lib',
    choices: MODULE_TEMPLATES,
  },
]


class CreateModuleUtil {
  async createModule (): Promise<void> {
    // console.log('hello!', process.argv, process.cwd())

    const answers = await inquirer.prompt(QUESTIONS)

    Object.assign(answers, await this.readTemplateConfig(answers), {
      circleCiStatusToken: '123', // todo
    })

    // console.log(answers)

    await this.createModuleDir(answers)

    await this.generatePackageJson(answers)

    await this.copyTemplateFiles(answers)

    await this.generateReadmeMd(answers)

    await this.yarnAdd(answers)

    await this.validateProject(answers)

    await this.setupGit(answers)

    // todo: git add remote (need to exist prior!), git commit -A -m "init", git push :)
    // todo: automatically Create Repo in github

    // todo: automatically do "start building" in CircleCI, so it will build and `npm publish` first version!:)
  }

  private async setupGit (answers: Answers): Promise<void> {
    const cmd = `git init && git add -A && git commit -a -m "init project by create-module" && git status`
    await this.waitForEnterPressed(`Will do ${chalk.bold.green(cmd)}`)

    const opts = {
      cwd: answers.moduleDir,
    }

    await execCommand(cmd, true, opts)
  }

  private async validateProject (answers: Answers): Promise<void> {
    const cmd = `yarn build`
    await this.waitForEnterPressed(`Will do ${chalk.bold.green(cmd)} to validate the project`)

    const opts = {
      cwd: answers.moduleDir,
    }

    await execCommand(cmd, true, opts)
  }

  private async yarnAdd (answers: Answers): Promise<void> {
    const cmd = [`yarn add`, ...YARN_DEV_DEPS].join(' ')
    await this.waitForEnterPressed(`Will do ${chalk.bold.green(cmd)}`)

    const opts = {
      cwd: answers.moduleDir,
    }

    await execCommand(cmd, true, opts)

    await execCommand(`yarn update-from-shared-module`, true, opts)
  }

  private async generateReadmeMd (answers: Answers): Promise<void> {
    const readmePath = `${answers.moduleDir}/readme.md`
    await this.waitForEnterPressed(`Will generate ${chalk.bold.green('readme.md')}`)
    let s = await fs.readFile(readmePath, 'utf8')
    s = await this.nunjucks().renderString(s, {
      ...answers,
    })
    await fs.writeFile(readmePath, s)
  }

  private async copyTemplateFiles (answers: Answers): Promise<void> {
    const filesPath = `${tmplDir}/${answers.moduleTemplate}/files/**/{*,.*}`
    await this.waitForEnterPressed(`Will copy template files from ${filesPath}`)
    await cpx.copy(filesPath, answers.moduleDir)
  }

  private async generatePackageJson (answers: Answers): Promise<void> {
    const packageJsonPath = `${answers.moduleDir}/package.json`
    await this.waitForEnterPressed(`Will generate ${packageJsonPath}`)

    const packageJson = {
      name: answers.moduleName,
      ...packageJsonTemplate(),
      author: answers.moduleAuthor,
      license: answers.moduleLicense,
    }

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
  }

  private async createModuleDir (answers: Answers): Promise<void> {
    await this.waitForEnterPressed(`Will create directory ${answers.moduleDir}`)
    await fs.mkdirp(answers.moduleDir)
  }

  private async readTemplateConfig (answers: Answers): Promise<TemplateConfig> {
    return fs.readJson(`${tmplDir}/${answers.moduleTemplate}/config.json`)
  }

  nunjucks (): typeof Nunjucks {
    const nun = Nunjucks
    nun.configure({
      // So it does NOT escape e.g <br> tags in our email templates
      autoescape: false,
    })
    return nun
  }

  async waitForEnterPressed (message = ''): Promise<void> {
    await this.readline(['', message, chalk.grey('Press [ENTER] to proceed...'), ''].join('\n'))
  }

  /**
   * Returns answered input as string
   */
  async readline (message: string): Promise<string> {
    const data = await inquirer.prompt<any>({
      name: 'answer',
      message,
    })
    return data.answer
  }
}

export const createModuleUtil = new CreateModuleUtil()

