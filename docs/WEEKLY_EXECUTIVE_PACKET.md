---
id: docs/WEEKLY_EXECUTIVE_PACKET
title: Weekly Executive Packet
status: living
last_updated: "2026-08-14"
owner: UNKNOWN
schema_version: "1"
---

# Weekly Executive Packet

**Product reminder:** Harbor is the product. This packet is the founder’s **one-page ops digest** so company health is visible without touring every subsystem.

## Sections (every week)

1. WHAT HAPPENED  
2. CUSTOMER TRUTH  
3. PRODUCT TRUTH  
4. DEMAND  
5. REVENUE  
6. CONTRIBUTION PROFIT  
7. CASH  
8. RETENTION  
9. SALES PIPELINE  
10. EXPERIMENT RESULTS  
11. AGENT PERFORMANCE  
12. FAILURES  
13. RISKS  
14. OPPORTUNITIES  
15. DECISIONS REQUIRED FROM FOUNDER  
16. AUTOMATIC ACTIONS PLANNED FOR NEXT WEEK  

Missing facts render as **UNKNOWN** — never invent revenue, CAC, LTV, or customer quotes.

## Founder decisions

Every recommendation requiring founder judgment includes:

- evidence  
- expected upside  
- cost  
- confidence  
- reversibility  
- worst case  
- alternative  

## Code

`src/business/weeklyPacket/`

Inputs are typed snapshots from ops systems (VoC, product, sales, retention, agents, economics). The generator assembles the packet; it does not scrape live APIs by itself.
