<script>
	import Moon from 'lucide-svelte/icons/moon';
	import Sun from 'lucide-svelte/icons/sun';
	import Github from 'lucide-svelte/icons/github';

	import { Button } from '$lib/components/ui/button';
	import { toggleMode } from 'mode-watcher';

	let scrollY = $state(0);
	let innerWidth = $state(0);
	const github = `https://github.com/itsneeku/DiscountDinner`;
</script>

<svelte:window bind:scrollY bind:innerWidth />

<header
	class="fixed left-0 top-0 m-4 flex transition-all flex-col
{scrollY > 0 && innerWidth <= 640 ? 'opacity-0' : 'opacity-100'}"
>
	<Button onclick={() => window.open(github, '_blank')} variant="ghost" size="icon"
		><Github />
	</Button>
	<Button onclick={toggleMode} variant="ghost" size="icon">
		<Sun
			class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
		/>
		<Moon
			class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
		/>
	</Button>
</header>
