require('dotenv').config();

const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const items = require("./products.json")
const {v4} = require('uuid')

let app = express();

// view engine setup (Handlebars)
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
app.use(express.json({}));

/**
 * Helper methods
 */

const getItemMetaData = (itemId) => {
  return items[itemId] === undefined ? {} : items[itemId]
}

const getSecondsSinceEpoch = (date) => {
  return Math.floor(date/1000)
}

const getFutureDate = (seconds) => {
  return new Date(+new Date() + seconds)
}

/**
 * Home route
 */
app.get('/', function(req, res) {
  res.render('index');
});

/**
 * Checkout route
 */
app.get('/checkout', function(req, res) {
  // Just hardcoding amounts here to avoid using a database
  let error;
  let item = getItemMetaData(req.query.item);

  if (item.length === 0) {
    error = "No item selected"
  }

  if (req.query.error) {
    error = req.query.error
  }

  res.render('checkout', {
    ...item,
    uuid: v4(),
    error: error
  });
});

// create checkout session
app.post('/create-checkout-session', async (req, res) => {
  try {

    console.log(req.body)
    const {skuId, uuid, email} = req.body;

    if (skuId === "") {
      return res.render('checkout', {
        error: "No item selected"
      });
    }

    if (uuid === "") {
       throw new Error("uuid not present")
    }

    const SixtyMinutesInSeconds = 60000*60
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: skuId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.DOMAIN_URL}/success`,
      cancel_url: `${process.env.DOMAIN_URL}/checkout?error=An%20error%20has%20occured.%20please%20try%20again`,
      expires_at: getSecondsSinceEpoch(getFutureDate(SixtyMinutesInSeconds))
    }, {
      idempotencyKey: uuid
    });

    res.redirect(303, session.url);
  } catch (e) {
    console.error(e.message)
    return res.render('checkout', {
      error: "An error has occurred. Please try again"
    });
  }

});

/**
 * Success route
 */
app.get('/success', function(req, res) {
  res.render('success');
});

/**
 * Start server
 */
app.listen(3000, () => {
  console.log('Getting served on port 3000');
});
