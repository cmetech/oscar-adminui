const navigation = () => {
  return [
    {
      title: 'Overview',
      path: '/home',
      icon: 'mdi:home-outline'
    },
    {
      sectionTitle: 'Administration'
    },
    {
      title: 'Configuration',
      icon: 'mdi:cog-outline',
      children: [
        {
          title: 'Environment Settings',
          path: '/acl',
          icon: 'mdi:email-outline'
        },
        {
          title: 'Second Page',
          path: '/second-page',
          icon: 'mdi:email-outline'
        }
      ]
    },
    {
      title: 'Service Status',
      icon: 'mdi:list-status',
      path: '/service-status'
    }
  ]
}

export default navigation
