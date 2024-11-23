<script lang="ts">
	let { form }: { form: ActionData } = $props();
	import { enhance } from '$app/forms';
	import { Input } from '$lib/components/ui/input';
	import type { ActionData } from './$types'
	import { onMount } from 'svelte';
	let postalCode = $state('');
	onMount(() => {
		console.log('mounted');
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(async (position) => {
			const { latitude, longitude } = position.coords;
			const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`);
			const data = await response.json();
			console.log(data);
			console.log(data.results[0].components.postcode);
			if (data.results && data.results.length > 0) {
				postalCode = data.results[0].components.postcode || '';
			}
			}, (error) => {
			console.error('Error getting location:', error);
			});
		} else {
			console.error('Geolocation is not supported by this browser.');
		}
	});
</script>

<section class="flex flex-col justify-center items-center flex-[0.6]">
	<h1 class="text-4xl text-center md:text-[2.4rem] w-full">DiscountDinner</h1>

	<h2>Tagline here</h2>
	<p>Enter your postal code :3</p>
	<form method="POST" use:enhance>
		<Input name="postalCode" value={postalCode} class="text-center" placeholder="H1A B2C" />
	</form>
	{form}
</section>
