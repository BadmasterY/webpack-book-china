module.exports = {
  base: '/relearn-webpack/',
  title: 'Webpack 中文书',
  description: 'BadmasterY(Mr.)',
  // logo: '/webpack.png',
  // The text at the bottom of the home page supports html format
  footer: 'Proudly powered by <a target="_blank" href="https://www.yvescoding.com/rcpress/">rcpress</a>',
  // Each element in the format is [tagName, {/* element attribute, which will be attached to the generated element as it is. */}, /* child node */]
  // some elements that will be inserted into the head of the site when the site is generated,
  // head: [['link', { rel: 'icon', href: '/favicon.png' }]],
  themeConfig: {
    search: false,
    // The website header link can be set to important and will be displayed in red.
    nav: [
      {
        text: 'Webpack',
        link: '/webpack/Translator-Preface'
      },
      {
        text: 'GitHub',
        link: 'https://github.com/BadmasterY/webpack-book-china',
        important: true
      }
    ],
    sidebar: {
      // Note the point.
      // The set property name must be the file/directory that exists in your document directory (default is docs)
      // The physical path of the rcpress lookup file is: docs (the document directory you set) + the key name in the sidebar
      // For example, the physical path corresponding to /guide/ below is docs/guide/
      '/webpack/': [
        // Corresponding physical path: docs/guide/introduction.md
        // Since the frontMatter setting home is true, the access path does not have introduction, direct /guide/
        ['Translator-Preface', '译者序'],
        ['Preface', '前言'],
        ['Introduction', '介绍'],
        ['What-is-webpack', '什么是 Webpack'],
        // {
        //   title: 'page-collapsed',
        //   collapsable: false,
        //   children: ['page-collapsed']
        // },
        // {
        //   title: 'page-group-exapmle',
        //   // The secondary menu is collapsed by default, and false is set to default expansion.
        //   collapsable: false,
        //   children: [
        //     // You can set a deeper menu and support up to two layers.
        //     // See the effect after running the initialization project
        //     {
        //       // Set the level 3 menu title
        //       title: 'group-1',
        //       // Corresponding physical path: docs/guide/group-1-item.md
        //       children: ['group-1-item']
        //     },
        //     {
        //       title: 'group-2',
        //       // Corresponding physical path: docs/guide/group-2-item.md
        //       children: ['group-2-item']
        //     }
        //   ]
        // }
      ]
    }
  }
};