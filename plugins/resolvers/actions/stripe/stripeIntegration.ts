import specialCurrency from './currencies.json'
import payments from './stripeInstance.js'
const createPaymentIntent = async ({
  amount,
  currency,
  paymentMethodId,
  orderId
}: {
  paymentMethodId: string
  amount: number
  currency: string
  orderId: string
}) => {
  const isSpecial = currency in specialCurrency

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const convertedCurrency = isSpecial ? specialCurrency[currency] : 100
  const amountToPad = amount * convertedCurrency

  const paymentIntent = await payments.paymentIntents.create({
    payment_method: paymentMethodId,
    amount: amountToPad,
    currency,
    description: orderId
  })

  return {
    id: paymentIntent.id,
    status: paymentIntent.status,
    clientSecret: paymentIntent.client_secret
  }
}

const confirmPaymentIntent = async (paymentIntentId: string) => {
  const paymentIntentConfirm = await payments.paymentIntents.confirm(
    paymentIntentId
  )

  return paymentIntentConfirm
}

export const processPayment = async (
  paymentMethodId: string,
  currency: string,
  amount: number,
  orderId: string
) => {
  const { id } = await createPaymentIntent({
    amount,
    currency,
    paymentMethodId,
    orderId
  })
  const results = await confirmPaymentIntent(id)
  return results
}
