import { createNodePlatform } from '@boba-cli/machine/node'
import run from './index.js'

run(createNodePlatform()).catch(console.error)
