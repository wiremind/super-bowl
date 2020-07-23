module.exports = {
  title: 'SuperBowl',
  description: 'A dashboard for Remoulade',
  base: '/super-bowl/',
  themeConfig: {
    logo: '/logo.png',
    nav: [{
        text: 'Home',
        link: '/'
      },
      {
        text: 'Github',
        link: 'https://github.com/wiremind/super-bowl'
      },
    ],
    sidebar: [
      '/',
      {
        title: 'Components',
        collapsable: true,
        children: [
          ['/components/CNav', 'CNav'],
          ['/components/CTh', 'CTh'],
          ['/components/CNotFound', 'CNotFound'],
          ['/components/CSearchInput', 'CSearchInput'],
          ['/components/CPageFooter', 'CPageFooter'],
          ['/components/CMessageTable', 'CMessageTable'],
          ['/components/CMessageRow', 'CMessageRow'],
          ['/components/CMessageContent', 'CMessageContent'],
          ['/components/CGroupTable', 'CGroupTable'],
          ['/components/CGroupHeader', 'CGroupHeader'],
          ['/components/CGroupContent', 'CGroupContent'],
          ['/components/CJobTable', 'CJobTable'],
          ['/components/CJobRow', 'CJobRow'],
          ['/components/CEnqueueForm', 'CEnqueueForm'],
        ]
      },
      {
        title: 'Getting Started',
        collapsable: false,
        children: [
          ['/examples/messages', 'Messages'],
          ['/examples/groups', 'Groups']
        ]
      }
    ],
    sidebarDepth: 0,
    displayAllHeaders: true
  },
  plugins: [
    [
      'vuepress-plugin-zooming',
      {
        selector: '.zoom',
        delay: 1000,
        options: {
          bgColor: 'black',
          zIndex: 10000,
        },
      },
    ],
    ['@vuepress/back-to-top', true],
    ['@vuepress/last-updated'],
  ],
};
