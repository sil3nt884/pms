import express, { Express } from 'express'

type routes =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'
type config = { core: Express; folder: string; config: any; plugins: any }
export const expressInit = ({ core, folder, config, plugins }: config) => {
  core.use(express.static(folder))
  plugins.forEach((plugin: any) => {
    const key = Object.keys(plugin)[0]
    const pluginConfig = config[key]
    const { method, path }: { method: routes; path: string } = pluginConfig
    if (method) {
      core[method](path, plugin[key])
    }
  })
  console.log(`all plugins loaded`)
  const port = config.config.corePlugin.port
  core.listen(port)
  console.log(`plugin server started at ${port}`)
}
