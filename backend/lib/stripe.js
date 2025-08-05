import dotenv from "dotenv";
dotenv.config({quiet: true});

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);