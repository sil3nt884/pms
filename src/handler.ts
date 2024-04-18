import {
  createResolvers,
  createTypeDefs,
  makeSchema
} from '../src/CorePlugins/grapqhql.js'
import { init } from './app.js'
import { TypeSource } from '@graphql-tools/utils/typings/index'

import { ApolloServer } from '@apollo/server'
import {
  startServerAndCreateLambdaHandler,
  handlers
} from '@as-integrations/aws-lambda'

const loadServer = async () => {
  const plugin = await init()
  if (plugin) {
    const typesDefs: any = await createTypeDefs(plugin.config)
    const resolvers = createResolvers(plugin.plugins, plugin.config)
    if (typesDefs) {
      const allTypes: TypeSource | undefined = makeSchema(typesDefs)
      if (allTypes) {
        const server = new ApolloServer({
          typeDefs: allTypes,
          resolvers: resolvers
        })
        return server
      }
    }
  }
}

export const handler = async (event: any, context: any) => {
  const server = await loadServer()
  if (server) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const requestHandler = startServerAndCreateLambdaHandler(
      server,
      handlers.createAPIGatewayProxyEventV2RequestHandler()
    )
    return requestHandler(event, context, console.log)
  }
  return {}
}
