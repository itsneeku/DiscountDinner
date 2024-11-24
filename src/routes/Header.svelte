<script>
	import github from '$lib/images/github.svg';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';

	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
</script>

<header class="flex justify-between">
	<div class="w-12 h-12 flex">
		<a
			href="https://github.com/itsneeku/DiscountDinner"
			class="flex items-center justify-center w-full h-full hover:text-[--color-theme-1]"
		>
			<img src={github} alt="GitHub" class="w-8 h-8 object-contain" />
		</a>
		<Button onclick={toggleMode} variant="ghost" size="icon">
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</div>
</header>
