<script>
	import Header from './Header.svelte';
	import '../app.css';
	let { children } = $$props;
</script>

<svelte:head>
	<title>DiscountDinner</title>
	<meta name="description" content="DiscountDinner" />
</svelte:head>

<div class="flex flex-col min-h-screen m-0 bg-fixed">
	<Header />
	<main class="flex-1 flex flex-col p-4 w-full max-w-4xl mx-auto box-border">
		<slot />
	</main>
	<footer class="flex justify-center items-center p-3 sm:px-0">
		<p>:3 for CodeJam14</p>
	</footer>
</div>
