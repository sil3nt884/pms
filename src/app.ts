import yaml from 'js-yaml'
import { readFile, readdir, access, constants } from 'fs/promises'
import path from 'path'
import { expressPlugin } from './CorePlugins/express.js'
import { graphQLInit } from './CorePlugins/grapqhql.js'
import * as dotenv from 'dotenv'
dotenv.config()

const loadEnablePlugins = async (folder: string, enabledPlugins: string[]) => {
  const loaded = await Promise.all(
    enabledPlugins.map(async (plugin: string) => {
      const loadedPlugin = await import(
        `${path.resolve(`${folder}/${plugin}`)}`
      )
      return {
        ...loadedPlugin
      }
    })
  )
  return loaded
}
const loadPlugins = async (folder: string, enablePlugins: string[]) => {
  const detectedPlugins = await readdir(path.resolve(folder))
  const enabledPlugins = detectedPlugins.filter(plugin =>
    enablePlugins.includes(plugin)
  )
  const notEnabledPlugins = detectedPlugins.filter(
    plugin => !enablePlugins.includes(plugin)
  )

  if (enabledPlugins.length) {
    return await loadEnablePlugins(folder, enabledPlugins)
  }
  if (notEnabledPlugins.length) {
    console.log('plugins not enabled', notEnabledPlugins)
  } else if (!enabledPlugins.length && !notEnabledPlugins.length) {
    console.log('no plugins detected which are enabled.')
  }
  return
}

const validatePluginsConfig = (
  plugins: string[],
  config: Record<string, object>
) => {
  plugins.forEach((plugin: string) => {
    const key = Object.keys(plugin)[0]
    if (!(key in config)) {
      throw new Error(`no valid config found for plugin : ${key}`)
    }
  })
  console.log('all plugins have valid config')
}

const availablePlugins = (
  enabledPlugins: Record<string, () => void>[],
  config: Record<string, any>
) => {
  let plugins: Record<string, () => void>[]
  const setPlugins = () => {
    if (!plugins) {
      plugins = enabledPlugins
    }
  }
  setPlugins()
  return {
    getPlugins: () => {
      return { plugins, config }
    }
  }
}

export const configLoad = async () => {
  let config: unknown
  const loadConfig = async () => {
    if (!config) {
      await access(path.resolve('config.yaml'), constants.F_OK)
      const yamlFile = await readFile('config.yaml', 'utf-8')
      config = yaml.load(yamlFile)
    }
    return config
  }
  await loadConfig()
  return {
    get: () => {
      return config
    }
  }
}

export type Config = {
  config: {
    pluginFolder: string
    enablePlugins: string[]
  }
}

export const init = async () => {
  try {
    const config = (await configLoad()).get() as Config
    console.log('config loaded successfully', config)
    const {
      config: { pluginFolder, enablePlugins }
    } = config
    const plugins = await loadPlugins(pluginFolder, enablePlugins)
    if (plugins) {
      validatePluginsConfig(plugins, config)
      return availablePlugins(plugins, config).getPlugins()
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
    }
  }
}

const getCorePluginConfigforRestApi = (config: Record<string, any>) => {
  const availableCorePlugins: Record<string, any> = {
    express: expressPlugin
  }
  const { config: cfg } = config
  const {
    corePlugin: { name, htmlFolder }
  } = cfg
  const requiredConfig = {
    core: availableCorePlugins[name].app,
    folder: htmlFolder,
    express: availableCorePlugins[name]
  }

  return requiredConfig
}

const initCorePlugin = (
  config: Record<string, any>,
  plugins: Record<string, () => void>[]
) => {
  if (!config.config.corePlugin.enableGraphQL) {
    const { core, express, folder } = getCorePluginConfigforRestApi(config)
    const requiredConfig = {
      core,
      plugins,
      config,
      folder
    }
    express.init(requiredConfig)
  }
  graphQLInit(plugins, config)
  const functionKeys = Object.keys(config)
    .map(key => {
      return key
    })
    .filter(key => {
      const { type } = config[key]
      return type === 'function'
    })
  functionKeys.forEach((key: string) => {
    const functions = plugins.filter(plugin => plugin[key])
    functions.forEach(fn => {
      fn[key]()
    })
  })
}

export const main = async () => {
  let plugins
  if (!plugins) {
    plugins = await init()
  }

  if (plugins) {
    initCorePlugin(plugins.config, plugins.plugins)
    return {
      exposedPlugins: plugins
    }
  }
}
