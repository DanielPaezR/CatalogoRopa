import Stripe from 'stripe'

let client: Stripe | null = null

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  }
  return client
}
