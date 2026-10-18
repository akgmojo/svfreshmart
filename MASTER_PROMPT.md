# SV Freshmart — Master Specification & Product Scope

# 80. PRODUCT SCOPE — V1 VS LATER

## IMPORTANT DEVELOPMENT RULE

Build **V1 first**.

Do NOT implement future features just because the architecture can support them.

The goal of V1 is to launch a reliable Bangalore grocery e-commerce platform with the smallest practical feature set.

Future functionality should be architected for later expansion but should NOT unnecessarily delay V1.

---

# V1 — MUST HAVE FOR LAUNCH

V1 must contain only the functionality required to run Same / SV Freshmart as a real online grocery business.

## A. CUSTOMER WEBSITE

Must have:

- Homepage
- Product catalogue
- Categories
- Product search
- Product detail pages
- Product images
- Product descriptions
- Product variations
- Quantity/unit selection
- Price per variation
- Stock per variation
- Add to cart
- Cart
- Checkout
- Customer login
- Mobile OTP
- Customer account
- My Orders
- Order details
- Saved addresses
- Delivery availability check
- Bangalore delivery zones
- Delivery charges
- Payment
- Order confirmation

---

# B. PRODUCT SYSTEM

V1 must support:

### Weight
- 50g
- 100g
- 250g
- 500g
- 1kg
- 2kg
- 5kg
- 10kg

### Pieces
- 1 piece
- 2 pieces
- 5 pieces
- 10 pieces

### Volume
- 100ml
- 250ml
- 500ml
- 1L

### Packaging
- Pack
- Box
- Bundle
where required.

Each variation must have:
- Variant SKU
- Quantity
- Unit
- Price
- MRP
- Stock
- Active/inactive status

---

# C. CUSTOMER ACCOUNT

V1:
- Mobile OTP login
- Registration
- Login
- Logout
- Profile
- Addresses
- My Orders
- Order details

Customer must only see their own orders.

---

# D. CART

V1:
- Add product variation
- Change quantity
- Remove item
- Update cart
- Exact variation display
- Exact price
- Stock validation

Example:
Green Chilli
250g × 2
₹28 each
₹56 subtotal

---

# E. CHECKOUT

V1:
- Customer authentication
- Address selection
- New address
- Pincode validation
- Delivery availability
- Delivery charge
- Order summary
- Final server-side price validation
- Final stock validation
- Payment

Keep checkout simple.

---

# F. PAYMENT

V1:

Implement ONE reliable Indian payment gateway.
Preferred:
Razorpay
or another suitable Indian gateway based on availability.

Support:
- Payment creation
- Payment verification
- Webhook
- Success
- Failure
- Retry
- Refund where required

Do not implement multiple payment providers in V1.
Create an abstraction so another provider can be added later.

---

# G. ORDER MANAGEMENT

V1 order statuses:
- Pending Payment
- Confirmed
- Processing
- Packed
- Out for Delivery
- Delivered
- Cancelled
- Refunded

Admin can update status.
Customer can see status.

---

# H. INVENTORY

V1:
- Variation-level stock
- Stock deduction after successful order/payment according to the chosen order/payment strategy
- Out-of-stock handling
- Low-stock visibility
- Stock validation
- Prevent negative stock
- Prevent overselling

---

# I. ADMIN PANEL

V1 admin must support:

### Dashboard
- Orders
- Sales
- Pending orders
- Low stock
- Out of stock

### Products
- Create
- Edit
- Disable
- Categories
- Images

### Variations
- Create
- Edit
- Price
- MRP
- Stock
- SKU

### Orders
- View
- Search
- Filter
- Update status
- View customer
- View address
- View items

---

# J. EXCEL PRICE & STOCK MANAGEMENT

This is a V1 feature.

Admin must be able to:
Download template → Edit Excel → Upload → Validate → Preview → Confirm → Update → Log changes

V1 Excel should support:
- Product SKU
- Variant SKU
- Product Name
- Quantity
- Unit
- Selling Price
- MRP
- Stock Quantity
- Stock Status
- Product Status
- Category
- Image URL

---

# K. EXCEL SAFETY

V1 must have:
- Duplicate SKU validation
- Missing SKU validation
- Invalid price validation
- Invalid stock validation
- Invalid quantity/unit validation
- Preview before update
- Large price change warning
- Import history
- Error report

Critical validation errors must prevent the update.

---

# L. BANGALORE DELIVERY

V1:
- Pincode-based delivery
- Configurable delivery zones
- Delivery charge
- Free delivery threshold
- Minimum order value
- Delivery availability check

Do not build sophisticated route optimization in V1.

---

# M. SECURITY

V1 must include:
- Secure customer authentication
- OTP rate limiting
- Admin authentication
- Role-based access
- Customer/order authorization
- API authorization
- Secure cookies
- Input validation
- File upload validation
- Excel validation
- Payment webhook verification
- Environment secrets
- Audit logs for important admin actions

---

# N. SEO

V1:
- SEO-friendly URLs
- Product metadata
- Category metadata
- Sitemap
- Robots.txt
- Canonical URLs
- Product structured data
- Open Graph

