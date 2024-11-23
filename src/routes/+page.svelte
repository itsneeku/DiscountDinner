<script lang="ts">
	let { form }: { form: ActionData } = $props();
	import { enhance } from '$app/forms';
	import { Input } from '$lib/components/ui/input';
	import type { ActionData } from './sverdle/$types';
</script>

<section class="flex flex-col justify-center items-center flex-[0.6]">
	<h1 class="font-normal text-4xl text-center md:text-[2.4rem] w-full">DiscountDinner</h1>

	<h2 class="font-normal text-base">Tagline here</h2>
	<p class="font-normal ">Enter your postal code :3</p>
	<form method="POST" use:enhance>
		<Input name="postalCode" class="text-center" placeholder="H1A B2C" />
	</form>
	{form}
</section>
