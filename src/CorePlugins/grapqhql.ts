import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { readdir } from 'fs/promises'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLScalarType } from 'graphql'
import { TypeSource } from '@graphql-tools/utils/typings/index'
import path from 'path'

type resolves = {
  JSON: GraphQLScalarType
  Query: Record<string, any>
  Mutation: Record<string, any>
}

// eslint-disable-next-line max-lines-per-function
export const createResolvers = (plugins: any, config: any): resolves => {
  const resolvers = plugins
    .map((plugin: Record<string, any>) => {
      const key = Object.keys(plugin)[0]
      const pluginConfig = config[key]
      if (pluginConfig.type === 'graphQL') {
        return {
          [key]: plugin[key]
        }
      }
    })
    .reduce((acc: object, plugin: object) => ({ ...acc, ...plugin }))
  const [key] = Object.keys(resolvers)
  const allResolvers = resolvers[key]
  const pluginResolvers = allResolvers()
  const mutations = pluginResolvers.mutations
  const queries = pluginResolvers.queries
  const jsonScaler = new GraphQLScalarType({
    name: 'JSON',
    description: 'JSON Scaler',
    parseValue(value) {
      if (typeof value === 'object') {
        return value
      }
      throw new Error('GraphQL Date Scalar parser expected a `Object`')
    }
  })

  return {
    JSON: jsonScaler,
    Query: { ...queries },
    Mutation: { ...mutations }
  }
}

const returnAllTypeDefs = async ({
  typedefsFolder,
  typedefs
}: {
  typedefsFolder: string
  typedefs: string[]
}) => {
  return Promise.all(
    typedefs.map(async typedef => {
      const type = await import(
        `${path.resolve(`${typedefsFolder}/${typedef.split('.')[0]}.js`)}`
      )
      const key = Object.keys(type)[0]
      return type[key]
    })
  )
}

const getAllTypedefs = async ({
  typedefsFolder,
  typedefs
}: {
  typedefsFolder: string
  typedefs: string[]
}) => {
  try {
    return returnAllTypeDefs({ typedefs, typedefsFolder })
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message)
    }
  }
}

export const createTypeDefs = async (config: Record<string, any>) => {
  const {
    config: {
      corePlugin: { typedefsFolder }
    }
  } = config
  const typedefs = await readdir(path.resolve(typedefsFolder))
  return getAllTypedefs({ typedefsFolder, typedefs })
}

const createGraphQLServer = async ({
  allTypes,
  allResolvers
}: {
  allTypes: TypeSource
  allResolvers: resolves
}) => {
  const server = new ApolloServer({
    typeDefs: allTypes,
    resolvers: { ...allResolvers }
  })

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
  })
  console.log(`🚀  Server ready at ${url}`)
}

export const makeSchema = (allTypes: TypeSource): TypeSource | undefined => {
  try {
    return makeExecutableSchema({
      typeDefs: [allTypes]
    })
  } catch (e) {
    if (e instanceof Error) {
      console.log('error', e.message)
    }
  }
}

export const graphQLInit = async (plugins: any, config: any): Promise<void> => {
  if (!config.config.corePlugin.typedefsFolder) {
    throw new Error('types definitions not config not present')
  }
  const allResolvers = createResolvers(plugins, config)
  const typedefs: any = await createTypeDefs(config)

  if (!typedefs) {
    throw new Error('no types defined')
  }
  const allTypes = makeSchema(typedefs)

  if (allTypes) {
    createGraphQLServer({ allTypes, allResolvers })
  }
}
