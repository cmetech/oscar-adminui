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
      title: 'Service',
      icon: 'mdi:list-status',
      path: '/service'
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
      title: 'Automations',
      path: 'https://www.google.com',
      icon: 'mdi:arrow-decision-auto',
      externalLink: true,
      openInNewTab: true
    },
    {
      sectionTitle: 'Administration'
    },
    {
      badgeContent: '3',
      badgeColor: 'info',
      title: 'Management',
      icon: 'mdi:cog',
      children: [
        {
          title: 'Environment Settings',
          path: '/acl',
          icon: 'mdi:email'
        },
        {
          title: 'Second Page',
          path: '/second-page',
          icon: 'mdi:email'
        }
      ]
    }
  ]
}

export default navigation
