import type { Actions } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const postalCode = data.get('postalCode');
		console.log(data);
		return postalCode;
	}
} satisfies Actions;
