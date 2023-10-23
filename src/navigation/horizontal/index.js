const navigation = () => {
  return [
    {
      title: 'Overview',
      path: '/home',
      icon: 'mdi:home'
    },
    {
      title: 'Second Page',
      path: '/second-page',
      icon: 'mdi:email'
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
      title: 'Services',
      icon: 'mdi:list-status',
      path: '/services'
    },
    {
      title: 'Automations',
      path: '/automations',
      icon: 'mdi:arrow-decision-auto'
    }
  ]
}

export default navigation
