# Approved payment mechanisms

When classification = **READY_TO_BUY**:

## Priority order (simplest first)

1. **Stripe Payment Link** (preferred when account + approved SKU exist)  
2. **Stripe Checkout / invoice** created manually by founder in Dashboard  
3. **Manual invoice** (PDF) + bank transfer — only if buyer requires  
4. **In-app automated billing** — use when finished; **do not block** a ready buyer waiting on it  

## Do not

- Delay close because subscription automation is unfinished  
- Send unpaid “trust me” access without founder policy  
- Invent Payment Link URLs  

## Stripe Payment Link request

When READY_TO_BUY and founder wants a Payment Link, fill and keep in the call folder:

```markdown
# Stripe Payment Link request — [call id]

- status: REQUESTED | CREATED | SENT | PAID | CANCELLED
- requested_at:
- customer_name_or_org:
- customer_email: (provided by customer — never guessed)
- sku_id: (must exist in PRICING_HYPOTHESIS founder-approved table)
- amount:
- currency:
- product_description: (shipped scope only)
- quantity:
- allow_promotion_codes: false
- collect_tax: founder decision
- success_url / after_payment: optional
- stripe_payment_link_url: (filled when created — never fabricate)
- created_by_founder_at:
```

### Generator note

`src/business/founderSalesCopilot` can emit this request object. It does **not** call Stripe APIs or create links without founder credentials/action.
