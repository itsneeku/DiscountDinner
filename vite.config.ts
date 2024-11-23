import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import dotenv from 'dotenv';
dotenv.config();
export default defineConfig({
	plugins: [sveltekit(), mkcert()],
	server: { https: true }
});
