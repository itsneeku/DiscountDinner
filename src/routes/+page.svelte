<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { ActionData } from './sverdle/$types';
	let postalCode = $state('A1B2C3');
	let { form }: { form: ActionData } = $props();

	
</script>

<svelte:head>
	<title>DiscountDinner</title>
	<meta name="description" content="DiscountDinner" />
</svelte:head>

<section>
	<h1>DiscountDinner</h1>

	<h2>Tagline here</h2>
	<form method="POST">
		<Input bind:value={postalCode} />
		<label
			>Postal Code
			<input name="postalCode" />
		</label>

		<button>Search</button>
	</form>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
