import { fail, isActionFailure, type Actions } from '@sveltejs/kit';

const ENDPOINT_FLYERS_BY_POSTAL_CODE = (postalCode: string) =>
	`https://flyers-ng.flippback.com/api/flipp/data?postal_code=${postalCode}&sid=${Math.random().toString().slice(2, 10)}`;

const ENDPOINT_FLYER_ITEMS = (flyerId: number) =>
	`https://flyers-ng.flippback.com/api/flipp/flyers/${flyerId}/flyer_items`;

const BLACKLIST = ['Giant Tiger', 'Jean Coutu', 'Keurig', 'Vie En Vert', 'Chaussures Pop'];

export const actions = {
	getFlyers: async ({ request }) => {
		const data = await request.formData();
		const postalCode = data.get('postalCode') as string;
		const flyers = await getFlyersByPostalCode(postalCode);
		if (isActionFailure(flyers)) return flyers;
		return { stores: flyers };
	},
	getRecipes: async ({ request }) => {
		const data = await request.formData();
		console.log(data);
		return { status: 200, body: { recipes: [] } };
		// const flyerItems = [];
		// flyers.forEach((flyer) => flyerItems.push(getFlyerItemsByFlyerId(flyer.id)));
	}
} satisfies Actions;

const getFlyersByPostalCode = async (postalCode: string) => {
	const response = await fetch(ENDPOINT_FLYERS_BY_POSTAL_CODE(postalCode));
	const data = await response.json();
	if (response.status !== 200 || data.error) return fail(400, { error: true, postalCode });
	console.log(data);
	console.log(response);
	const currentDate = new Date().toISOString().slice(0, 10);
	const flyers = data.flyers.filter((flyer) => {
		return (
			(flyer.categories.includes('Épicerie') || flyer.categories.includes('Groceries')) &&
			flyer.valid_from.slice(0, 10) <= currentDate &&
			flyer.valid_to.slice(0, 10) >= currentDate &&
			!BLACKLIST.includes(flyer.merchant)
		);
	});
	flyers.sort((a: { merchant: string }, b: { merchant: string }) =>
		a.merchant.localeCompare(b.merchant)
	);
	return flyers;
};

const getFlyerItemsByFlyerId = async (flyerId: number) => {
	const response = await fetch(ENDPOINT_FLYER_ITEMS(flyerId));
	const data = await response.json();
	return data;
};
