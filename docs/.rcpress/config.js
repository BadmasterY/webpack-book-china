module.exports = {
  base: '/relearn-webpack/',
  title: 'Webpack 中文书',
  description: 'BadmasterY(Mr.)',
  // logo: '/webpack.png',
  footer: 'Proudly powered by <a target="_blank" href="https://www.yvescoding.com/rcpress/">rcpress</a>',
  themeConfig: {
    lastUpdated: '最后更新',
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