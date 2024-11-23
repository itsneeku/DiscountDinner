<script lang="ts">
	let { form }: { form: ActionData } = $props();
	import { enhance } from '$app/forms';
	import { Input } from '$lib/components/ui/input';
	import type { ActionData } from './$types';
	import { onMount } from 'svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	let postalCode = $state('');
	let selectedStores = $state<string[]>([]);
	$effect(() => {
		console.log('form:', form);
	});

	const addStore = (store) => {
		selectedStores = [...selectedStores, store];
	};

	const removeStore = (store) => {
		selectedStores = selectedStores.filter((s) => s !== store);
	};
	onMount(() => {
		if (!navigator.geolocation) {
			console.error('Geolocation is not supported by this browser.');
			return;
		}
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;
				const response = await fetch(
					`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`
				);
				const data = await response.json();

				if (data.results && data.results.length > 0) {
					postalCode = data.results[0].components.postcode || '';
				}
			},
			(err) => {
				console.error('Error getting location:', err);
			}
		);
	});
</script>

<section class="flex flex-col justify-center items-center flex-[0.6]">
	<h1 class="text-4xl text-center md:text-[2.4rem] w-full">DiscountDinner</h1>

	<h2>Tagline here</h2>
	<p>Enter your postal code :3</p>
	<form method="POST" use:enhance action="?/getFlyers">
		<Input name="postalCode" value={postalCode} class="text-center" placeholder="H1A B2C" />
	</form>
	{#if form?.stores}
		{#each [...new Map(form.stores.map((store) => [store.merchant, store])).values()] as store}
			{@const checked = selectedStores.includes(store.merchant)}
			<div>
				<Checkbox
					id={store.merchant}
					{checked}
					value={store.merchant}
					onCheckedChange={(v) => {
						if (v) {
							addStore(store.merchant);
						} else {
							removeStore(store.merchant);
						}
					}}
				/>
				<Label
					for={store.merchant}
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>{store.merchant}</Label
				>
			</div>
		{/each}
	{/if}
</section>
