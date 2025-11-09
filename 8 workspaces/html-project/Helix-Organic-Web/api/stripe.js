import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function createCheckoutSession(request, response) {
  if (!process.env.STRIPE_SECRET_KEY) {
    response.status(500).json({ error: "Stripe key not configured" });
    return;
  }
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Helix Artifact" },
            unit_amount: 2900,
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/pages/store.html?success=true",
      cancel_url: "http://localhost:3000/pages/store.html?cancelled=true",
    });
    response.json({ url: session.url });
  } catch (error) {
    response.status(500).json({ error: error.message || "Unable to create session" });
  }
}
