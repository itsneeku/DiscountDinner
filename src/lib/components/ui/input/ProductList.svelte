<script lang="ts">
    export let products: Array<{
      name: string;
      cutout_image_url: string;
      brand: string;
      valid_from: string;
      valid_to: string;
      video_url: string | null;
      price: string;
    }>;
  </script>
  
  <section class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Product List</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each products as product}
        <div class="border rounded-lg p-4 shadow-lg">
          <img src={product.cutout_image_url} alt={product.name} class="w-full h-48 object-cover mb-4 rounded" />
          <h2 class="text-lg font-semibold mb-2">{product.name} - {product.brand}</h2>
          <p class="text-gray-600 mb-2">Price: ${product.price}</p>
          <p class="text-gray-600 mb-2">Valid From: {new Date(product.valid_from).toLocaleDateString()}</p>
          <p class="text-gray-600 mb-2">Valid To: {new Date(product.valid_to).toLocaleDateString()}</p>
        </div>
      {/each}
    </div>
  </section>
  