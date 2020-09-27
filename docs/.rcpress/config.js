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
          title: 'Styling', // 样式
          collapsable: false,
          children: [
            ['./Styling/loading-styles', '加载样式'],
            ['./Styling/separating-css', '分离 CSS'],
            ['./Styling/eliminating-unused-css', '清除未使用的 CSS'],
            ['./Styling/autoprefixing', '自动处理前缀'],
          ],
        },
        {
          title: 'Loading', // 加载资源
          collapsable: false,
          children: [
            ['./Loading/loader-definitions', '加载器定义'],
            ['./Loading/images', '加载图片'],
            ['./Loading/fonts', '加载字体'],
            ['./Loading/javascript', '加载 JavaScript'],
          ],
        },
        {
          title: 'Building',
          collapsable: false,
          children: [
            ['./Building/source-maps', 'Source map'],
            ['./Building/code-splitting', '代码拆分'],
            ['./Building/bundle-splitting', '捆绑拆分'],
            ['./Building/tidying-up', '整理'],
          ]
        },
        {
          title: 'Optimizing',
          collapsable: false,
          children: [
            ['./Optimizing/minifying', '压缩'],
            ['./Optimizing/tree-shaking', 'Tree shaking'],
            ['./Optimizing/environment-variables', '环境变量'],
            ['./Optimizing/adding-hashes-to-filenames', '在文件名中添加哈希'],
            ['./Optimizing/separating-runtime', '分离运行时'],
            ['./Optimizing/build-analysis', '构建分析'],
            ['./Optimizing/performance', '性能'],
          ]
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
        },
      ]
    }
  }
};