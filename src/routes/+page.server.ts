import type { Actions } from '@sveltejs/kit';

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const postalCode = data.get('postalCode');
		console.log(data);
	}
} satisfies Actions;
