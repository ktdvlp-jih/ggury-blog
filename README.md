<div align="center">

  <img src="./assets/ggury-blog.png" width="360px" />

</div>

[![Financial Contributors on Open Collective](https://opencollective.com/ggury-blog/all/badge.svg?label=financial+contributors)](https://opencollective.com/ggury-blog) [![Greenkeeper badge](https://badges.greenkeeper.io/bottlehs/ggury-blog.svg)](https://greenkeeper.io/)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/bottlehs/ggury-blog.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/bottlehs/ggury-blog/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/bottlehs/ggury-blog.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/bottlehs/ggury-blog/context:javascript)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/ktdvlp-jih/ggury-blog/issues)
[![Netlify Status](https://api.netlify.com/api/v1/badges/ff4ecb81-be61-450f-8921-f05ba056c375/deploy-status)](https://app.netlify.com/sites/friendly-empanada-f43f35/deploys)

![screenshot](./assets/screenshot.png)

In this template...

- 👓 Code highlight with Fira Code font
- 😄 Emoji (emojione)
- 🗣 Social share feature (Twitter, Facebook)
- 💬 Comment feature (disqus, utterances)
- ☕ 'Buy me a coffee' service
- 📝 GA
- ⚙ Configurable
- 📚 Netlify CMS

> [About this Template](https://www.gatsbyjs.org/starters/bottlehs/ggury-blog/)

## 🔗 Live Demo

- [Demo](https://ggury-blog.netlify.app)

<details>
  <summary>Use case</summary>
  <p>
    <img src="./assets/demos.png" alt="demo-image">
    <ul>
      <li>bottlehs.com: https://bottlehs.com</li>
    </ul>
  </p>
</details>

> If you're using this template, Please Pull Request for `Use case`!

## 🚀 Quick Start

### 1. Create a Gatsby site

```sh
# create a new Gatsby site using the blog starter
npx gatsby new my-blog https://github.com/ktdvlp-jih/ggury-blog
```

> If you are not using `npx`, following [Gatsby Getting Started](https://www.gatsbyjs.org/docs/quick-start)

```sh
npm install -g gatsby-cli
gatsby new my-blog https://github.com/ktdvlp-jih/ggury-blog
```

### 2. Start developing

```sh
cd my-blog/
npm start
# open localhost:8000
```

### 3. Add your content

You can write...

- contents to blog in `content/blog` directory.
- resume `content/__about` directory.

> With markdown syntax and some meta data

```sh
npm run post
```

### 4. Fix meta data

You can fix meta data of blog in `/gatsby-meta-config.js` file.

### 5. Publish with [netlify](https://netlify.com)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ktdvlp-jih/ggury-blog)

:bulb: if you want to deploy github pages, add following script to package.json

```json
"scripts": {
    "deploy": "gatsby build && gh-pages -d public -b master -r 'git@github.com:${your github id}/${github page name}.github.io.git'"
}
```

## 🎨 Customize

### ⚙ Gatsby config

```sh
/root
├── gatsby-browser.js // font, polyfill, onClientRender ...
├── gatsby-config.js // Gatsby config
├── gatsby-meta-config.js // Template meta config
└── gatsby-node.js // Gatsby Node config
```

### ❤ Structure

```sh
src
├── components
│   ├── category
│   ├── bio.js
│   ├── layout.js
│   ├── seo.js
│   ├── share.js
│   ├── tableOfContents.js
│   └── tag.js
├── pages
│   ├── 404.js
│   ├── about.js
│   ├── index.js
│   └── tags.js
│── normalize.css
│── properties.css
│── properties.dark.css
│── normalize.css
│── style.css
│── style.dark.css
└── templates
    ├── blog-post.js
    └── tags.js
```

### 🍭 Tips (You can change...)

- Profile image! (replace file in `/content/assets/profile-pic.png`)
- Favicon image! (replace file in `/content/assets/app-icon.png`)
- Utterances repository! (replace repository address in `/gatsby-meta-config.js`)
  - ⚠️ Please check, this guide(<https://utteranc.es/>)

## ☕ Like it?

<a href="https://www.buymeacoffee.com/bottlehs" target="_blank">
  <img src="https://www.buymeacoffee.com/assets/img/custom_images/purple_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" >
</a>

## 🤔 If

If you are currently writing in the Medium, consider migration with [medium-to-own-blog](https://github.com/mathieudutour/medium-to-own-blog)!

## :bug: Bug reporting

[Issue](https://github.com/ktdvlp-jih/ggury-blog/issues)

## 😎 Contributing

[Contributing guide](./CONTRIBUTING.md)

## Contributors

### Code Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].

<a href="https://github.com/ktdvlp-jih/ggury-blog/graphs/contributors">
<img src="https://opencollective.com/ggury-blog/contributors.svg?width=890&button=false" />
</a>

### Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/ggury-blog/contribute)]

#### Individuals

<a href="https://opencollective.com/ggury-blog"><img src="https://opencollective.com/ggury-blog/individuals.svg?width=890"></a>

#### Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Contribute](https://opencollective.com/ggury-blog/contribute)]

## LICENSE

[MIT](./LICENSE)

<div align="center">

<sub><sup>Project by <a href="https://github.com/bottlehs">@bottlehs</a></sup></sub><small>🤩</small>

</div>
