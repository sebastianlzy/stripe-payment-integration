require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require("fs")
const md5 = require("md5")

const items = [
    {
        itemId: "1",
        title: "The Art of Doing Science and Engineering",
        productId: "price_1KdUYPLVTcVdJ7Jae0jWixhI",
        amount: 2300,
        quantity: 5
    },
    {
        itemId: "2",
        title: "The Making of Prince of Persia: Journals 1985-1993",
        productId: "price_1KdUYPLVTcVdJ7Jae0jWixhI",
        amount: 2500,
        quantity: 10
    },
    {
        itemId: "3",
        title: "Working in Public: The Making and Maintenance of Open Source",
        productId: "price_1KdUYPLVTcVdJ7Jae0jWixhI",
        amount: 2800,
        quantity: 20
    }
]

const uniqueSessionID = "031620221608"

const createProduct = async (items) =>  {
    const res = {}
    for (const item of items) {
        const bookId = md5(`books_${item.itemId}_${uniqueSessionID}`)
        const product = await stripe.products.create({
            id: bookId,
            name: item.title,
            type: "good",
            active: true,
        }, {
            idempotencyKey: bookId
        });
        console.log("product", product)

        const sku = await stripe.skus.create({
            currency: 'sgd',
            inventory: {
                type: 'finite',
                quantity: item.quantity
            },
            price: item.amount,
            product: product.id,
            active: true,
        }, {
            idempotencyKey: `sku_${product.id}`
        })
        console.log("sku", sku)

//         const price = await stripe.prices.create({
//             unit_amount: item.amount,
//             currency: 'sgd',
//             product: product.id
//         },
// {
//             idempotencyKey: `price_${product.id}`
//         });
//         console.log("price", price)

        res[item.itemId] = {
            title: item.title,
            productId: product.id,
            amount: sku.price,
            currency: sku.currency,
            // priceId: price.id,
            skuId: sku.id
        }
    }

    return res

}

async function main() {
    let products = {}
    try {
        products = await createProduct(items)
        console.log(products)
    } catch (e) {
        console.log(e)
        const res = await stripe.products.list({limit: 3})

        // console.log(res)

    }

    fs.writeFile("./products.json", JSON.stringify(products), (err) => {
        if (err) console.error(err)
        console.log("Products are successfully created and updated to products.json")
    }, )
}

main()
    .catch((err) => console.error(err.message))


