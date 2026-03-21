# Blog Website Design

**Date:** March 21, 2026
**Project:** Personal blogging website inspired by Chip Huyen's site

## Overview

A clean, professional blogging website with markdown-based content creation. Focus on simplicity, readability, and ease of content management.

## Tech Stack

- **Astro** - Static site generator
- **Tailwind CSS** - Styling framework
- **Markdown** - Blog content format
- **Vercel** - Deployment platform

## Project Structure

```
MySite/
├── src/
│   ├── pages/
│   │   ├── index.astro          # Homepage with bio/intro
│   │   ├── blog/
│   │   │   ├── index.astro      # Blog listing page
│   │   │   └── [slug].astro     # Individual blog post template
│   ├── content/
│   │   └── blog/
│   │       ├── post-1.md        # Blog posts
│   │       └── post-2.md
│   ├── components/
│   │   ├── Header.astro         # Site navigation
│   │   ├── Footer.astro         # Site footer
│   │   └── BlogCard.astro       # Blog post preview card
│   ├── layouts/
│   │   └── BaseLayout.astro     # Common layout wrapper
│   └── styles/
│       └── global.css           # Global styles + Tailwind
├── public/
│   └── images/
│       ├── profile.jpg          # Profile photo
│       └── blog/                # Blog post images
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## Image Organization

All images stored in `public/` folder:
- Profile photo: `public/images/profile.jpg`
- Blog images: `public/images/blog/`

Referenced in markdown as: `![Description](/images/blog/image.png)`

## Blog Post Format

```markdown
---
title: "Post Title"
date: 2025-01-16
description: "Short description"
image: "/images/blog/hero-image.jpg"
---

## Introduction

Content here...
```

**Frontmatter fields:**
- `title` - Post title
- `date` - Publication date
- `description` - Summary for meta tags and listing
- `image` - Path to full-width hero image

**Content creation workflow:**
1. Create new `.md` file in `src/content/blog/`
2. Add frontmatter and content
3. Add hero image to `public/images/blog/`
4. Astro automatically generates the page

## Page Designs

### Homepage

**Layout:**
- Header navigation with site name and links
- Two-column layout: bio text (left) and circular profile photo (right)
- Multiple paragraphs about background, work, interests
- Links to social profiles (GitHub, etc.)
- Responsive: photo stacks on mobile

**Content:**
- Bio and links directly in `index.astro` for easy editing
- Profile photo at `public/images/profile.jpg`

### Blog Listing Page (`/blog`)

**Layout:**
- Header navigation
- "Blog" heading
- List of blog post cards, newest first

**Blog card components:**
- Hero image (consistent aspect ratio, e.g., 16:9)
- Post title
- Date and description preview
- Clickable card to full post

**Features:**
- No pagination initially (can add later)
- Simple, scannable list

### Individual Blog Post Page

**Layout:**
1. Header navigation
2. Full-width hero image (edge-to-edge)
3. Post title (large, centered)
4. Date
5. Content area (centered, max-width ~700-800px)

**Features:**
- Clean typography with proper hierarchy
- Code syntax highlighting
- Responsive images
- Comfortable reading width
- No table of contents (keeping it simple)

## Styling & Design System

**Color Scheme:**
- Background: Clean white/off-white
- Text: Dark gray/black
- Links: Blue or accent color
- Borders: Light gray
- Minimal palette (3-4 colors)

**Typography:**
- Headings: Clean sans-serif (Inter or system fonts)
- Body: Readable serif or sans-serif
- Code: Monospace

**Spacing:**
- Consistent Tailwind spacing scale
- Generous whitespace
- Clean, uncluttered feel

**Responsive:**
- Mobile-first approach
- Navigation adapts on mobile
- Images scale properly
- Readable on all screen sizes

## Components

1. **Header.astro** - Site navigation bar
2. **Footer.astro** - Simple footer with links
3. **BlogCard.astro** - Post preview card with hero image
4. **BaseLayout.astro** - Common wrapper (head, header, footer)

## Development Workflow

**Local development:**
```bash
npm run dev
```
- Hot reload for instant changes
- Create/edit markdown files
- No manual build step during development

**Creating a blog post:**
1. Add `.md` file to `src/content/blog/`
2. Write frontmatter and content
3. Add hero image to `public/images/blog/`
4. Post appears automatically

## Deployment

**Vercel setup:**
1. Push code to GitHub
2. Connect repo to Vercel
3. Auto-detects Astro configuration
4. Automatic deployment on every push to main
5. Get URL: `your-site.vercel.app`
6. Custom domain can be added later

**Content management:**
- All content in Git (version controlled)
- Edit markdown files directly
- No database or CMS needed
- Can edit via GitHub web interface if needed

## Pages to Build

**Initial launch:**
- Homepage (bio/intro)
- Blog listing page
- Blog post template

**Future additions (easy to add later):**
- About page
- Projects page
- Any custom sections

## Key Principles

- **Simplicity** - Start minimal, add features as needed
- **Markdown-first** - Easy content creation with `.md` files
- **Clean design** - Focus on readability and content
- **Easy deployment** - Push to Git, auto-deploy
- **No complexity** - No database, no CMS, just files