---

# O. ANALYTICS

V1:
- Google Analytics 4
- Google Tag Manager where appropriate
- Ecommerce events
- Purchase tracking

Minimum events:
- page_view
- view_item
- search
- add_to_cart
- view_cart
- begin_checkout
- purchase

---

# P. MOBILE

V1 must be fully mobile-first.

The complete customer journey must work on mobile:
Browse → Product → Cart → Login → Address → Checkout → Payment → Order

---

# V1 — EXPLICITLY DO NOT BUILD YET

The following should NOT delay V1:

1. **Multi-vendor Marketplace**: No seller accounts, vendor dashboards, commissions. (V2/V3)
2. **Advanced Delivery Fleet System**: No delivery partner app, live driver GPS tracking, route optimization. (V2/V3)
3. **Advanced Loyalty Program**: No points, tiers, referral points, gamification. (Later)
4. **Wallet**: No customer wallet or store credit system. (Later)
5. **Subscription Grocery**: No weekly/monthly recurring baskets. (Later)
6. **Advanced Personalization**: No AI recommendations, personalized homepages. (Later)
7. **AI Shopping Assistant**: No voice shopping, AI meal planning, conversational shopping. (Later)
8. **WhatsApp Commerce**: No WhatsApp ordering or chatbots. (Keep notification architecture ready for WhatsApp integration).
9. **Native Mobile Apps**: No Android/iOS apps. Build a high-quality responsive web application / PWA-ready architecture.
10. **Advanced Promotions**: Only basic offers/coupons if required. No complex BOGO / bundle pricing / dynamic pricing.
11. **Advanced Search**: Database-backed search only. No Elasticsearch/OpenSearch.
12. **Advanced Reporting**: Basic orders, revenue, products, stock only.
13. **Multi-City Expansion**: Bangalore only. Structure DB to support future cities, but do not build multi-city operations.
14. **Multiple Warehouses**: One inventory/store/fulfillment location.
15. **Advanced Supplier Management**: No supplier portal, PO automation.

---

# V1.1 — IMMEDIATE POST-LAUNCH

Only after V1 is stable:
- Better search
- Product reviews & ratings
- Wishlist
- Reorder button
- Coupon improvements
- Basic WhatsApp notifications
- Better sales reports
- Customer support tools
- PWA improvements
- Performance optimization based on real traffic

---

# V2 — GROWTH FEATURES
- Wishlist, Reorder, Loyalty, Referral, Wallet, Subscriptions, Recommendations
- Advanced coupons, Campaign management, Abandoned cart recovery, Email/WhatsApp automation, Push notifications
- Delivery partner management, Driver app, Delivery assignment, Delivery tracking, Route optimization
- Customer LTV, Cohorts, Retention, Product profitability, Demand forecasting

---

# V3 — SCALE FEATURES
- Multi-city expansion
- Multiple warehouses
- Multi-vendor marketplace
- Supplier portal & procurement automation
- Advanced search infrastructure
- AI shopping assistant & Native mobile apps

---

# ARCHITECTURE RULE FOR FUTURE FEATURES

The application should be:
**V1 SIMPLE** but **V2/V3 READY**

Build clean interfaces and modular services:
- `PaymentService`
- `DeliveryService`
- `NotificationService`
- `InventoryService`
- `PricingService`
- `CustomerService`
- `OrderService`

Do not implement every future provider now. Create clean interfaces so future functionality can be added without rewriting the core system.

---

# PRIORITY RULE

- **P0 — MUST HAVE**: Required to complete a purchase (Login, Product, Variation, Cart, Checkout, Payment, Order, Inventory, Admin, Excel price/stock, Delivery, Security).
- **P1 — IMPORTANT**: Improves launch experience without blocking core commerce (Better search, Coupons, Basic analytics, Reviews, Wishlist).
- **P2 — LATER**: Growth features (Loyalty, Subscriptions, WhatsApp commerce, Advanced analytics, Delivery tracking).
- **P3 — FUTURE**: Scale/AI/marketplace features (Multi-vendor, Multi-city, AI shopping, Native apps, Advanced logistics).

---

# FINAL V1 DEFINITION & ACCEPTANCE CRITERIA

V1 is complete when a real Bangalore customer can:
REGISTER → LOGIN WITH OTP → FIND A PRODUCT → SELECT EXACT QUANTITY → SEE CORRECT PRICE → ADD TO CART → ENTER/SELECT ADDRESS → CHECK BANGALORE DELIVERY → PAY → RECEIVE ORDER CONFIRMATION → VIEW ORDER IN MY ACCOUNT

AND the business can:
LOGIN TO ADMIN → MANAGE PRODUCTS → MANAGE VARIATIONS → MANAGE PRICES → MANAGE STOCK → UPLOAD EXCEL → PREVIEW PRICE/STOCK CHANGES → UPDATE CATALOGUE → MANAGE ORDERS → UPDATE DELIVERY STATUS → VIEW BASIC SALES/INVENTORY

If any of these core flows do not work, V1 is NOT complete.
Do not expand scope until this core loop is stable.
