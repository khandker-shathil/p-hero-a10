import 'server-only'

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.BILLING_SECRET_KEY) 