import { fail, type Actions } from '@sveltejs/kit';

const ENDPOINT_FLYERS_BY_POSTAL_CODE = `https://flyers-ng.flippback.com/api/flipp/data`;

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const postalCode = data.get('postalCode') as string;
		console.log(data);
		const flyers = await getFlyersByPostalCode(postalCode);
		console.log(flyers);
		// if (flyers.error) {
		// 	fail(flyers.error);

		// 		}
				return postalCode;
	}
} satisfies Actions;


const getFlyersByPostalCode = async (postalCode: string) => {
	const sid = Math.random().toString().slice(2, 10);
	const response = await fetch(`${ENDPOINT_FLYERS_BY_POSTAL_CODE}?postal_code=${postalCode}&sid=${sid}`);
	const data = await response.json();
	if (data.error) 
	console.log(data);
	// return data;
	// return postalCode;
	
}