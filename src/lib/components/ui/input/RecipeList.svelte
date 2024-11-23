<script lang="ts">
    import ProductList from './ProductList.svelte';
  
    export let recipes: Array<{
      id: number;
      name: string;
      description: string;
      products: Array<{
        name: string;
        cutout_image_url: string;
        brand: string;
        valid_from: string;
        valid_to: string;
        video_url: string | null;
        price: string;
      }>;
    }>;
  </script>
  
  <section class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Recipe List</h1>
    <div class="space-y-8">
      {#each recipes as recipe}
        <div class="border rounded-lg p-4 shadow-lg">
          <h2 class="text-xl font-semibold mb-2">{recipe.name}</h2>
          <p class="text-gray-600 mb-4">{recipe.description}</p>
          <ProductList products={recipe.products} />
        </div>
      {/each}
    </div>
  </section>