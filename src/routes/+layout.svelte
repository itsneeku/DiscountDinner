<script lang="ts">
	import Header from './Header.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import Footer from './Footer.svelte';
	import Neko from '$lib/neko.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<title>DiscountDinner</title>
	<meta name="description" content="DiscountDinner" />
</svelte:head>
<Neko />
<div class="h-svh p-4 flex flex-col">
	<ModeWatcher />
	<Header />
	<main class="pt-20 w-full flex-1">
		{@render children?.()}
	</main>
	<Footer />
</div>
