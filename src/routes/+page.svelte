<script lang="ts">
	let { form }: { form: ActionData } = $props();
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { onMount } from 'svelte';
	import type { ActionData } from './$types';
	import github from '$lib/images/x-thin-svgrepo-com.svg';
	let postalCode = $state('');
	let selectedStores = $state<string[]>([]);
	$effect(() => {
		localStorage.setItem('selectedStores', JSON.stringify(selectedStores));
	});
	$inspect(form);
	$inspect(selectedStores);

	const addStore = (store) => (selectedStores = [...selectedStores, store]);

	const removeStore = (store) => (selectedStores = selectedStores.filter((s) => s !== store));

	const getLastUsedStores = () => {
		if (!browser) return;
		const lastUsedStores = localStorage.getItem('selectedStores');
		if (lastUsedStores) {
			selectedStores = JSON.parse(lastUsedStores);
		}
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

				if (data.results && data.results.length > 0)
					postalCode = data.results[0].components.postcode || '';
			},
			(err) => console.error('Error getting location:', err)
		);
	});

	getLastUsedStores();
</script>

<section class="flex flex-col justify-center items-center flex-[0.6]">
	<h1 class="text-4xl text-center md:text-[2.4rem] w-full">DiscountDinner</h1>
//f3dfdf
	<h2>Tagline here</h2>
	<p>Enter your postal code :3</p>
	<form method="POST" use:enhance action="?/getFlyers">
		<div class="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-300 focus-within:ring-2 focus-within:ring-pink-300">
			<input
			  type="text"
			  bind:value={postalCode}
			  placeholder="H1A B2C"
			  class="flex-1 focus:outline-none"/>
			<img src={github} alt="GitHub" class="w-8 h-8 cursor-pointer" on:click={() => (postalCode = '')} />
		  </div>
		{#if form?.stores}
			{#each [...new Map(form.stores.map((store: { merchant: string }) => [store.merchant, store])).values()] as store}
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
			<Button formaction="?/getRecipes" type="submit" class="mt-4">Get flyers</Button>
		{/if}
	</form>
</section>
