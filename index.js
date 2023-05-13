const Stripe = require('stripe');

const STRIPE_SECRET_KEY = '';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2022-11-15'
});

const main = async () => {
	const priceToMigrateFrom = '';
	const priceToMigrateTo = '';

	let hasMore = true;
	let lastId = undefined;
	let subscriptions = [];

	while (hasMore) {
		const { data, has_more } = await stripe.subscriptions.list({
		  limit: 100, // maximum limit is 100
		  price: priceToMigrateFrom,
		  starting_after: lastId
		});
	  
		subscriptions.push(...data);
		
		if (has_more) {
		  lastId = data[data.length - 1].id;
		}
		
		hasMore = has_more;
	}
	
	// migrate
	for await (const subscription of subscriptions) {

		// delete subscription
		await stripe.subscriptions.del(
			subscription.id
		);

		// create subscription
		await stripe.subscriptions.create({
			customer: subscription.customer,
			items: [
				{
					price: priceToMigrateTo,
					quantity: 1
				}
			],
			payment_behavior: 'default_incomplete',
			proration_behavior: 'none',
			expand: ['latest_invoice.payment_intent']
		});
	}
}

main();
