module.exports = {
  // theme: './theme',
  base: '/relearn-webpack/',
  title: 'Webpack 中文书',
  description: 'BadmasterY(Mr.)',
  // logo: '/webpack.png',
  footer: 'Proudly powered by <a target="_blank" href="https://www.yvescoding.com/rcpress/">rcpress</a>',
  themeConfig: {
    lastUpdated: '最后更新于',
    search: false,
    // maxTocDeep: 4, // 没啥用
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
      '/webpack/': [
        ['Translator-Preface', '译者序'],
        ['Preface', '前言'],
        ['Introduction', '介绍'],
        ['What-is-webpack', '什么是 Webpack'],
        {
          title: 'Developing',
          collapsable: false,
          children: [
            ['./Developing/start', '起步'],
            ['./Developing/development-server', '开发服务器'],
            ['./Developing/composing-configuration', '组合配置'],
          ],
        },
        {
          title: 'Appendices', // 附录
          collapsable: false,
          children: [
            ['./Appendices/comparison', '构建工具比较'],
            ['./Appendices/hmr', '模块热更新'],
            ['./Appendices/css-modules', 'CSS 模块'],
            ['./Appendices/searching-with-react', '用 React 搜索'],
            ['./Appendices/troubleshooting', '故障排除'],
            ['./Appendices/glossary', '术语表'],
          ],
        }
      ]
    }
  }
};