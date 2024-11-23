<script>
	import Header from './Header.svelte';
	import '../app.css';
	import github from '$lib/images/github.svg';
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
		<a href="https://github.com/itsneeku/DiscountDinner" class="p-2">
			<img src={github} alt="GitHub" class="w-8 h-8" />
		</a>
	</footer>

</div>
