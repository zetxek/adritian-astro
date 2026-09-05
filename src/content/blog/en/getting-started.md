---
title: 'Create your own version of the site'
date: 2025-02-11T14:38:33+02:00
description: 'A guide to help you create your own version of the site using Adritian: the main steps to get started, and how to customize it to your needs.'
tags:
  - adritian
  - guide
cover: '../images/getting-started-cover.png'
---

This article is a guide to help you create your own version of the site using [Adritian](https://github.com/zetxek/adritian-free-hugo-theme). It will cover the main steps to get started with the theme, and how to customize it to your needs.

### Creating a site

This theme is for the content management system [Hugo](https://gohugo.io/), so that will be a pre-requirement.
Make sure that you install the `extended` version of Hugo, as the theme uses SCSS for styling, as well as image optimization.

A very good place to start is the Quick start guide: [https://gohugo.io/getting-started/quick-start/](https://gohugo.io/getting-started/quick-start/)

**💡 Tip:** keep your repository clean and tidy by creating a [relevant `.gitignore` file](https://github.com/github/gitignore/blob/main/community/Golang/Hugo.gitignore) since the beginning:

```
# Generated files by hugo
/public/
/resources/_gen/
/assets/jsconfig.json
hugo_stats.json

# Executable may be added to repository
hugo.exe
hugo.darwin
hugo.linux

# Temporary lock file while building
/.hugo_build.lock
```

### Adding the theme

Once you have a site created, you can add the theme to your site by following the instructions in the [README](https://github.com/zetxek/adritian-free-hugo-theme?tab=readme-ov-file#as-a-hugo-module-recommended). While there are multiple ways to add the theme, the recommended way is to use Hugo Modules.

This configuration allows you to have a base to edit and adapt to your site, and see the available functionalities.
Make sure to edit `baseURL`, `title` and `description`. You can edit the header links, as well as the languages to your needs.

1. Get the module: `hugo mod get -u`
1. Execute `hugo mod npm pack` — this will generate a `package.json` file in the root folder of your site, with the dependencies for the theme.
1. Execute `npm install` — this will install the dependencies for the theme (including Bootstrap)
1. (Optional, to override the defaults) Create a file `data/homepage.yml` with the contents of the [`exampleSite/data/homepage.yml`](https://github.com/zetxek/adritian-free-hugo-theme/blob/main/exampleSite/data/homepage.yml) file, and customize to your needs.
1. Start Hugo with `hugo server`...
1. 🎉 The theme is alive on http://localhost:1313/ (if everything went well)

### Editing the theme content

Currently the theme content is spread over multiple folders and files. Some of the key files are:

- `hugo.toml`: Main configuration for your Hugo site. Here you can set the site title, description, and theme specific settings such as menu structure, analytics, and blog settings.
- `data/homepage.yml`: homepage structure, content and sections — including social links, and the hero section.
- `assets/`: Where you can store static assets such as images, CSS, and JavaScript files.
- `content/`: This is where your content files will live. The theme-specific ones are `content/blog/`, `content/portfolio/`, `content/project/`, `content/testimonial/`, `content/education/`, `content/experience/`, and `content/client-and-work/`.

### Customizing the theme

Hugo allows you to customize the theme in many ways. You can override the theme's layouts, styles, and content.
For that, you just need to locate the file you would like to change, copy it to your site's corresponding folder (`layouts`, `assets`, ...), and edit it.

**Note**: if you do this you will not benefit from theme updates, and that could lead to bugs. You can keep an eye on the [CHANGELOG.md](https://github.com/zetxek/adritian-free-hugo-theme/blob/main/CHANGELOG.md) file.

### Improving the theme

Maybe some of the customizations you do are worth a share. If you think that your changes could be useful for others, feel free to open a pull request in the [GitHub repository](https://github.com/zetxek/adritian-free-hugo-theme/pulls) — collaborations are very welcome, especially if the contributions come from real-world use cases.

### Publishing the site

Once you have your site ready, you can publish it to the web. There are many ways to do this, but the recommended one is to use a service like [Vercel](https://vercel.com/) or [GitHub Pages](https://pages.github.com/). Both services offer free hosting for static sites, and they can be connected to your GitHub repository for automatic deployments.
