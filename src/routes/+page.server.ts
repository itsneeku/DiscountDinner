import { fail, isActionFailure, type Actions } from '@sveltejs/kit';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const secret : string = process.env.GEMINI_API_KEY || ''; 
const genAI = new GoogleGenerativeAI(secret);
const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'});

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
		console.log('getRecipes start');
		try {
		  const data = await request.formData();
		  const selectedStores = data.getAll('selectedStores') as string[];
		  const postalCode = data.get('postalCode') as string;

		  console.log('Selected Stores:', selectedStores);
		  console.log('Postal Code:', postalCode);
	  
		  if (!selectedStores.length || !postalCode) {
			return fail(400, { error: 'Pick a store boy' });
		  }
	  
		  const flyers = await getFlyersByPostalCode(postalCode);
		  const selectedFlyers = flyers.filter((flyer) =>
			selectedStores.includes(flyer.merchant)
		  );
	  
		  let allFlyerItems = [];
		  for (const flyer of selectedFlyers) {
			const items = await getFlyerItemsByFlyerId(flyer.id);
			if (Array.isArray(items)) {
			  allFlyerItems = allFlyerItems.concat(items);
			} 
		  }

		  if (allFlyerItems.length === 0) {
			throw new Error('No flyer items');
		  }

		  const validItems = allFlyerItems.filter( // some items price is ''
			(item) => item.price && !isNaN(parseFloat(item.price))
		  );
	  
		  const topCheapestItems = Array.from(
			new Map(validItems.map(item => [item.name, item])).values()
		  )
			.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
			.slice(0, 10);

		const formattedIngredients = topCheapestItems
        .map((item: any) => `${item.name} - $${item.price}`)
        .join(', ');
  
		const prompt = `You are a professional chef. Suggest three recipes using any combination of the following discounted ingredients: ${formattedIngredients}. Provide only the recipe names and the necessary ingredients. Compute the total cost also.`;

		const recipeResponse = await model.generateContent(prompt);
		const recipe = recipeResponse.response.text();
			  
		  return { stores: selectedFlyers, recipes: recipe };
		} catch (error) {
		  console.error('Error in getRecipes:', error);
		  return fail(500, { error });
		}
	  },
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
