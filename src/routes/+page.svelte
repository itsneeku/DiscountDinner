<script lang="ts">
	let { form }: { form: ActionData & { error?: string; postalCode?: string } } = $props();
	import * as Card from '$lib/components/ui/card';
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { onMount } from 'svelte';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';

	import type { ActionData } from './$types';
	let postalCode = $state('');

	// $effect(() => {
	// 	if (form?.postalCode) {
	// 		postalCode = form.postalCode;
	// 	}
	// });
	// $effect(() => {
	// 	postalCode = postalCode.toUpperCase();
	// 	// add a space after the first 3 characters
	// 	if (postalCode.length > 3) {
	// 		postalCode = postalCode.slice(0, 3) + ' ' + postalCode.slice(3);
	// 	}
	// });
	let recipes = $state('');
	$effect(() => {
		if (form?.recipes) {
			recipes = form.recipes;
		}
	});
	let selectedStores = $state<string[]>([]);
	$effect(() => {
		if (postalCode.length == 7) localStorage.setItem('postalCode', postalCode);
		localStorage.setItem('selectedStores', JSON.stringify(selectedStores));
	});

	$inspect(form);
	$inspect(selectedStores);

	const formEnhance = () => {
		return async ({ update }: { update: (options: { reset: boolean }) => void }) => {
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

	const getPostalCode = async (position: GeolocationPosition) => {
		const { latitude, longitude } = position.coords;
		const response = await fetch(
			`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`
		);
		const data = await response.json();
		if (data.results && data.results.length > 0)
			postalCode = data.results[0].components.postcode || '';
	};

	onMount(() => {
		getLastUsedPostalCode();
		if (!navigator.geolocation) {
			console.error('Geolocation is not supported by this browser.');
			return;
		}
		navigator.geolocation.getCurrentPosition(getPostalCode, (err) => {
			console.error('Error getting location:', err);
		});
	});

	const isValidationError = () => form?.error && postalCode == form?.postalCode;

	getLastUsedStores();
</script>

<section class="flex flex-col items-center">
	<div class="flex flex-col items-center">
		<h1 class="text-center w-screen text-[13vw] tracking-tight sm:text-7xl">DiscountDinner</h1>
		<h2 class="text-center w-screen tracking-tight text-[3vw] min-[440px]:text-base">
			For the broke, the busy, and those who burn pasta.
		</h2>
	</div>
	<div class="flex flex-col flex-1 text-center text-s transition-all">
		<form
			method="POST"
			use:enhance={formEnhance}
			action="?/getFlyers"
			class="flex w-screen px-8 max-w-sm sm:max-w-lg flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 pt-16 pb-4"
		>
			<Card.Root class="h-28 flex flex-col justify-between ">
				<Card.Header class="pb-0 text-left sm:text-center">
					<Card.Description>Your postal code</Card.Description>
				</Card.Header>
				<Card.Content>
					<Input
						type="text"
						name="postalCode"
						value={postalCode}
						oninput={(e) => {
							let value = (e.target as HTMLInputElement).value.toUpperCase();
							if (value.length > 3 && value[3] !== ' ') {
								value = value.slice(0, 3) + ' ' + value.slice(3);
							}
							postalCode = value;
						}}
						placeholder="H1A B2C"
						maxlength={7}
						class="h-10 transition-colors text-center {isValidationError() ? 'border-red-500' : ''}"
					/>
				</Card.Content>
			</Card.Root>
			<button disabled={Boolean(postalCode == '' || isValidationError())}>
				<Card.Root
					class=" sm:h-28 flex flex-row sm:flex-col justify-between transition-all {postalCode ==
						'' || isValidationError()
						? 'opacity-40 cursor-not-allowed'
						: 'opacity-100 cursor-pointer'}"
				>
					<Card.Header>
						<Card.Description>Find stores nearby</Card.Description>
					</Card.Header>
					<Card.Content>
						<ArrowRight class="h-10 sm:mx-auto" />
					</Card.Content>
				</Card.Root>
			</button>
		</form>

		<form method="POST" use:enhance={formEnhance} action="?/getRecipes">
			{#if form?.stores}
				<div class="flex w-screen px-8 max-w-sm flex-row flex-wrap justify-between">
					{#each [...new Map(form?.stores.map( (store: { merchant: string }) => [store.merchant, store] )).values()] as store, i}
						{@const checked = selectedStores.includes((store as { merchant: string }).merchant)}
						{@const merchant = (store as { merchant: string }).merchant}
						{@const merchantLogo = (store as { merchant_logo: string }).merchant_logo}
						<Card.Root
							class="w-[47%] flex flex-col aspect-square mb-4 border-8 transition-all rounded-xl hover:opacity-70 {i %
								2 ===
							0
								? 'mr-2'
								: 'ml-2'}  {checked ? 'opacity-100 border-secondary' : 'opacity-40'} bg-white"
							onclick={() => toggleStoreSelection(merchant, !checked)}
						>
							<div
								class="w-full h-full bg-contain bg-center bg-no-repeat border-8 border-transparent"
								style="background-image: url({merchantLogo});"
							></div>
						</Card.Root>

						<!-- 							style="background-image: url({merchantLogo});"
 -->
						<!--<div>
						<Checkbox
							id={merchant}
							{checked}
							value={merchant}
							onCheckedChange={(v) => toggleStoreSelection(merchant, v)}
						/>
						<Label
							for={merchant}
							class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{merchant}
						</Label>
						{#if checked}
							<input type="hidden" name="selectedStores" value={merchant} />
						{/if}
					</div>
				{/each}
				<input type="hidden" name="postalCode" value={postalCode} />
				<Button type="submit" class="mt-4">Get flyers</Button>
=======
					</div> -->
					{/each}
				</div>

				<Button type="submit" class="mt-4">Get recipes</Button>
			{/if}
		</form>
	</div>

	{#if recipes}
		<section class="mt-8 p-4 border rounded bg-gray-100 w-full max-w-2xl">
			<h2 class="text-2xl mb-2">Your Generated Recipe</h2>
			<div class="recipe-content">
				{@html recipes}
			</div>
		</section>
	{/if}
</section>
