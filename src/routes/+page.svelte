<script lang="ts">
	let { form }: { form: ActionData & { error?: string; postalCode?: string } } = $props();
	import * as Card from '$lib/components/ui/card';
	import * as Accordion from '$lib/components/ui/accordion';
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { onMount } from 'svelte';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import CircleDollarSign from 'lucide-svelte/icons/circle-dollar-sign';

	import type { ActionData } from './$types';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { fade, slide } from 'svelte/transition';
	let postalCode = $state('');
	let loadingFlyers = $state(false);
	let loadingRecipes = $state(false);
	let targetAudience = ['the broke', 'the busy', 'the pasta burners'];
	let index = $state(0);

	let selectedStores = $state<string[]>([]);
	$effect(() => {
		if (postalCode.length == 7) localStorage.setItem('postalCode', postalCode);
		localStorage.setItem('selectedStores', JSON.stringify(selectedStores));
	});

	$inspect(form);
	$inspect(selectedStores);

	const useEnhance = ({ formData, action }) => {
		console.log('action', action);
		if (action.search === '?/getFlyers') loadingFlyers = true;
		if (action.search === '?/getRecipes') loadingRecipes = true;

		const stores = {};
		form?.stores?.forEach((store) => {
			if (selectedStores.includes(store.merchant)) {
				if (!stores[store.merchant]) stores[store.merchant] = [];
				stores[store.merchant].push(store.id);
			}
		});
		formData.append('flyerIdsByStore', JSON.stringify(stores));
		return async ({ update }: { update: (options: { reset: boolean }) => void }) => {
			loadingFlyers = false;
			loadingRecipes = false;
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
		setInterval(() => {
			if (index === targetAudience.length - 1) index = 0;
			else index++;
		}, 2000);
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
	<div class="flex flex-col items-center w-screen">
		<h1 class="text-center w-screen text-[13vw] tracking-tight sm:text-7xl font-serif">
			DiscountDinner
		</h1>
		{#key index}
			<h2
				transition:slide
				class="text-center w-screen text-muted-foreground tracking-tight text-[3vw] min-[440px]:text-base"
			>
				For {targetAudience[index]}
			</h2>
		{/key}
	</div>
	<div class="flex flex-col flex-1 text-center text-sm transition-all">
		<form
			method="POST"
			use:enhance={useEnhance}
			action="?/getFlyers"
			class="flex px-8 w-screen max-w-md sm:max-w-lg flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 transition-all {form?.stores ||
			form?.recipes ||
			loadingRecipes
				? 'pt-12'
				: 'pt-48'} pb-4"
		>
			<Card.Root class="h-28 flex flex-col justify-between sm:basis-3/4">
				<Card.Header class=" text-left sm:text-center">
					<Card.Description class="px-4">Your postal code</Card.Description>
				</Card.Header>
				<Card.Content class="pt-2 ">
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
						class="h-10 transition-all text-center{isValidationError() ? 'border-red-500' : ''}"
					/>
				</Card.Content>
			</Card.Root>
			<button disabled={Boolean(postalCode == '' || isValidationError())} class="sm:basis-1/4">
				<Card.Root
					class=" sm:h-28 flex flex-row sm:flex-col justify-between transition-all hover:bg-secondary   {postalCode ==
						'' || isValidationError()
						? 'opacity-40 cursor-not-allowed'
						: 'opacity-100 cursor-pointer'}"
				>
					<Card.Header class="sm:hidden pt-8">
						<Card.Description class="px-4 ">Find stores nearby</Card.Description>
					</Card.Header>
					<Card.Content class="sm:my-auto">
						<ArrowRight class="h-10 sm:mx-auto " />
					</Card.Content>
				</Card.Root>
			</button>
		</form>

		<form method="POST" use:enhance={useEnhance} action="?/getRecipes">
			{#if loadingFlyers}
				{#each Array(6) as _}
					<div class="flex justify-center items-center space-x-5 pb-4" transition:fade|global>
						<Skeleton class="h-36 w-36 sm:h-24 sm:w-24" />
						<Skeleton class="h-36 w-36 sm:h-24 sm:w-24" />
						<Skeleton class="sm:h-24 sm:w-24 hidden sm:block" />
						<Skeleton class="sm:h-24 sm:w-24 hidden sm:block" />
					</div>
				{/each}
			{:else if loadingRecipes}
				{#each Array(3) as _}
					<div
						class="flex w-screen px-8 max-w-sm sm:max-w-lg justify-center items-center space-x-5 pb-4"
						transition:fade|global
					>
						<Skeleton class=" h-56  w-full" />
					</div>
				{/each}
			{:else if form?.stores}
				<div class="flex w-screen px-8 max-w-sm sm:max-w-lg flex-row flex-wrap">
					{#each [...new Map(form?.stores.map( (store: { merchant: string }) => [store.merchant, store] )).values()] as store, i}
						{@const checked = selectedStores.includes((store as { merchant: string }).merchant)}
						{@const merchant = (store as { merchant: string }).merchant}
						{@const merchantLogo = (store as { merchant_logo: string }).merchant_logo}
						<Card.Root
							class="w-[47%] sm:w-[22%] flex flex-col aspect-square mb-4 border-8 transition-all rounded-xl hover:opacity-70 {i %
								2 ===
							0
								? 'mr-2 sm:mr-0'
								: 'ml-2 sm:ml-0'}  {checked ? 'opacity-100 border-primary' : 'opacity-40'} bg-white
								
{i % 4 === 0 ? 'sm:mr-2' : i % 4 === 1 ? 'sm:mx-2' : i % 4 === 2 ? 'sm:mx-2' : 'sm:ml-2'}"
							onclick={() => toggleStoreSelection(merchant, !checked)}
						>
							<div
								class="w-full h-full bg-contain bg-center bg-no-repeat border-8 border-transparent"
								style="background-image: url({merchantLogo});"
							></div>
						</Card.Root>
					{/each}
				</div>

				<button
					disabled={Boolean(postalCode == '' || isValidationError())}
					class="transition-all w-screen px-8 max-w-sm sm:max-w-lg mx-auto my-16"
				>
					<Card.Root
						class="flex flex-row transition-all hover:bg-secondary bg-primary text-primary-foreground  max-w-sm sm:max-w-lg  justify-center  {postalCode ==
							'' || isValidationError()
							? 'opacity-40 cursor-not-allowed'
							: 'opacity-100 cursor-pointer'}"
					>
						<Card.Header class="hidden"></Card.Header>
						<Card.Content class="sm:my-auto">Feed me for cheap</Card.Content>
					</Card.Root>
				</button>
				<!-- <Button class="mt-4" type="submit">Get recipes</Button> -->
			{/if}
		</form>
	</div>

	{#if form?.recipes}
		{@const recipes = (() => {
			try {
				return JSON.parse(form.recipes.match(/\[.*\]/s)?.[0]);
			} catch (error) {
				console.error('Error parsing recipes:', error);
				return [];
			}
		})()}
		{#each recipes as { recipeName, ingredients, steps, estimatedCost }}
			<Card.Root class="  max-w-sm sm:max-w-md px-4 mb-6 pb-8">
				<Card.Header>
					<Card.Title>{recipeName}</Card.Title>
					<Card.Description class="py-2 px-1">${estimatedCost}</Card.Description>
				</Card.Header>
				<Card.Content class="px-2">
					<!-- Group ingredients by matching store -->
					<!-- An ingredient has .name and .store -->
					{@const ingredientsByStore = ingredients.reduce((grouped, item) => {
						if (!grouped[item.store]) {
							grouped[item.store] = [];
						}
						grouped[item.store].push(item);
						return grouped;
					}, {})}
					<h2 class="text-xl font-bold">Ingredients</h2>
					{#each Object.entries(ingredientsByStore) as [store, ingredients]}
						<h3 class="text-base">{store}</h3>
						<ul class="list-disc px-6 text-sm">
							{#each ingredients as ingredient}
								<li class="text-muted-foreground">{ingredient.ingredient}</li>
							{/each}
						</ul>
					{/each}

					<h2 class="pt-6 text-xl font-bold">Cooking Steps</h2>
					<ol class="list-decimal px-6 text-muted-foreground">
						{#each steps as i}
							<li>{i}</li>
						{/each}
					</ol>
				</Card.Content>
			</Card.Root>
		{/each}
	{/if}
</section>
