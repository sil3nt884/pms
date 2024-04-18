import Stripe from 'stripe'

const key = process.env.STRIPEKEY || ''
const apiVersion = process.env.STRIPEAPIVERSION || ''
const stripeInstance = new Stripe(key, {
  apiVersion: apiVersion as '2022-11-15' // yes stripe static type this ...
})

export default stripeInstance
