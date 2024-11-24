import { fail, isActionFailure, type Actions } from '@sveltejs/kit';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const secret: string = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(secret);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
		return { stores: flyers, postalCode };
	},
	getRecipes: async ({ request }) => {
		try {
			const data = await request.formData();
			const flyerIdsByStore = JSON.parse(data.get('flyerIdsByStore') as string);
			console.log(flyerIdsByStore);
			if (Object.keys(flyerIdsByStore).length === 0)
				return fail(400, { error: 'Pick a store boy' });

			const allFlyerItems: any[] = [];
			for (const store in flyerIdsByStore) {
				console.log(store, flyerIdsByStore[store]);
				const flyerId = flyerIdsByStore[store];
				const items = await getFlyerItemsByFlyerId(flyerId);
				console.log(items);
				items.forEach((item) => {
					allFlyerItems.push({ name: item.name, price: item.price, store });
				});
			}
			console.log('allFlyerItems', allFlyerItems);

			if (allFlyerItems.length === 0) {
				return fail(400, { error: 'No items found' });
			}

			const validItems = allFlyerItems.filter(
				(item) => item.price && !isNaN(parseFloat(item.price)) && item.price > 0
			);

			const topCheapestItems = Array.from(
				new Map(validItems.map((item) => [item.name, item])).values()
			)
				.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
				.slice(0, 20);

			console.log('topCheapestItems', topCheapestItems);

			const prompt = `
			### Instruction ###
			You are a chef specializing in cheap meals. You have access to the provided input ingredients from the given stores. Your goal is to create 3 recipes using primarily these ingredients. 

			### Input Ingredients ###
			${JSON.stringify(topCheapestItems)}

			### Output Format - Array of JSON ###
			[
				{
				recipeName: <recipe_name>,
				ingredients: [
					{ingredient: <ingredient_name>, store: <ingredient's_store>}
				],
				steps: [<step_1>, <step_2>, ...],
				estimatedCost: <estimated_cost>
				},
			...]			
			`;

			const recipeResponse = await model.generateContent(prompt);
			const recipe = recipeResponse.response.text();

			return { recipes: recipe };
		} catch (error) {
			console.error('Error in getRecipes:', error);
			return fail(500, { error });
		}
	}
} satisfies Actions;

const getFlyersByPostalCode = async (postalCode: string) => {
	const response = await fetch(ENDPOINT_FLYERS_BY_POSTAL_CODE(postalCode));
	const data = await response.json();
	if (response.status !== 200 || data.error) return fail(400, { error: true, postalCode });
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
