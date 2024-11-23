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
	import clear from '$lib/images/x-thin-svgrepo-com.svg';
	let postalCode = $state('');
	let selectedStores = $state<string[]>([]);
	$effect(() => {
		localStorage.setItem('postalCode', postalCode);
		localStorage.setItem('selectedStores', JSON.stringify(selectedStores));
	});

	$inspect(form);
	$inspect(selectedStores);

	const formEnhance = () => {
		return async ({ update }) => {
			update({ reset: false });
		};
	};
	const toggleStoreSelection = (store: string, isSelected: boolean) => {
		selectedStores = isSelected
			? [...selectedStores, store]
			: selectedStores.filter((s) => s !== store);
	};

	const getLastUsedPostalCode = () => {
		if (!browser) return;
		const lastUsedPostalCode = localStorage.getItem('postalCode');
		if (lastUsedPostalCode) {
			postalCode = lastUsedPostalCode;
		}
	};

	const getLastUsedStores = () => {
		if (!browser) return;
		const lastUsedStores = localStorage.getItem('selectedStores');
		if (lastUsedStores) {
			selectedStores = JSON.parse(lastUsedStores);
		}
	};

	const getPostalCode = async (position) => {
		const { latitude, longitude } = position.coords;
		const response = await fetch(
			`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`
		);
		const data = await response.json();
		if (data.results && data.results.length > 0)
			postalCode = data.results[0].components.postcode || '';
	};

	onMount(() => {
		if (!navigator.geolocation) {
			console.error('Geolocation is not supported by this browser.');
			getLastUsedPostalCode();
			return;
		}
		navigator.geolocation.getCurrentPosition(getPostalCode, (err) => {
			console.error('Error getting location:', err);
			getLastUsedPostalCode();
		});
	});

	getLastUsedStores();
</script>

<section class="flex flex-col justify-center items-center flex-[0.6]">
	<h1 class="text-4xl text-center md:text-[2.4rem] w-full">DiscountDinner</h1>
	<h2>Tagline here</h2>
	<p>Enter your postal code :3</p>
	<form method="POST" use:enhance={formEnhance} action="?/getFlyers">
		<div
			class="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-30"
			style="background-color: #f3dfdf;"
		>
			<Input
				name="postalCode"
				bind:value={postalCode}
				placeholder="H1A B2C"
				class="bg-inherit flex-1 focus:outline-none text-center "
			/>
		</div>
		{#if form?.stores}
			{#each [...new Map(form?.stores.map( (store: { merchant: string }) => [store.merchant, store] )).values()] as store}
				{@const checked = selectedStores.includes((store as { merchant: string }).merchant)}
				{@const merchant = (store as { merchant: string }).merchant}
				<div>
					<Checkbox
						id={merchant}
						{checked}
						value={merchant}
						onCheckedChange={(v) => toggleStoreSelection(merchant, v)}
					/>
					<Label
						for={merchant}
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>{merchant}</Label
					>
				</div>
			{/each}
			<Button formaction="?/getRecipes" class="mt-4">Get flyers</Button>
		{/if}
	</form>
</section>
