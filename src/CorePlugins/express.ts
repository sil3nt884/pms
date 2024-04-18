import express from 'express'
import { expressInit as init } from './expressInit.js'
const app = express()
const expressPlugin = { app, init }

export { expressPlugin }
