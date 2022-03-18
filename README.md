# How to get started

## [Prerequisite] Create product and SKU in Stripe

Initialize the product list with sku, ```npm run createProduct```

References
1. https://stripe.com/docs/api/products/create
2. https://stripe.com/docs/api/sku
3. https://stripe.com/docs/api/idempotent_requests

## Start the application

1. Rename `.env.sample` to `.env` and populate with your Stripe account's test API keys
2. Run server, `npm run start`
3. Navigate to [http://localhost:3000](http://localhost:3000) to view the index page.

# Tenets
Tenets guide our decision-making as well as keeping us aligned with our overall goals for this project 

## 1. Idempotency
Ensure safe retry without accidentally performing the same operation twice

Things done in this demo
1. We insert idempotencyKey to all "POST" request. For example, the creation of product and checkout session (via uuid)

## 2. Simple
We favor simplicity and offload complexity

Things done in this demo
1. We simplify payment by using Stripe elements
2. We offload inventory management to Stripe SKU - https://stripe.com/docs/api/skus/object

## 3. Fast
Time is of essence. We look into optimising for speed

Things done in this demo
1. We cache product metadata locally

## 4. Secure
Trust little. We do not trust request coming in from user's browser. 

Things done in this demo
1. We mask product id to prevent data leakage
2. We set up session expiry - https://stripe.com/docs/api/checkout/sessions/create#create_checkout_session-expires_at

# How does it work?

![High level architecture](./public/high-level-architecture.png)

| Steps | Customer action                                          | What is done ?                                                                      | Comment                                                                           |
|-------|----------------------------------------------------------|------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| 1     | Customer loads web application                           | Product retrieved from cache                                                       |                                                                                   |
| 2     | Customer clicked on the product they wish to purchase    | ItemId is added to http GET query parameters                                       | Note: item id is the order of the product displayed and is not product id         |
|       |                                                          | Request is redirected to /checkout                                                 |                                                                                   |
| 3     | Customer clicked on "pay" button                         | Attribute {uuid, skuid} is passed to server for processing                         | {uuid} is used as an idempotent key to identify the session and ensure safe retry |
|       |                                                          | Server creates a Stripe checkout session which expires in 60 mins                  |                                                                                   |
|       |                                                          | Stripe checkout session will redirect user back to /success for successful payment |                                                                                   |
| 4     | Customer can view the transaction status and amount paid |                                                                                    |                                                                                   |

References
1. https://stripe.com/docs/api/checkout/sessions/create
2. https://stripe.com/docs/checkout/quickstart
3. https://stripe.com/docs/payments/checkout/custom-success-page
4. https://stripe.com/docs/idempotency

## Challenges encounter?

Overall, the integration process was pleasant and simple. However, there are a few points that could be improved 

### On documentation

On documentation, many of the provided information were not in sync with the latest SDK. For example "idempotency_key" is deprecated and product attribute, "type" was not documented
In addition, there was too much information provided in documentation making it hard to sieve through the noise. Lastly, a lack of an end to end scenario examples in documentation hinders development speed

### Technical setup
1. During signup, account name was not setup which prevented any call to create session.
2. During checkout process, there was no email validation done

## How to extend further?

This application can be further expanded in 4 key areas, feature request, app performance, security and testing.

### Feature request

1. As a customer, I would like to receive notifications through app/email on product fulfillment status - https://stripe.com/docs/webhooks
2. As a customer, I would like to select my favorite payment method (apple pay/google pay) 
3. As a customer, I would like to refund/dispute a payment made - https://stripe.com/docs/file-upload
4. As a customer, I would like to add items into a shopping cart
5. As a merchant, I would like to include variable cost such as tax rates/codes and shipping rates 
6. As a merchant, I would like to boost sales through the use of promotion codes - https://stripe.com/docs/api/promotion_codes

### App performance

1. As an application developer, I would like to ensure we handle all the possible error codes response - https://stripe.com/docs/error-codes
2. As an application developer, I would like to enforce a caching strategy such as TTL/force invalidation

### Security
1. As a security engineer, I would like to ensure my secrets are stored in a secure vault (i.e. secret manager)
2. As a security engineer, I would like to see my secret key rotated

### Test
1. As a QA engineer, I would like to add tests for all happy paths (E2E)
2. As a QA engineer, I would like to add integration tests

# Demo

![demo.gif](./public/demo.gif)

# Screenshots

### /checkout 

![checkout](./public/checkout.png)

### Stripe checkout element

![checkout-element](./public/stripe-element.png)

### /success
![success](./public/payment_success.png)

## Payment Success

# FAQ

## Why did we not use price? 

Price is used mainly for product type = service. Each product can have multiple prices. 
However, price does not have keep track if inventory is low. 
For that, we will make use of SKU to ensure we will always be able to fulfil a customer's request

References
1. https://stripe.com/docs/payments/checkout/migrating-prices?integration=client

## What is the objective?

1. Select a book to purchase.
2. Checkout and purchase the item using Stripe Elements.
3. Display a confirmation of purchase to the user with the total amount of the charge and Stripe Payment Intent ID (beginning with pi_).
