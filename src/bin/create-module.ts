#!/usr/bin/env node

import { createModuleUtil } from '../util/create-module.util'

createModuleUtil.createModule()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
