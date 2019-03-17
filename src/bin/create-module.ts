#!/usr/bin/env node

import { createModuleCommand } from '../util/create-module.command'

createModuleCommand().catch(err => {
  console.error(err)
  process.exit(1)
})
