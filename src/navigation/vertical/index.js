const navigation = () => {
  return [
    {
      title: 'Overview',
      path: '/home',
      icon: 'mdi:home'
    },
    {
      sectionTitle: 'Reports'
    },
    {
      sectionTitle: 'Tools'
    },
    {
      title: 'Monitoring',
      path: 'https://www.google.com',
      icon: 'mdi:monitor-eye',
      externalLink: true,
      openInNewTab: true
    },
    {
      sectionTitle: 'Administration'
    },
    {
      title: 'Services',
      icon: 'mdi:list-status',
      path: '/services'
    },
    {
      title: 'Automations',
      path: '/automations',
      icon: 'mdi:arrow-decision-auto'
    },
    {
      sectionTitle: 'Help & Feedback'
    },
    {
      title: 'OSCAR Academy',
      path: '/oscar-academy',
      icon: 'mdi:information-slab-circle'
    },
    {
      title: 'Feedback',
      path: '/feedback',
      icon: 'mdi:comment-alert'
    },
    {
      title: "What's New",
      path: '/new-features',
      icon: 'mdi:new-box'
    }
  ]
}

export default navigation
