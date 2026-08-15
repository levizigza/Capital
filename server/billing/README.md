# Capital billing server

Minimal Stripe Checkout + webhooks + Customer Portal for Capital.

See:

- [docs/STRIPE_ARCHITECTURE.md](../../docs/STRIPE_ARCHITECTURE.md)
- [docs/STRIPE_SETUP.md](../../docs/STRIPE_SETUP.md)
- [docs/STRIPE_TEST_PLAN.md](../../docs/STRIPE_TEST_PLAN.md)

```bash
cp .env.example .env   # fill sk_test_ / whsec_ / price_
npm install
npm run dev
```

Default listen: `:4242`. Live keys require `FOUNDER_APPROVED_LIVE=true`.
