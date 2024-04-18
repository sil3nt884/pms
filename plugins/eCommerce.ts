import { resolvers } from './resolvers/index.js'

export const eCommerce = () => {
  const allResolvers = resolvers()
  return {
    queries: {
      ...allResolvers.queries
    },
    mutations: {
      ...allResolvers.mutations
    }
  }
}
