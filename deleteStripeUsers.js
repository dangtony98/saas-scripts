require('dotenv').config();

/**
 * This script deletes all customers in Stripe.
 * It can be used to, for example, start a clean slate in test mode.
 */

const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2022-11-15'
});

const main = async () => {
    let hasMore = true;
    let lastId = undefined;
    let customers = [];

	while (hasMore) {
        const { data, has_more } = await stripe.customers.list({
            limit: 100,
            starting_after: lastId
        });

        customers.push(...data);
        if (has_more) {
            lastId = data[data.length - 1].id;
        }
          
          hasMore = has_more;
    }
    
    let customerIds = customers.map((customer) => customer.id);
    
    for await (const [index, id] of customerIds.entries()) {
        await stripe.customers.del(
            id
        );
    }
}

main();