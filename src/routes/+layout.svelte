<script lang="ts">
	import Header from './Header.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>DiscountDinner</title>
	<meta name="description" content="DiscountDinner" />
</svelte:head>

<div class="flex flex-col min-h-screen m-0 bg-fixed">
	<ModeWatcher />

	<Header />
	<main class="flex-1 flex flex-col p-4 w-full max-w-4xl mx-auto box-border">
		{@render children?.()}
	</main>
	<footer class="flex justify-center items-center p-3 sm:px-0">
		<p>:3 for CodeJam14</p>
	</footer>
</div>
