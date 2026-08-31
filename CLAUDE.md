# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is Vishal Shivam's personal blog/portfolio site, built with Astro and Tailwind CSS v4, deployed to GitHub Pages via GitHub Actions. Content is markdown-first: creating a blog post means adding a `.md` file, no CMS or database.

## Commands

- `npm run dev` — start local dev server at `localhost:4321`
- `npm run build` — build production site to `./dist/`
- `npm run preview` — preview the production build locally
- `npm run astro -- <cmd>` — run any Astro CLI command (e.g. `npm run astro check` for type checking)

There is no test suite or linter configured in this project.

## Architecture

**Content collection (`src/content.config.ts`)**: blog posts are a single Astro content collection loaded via `glob({ pattern: '**/*.md', base: './src/content/blog' })`. Frontmatter schema (Zod) requires `title`, `date`, `description`, `image` — all four are required on every post, and `image` must point to a hero image (referenced under `public/`, e.g. `/images/blog/foo.jpg`).

**Routing**:
- `src/pages/index.astro` — homepage (bio content lives inline in this file).
- `src/pages/blog/index.astro` — blog listing, sorted newest-first via `getCollection('blog')`.
- `src/pages/blog/[slug].astro` — post detail page; `getStaticPaths` generates one route per post keyed on `post.id` (the file's slug), rendered via Astro's `render(post)` → `<Content />`.

**Layout**: `src/layouts/BaseLayout.astro` is the single shared wrapper (head/meta, header nav, footer) used by every page — takes `title` and optional `description` props. `src/components/BlogCard.astro` is the post-preview card used on the blog listing page.

**Base path handling (`astro.config.mjs`)**: the Astro `base` and `site` are computed from `GITHUB_REPOSITORY_OWNER`/`GITHUB_REPOSITORY` at build time to support both a user site (`<owner>.github.io`, base `/`) and a project site (base `/<repo>/`). This only resolves correctly in CI (GitHub Actions sets those env vars); locally it falls back to base `/`.

**Deployment**: `.github/workflows/*.yml` builds on every push to `main` and deploys `./dist` to GitHub Pages via `actions/deploy-pages`. There is no separate staging environment — pushing to `main` ships to production.

## Adding a blog post

1. Add a new `.md` file under `src/content/blog/`.
2. Include frontmatter: `title`, `date`, `description`, `image`.
3. Add the hero image to `public/images/blog/`.
4. The post is picked up automatically by the content collection glob — no registration needed elsewhere.
