<script>
	let scrollY = $state(0);
	let innerWidth = $state(0);
</script>

<svelte:window bind:scrollY bind:innerWidth />

<footer
	class="p-4 flex justify-center items-center {scrollY > 0 && innerWidth <= 640
		? 'opacity-0'
		: 'opacity-100'}"
>
	<p>:3 ❤️ CodeJam14</p>
</footer>
