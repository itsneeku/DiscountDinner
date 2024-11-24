<script lang="ts">
	import Header from './Header.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import Footer from './Footer.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<title>DiscountDinner</title>
	<meta name="description" content="DiscountDinner" />
</svelte:head>

<div class="h-svh p-4 flex flex-col bg-background">
	<ModeWatcher />
	<Header />
	<main class="pt-20 w-full flex-1">
		{@render children?.()}
	</main>
	<Footer />
</div>
