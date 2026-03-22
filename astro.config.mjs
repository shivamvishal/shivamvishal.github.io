// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserSite = Boolean(owner && repo && repo.toLowerCase() === `${owner}.github.io`.toLowerCase());
const base = repo ? (isUserSite ? '/' : `/${repo}/`) : '/';

// https://astro.build/config
export default defineConfig({
  site: owner ? `https://${owner}.github.io` : 'http://localhost:4321',
  base,
  vite: {
    plugins: [tailwindcss()]
  }
});