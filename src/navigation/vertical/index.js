const navigation = () => {
  return [
    {
      title: 'Overview',
      path: '/home',
      icon: 'mdi:home',
      action: 'read',
      subject: 'all'
    },
    {
      sectionTitle: 'Observability',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Advanced Dashboards',
      path: 'https:localhost/ui',
      icon: 'mdi:monitor-eye',
      externalLink: true,
      openInNewTab: true,
      action: 'read',
      subject: 'all'
    },
    {
      sectionTitle: 'Service Continuity',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Alerts & Incidents',
      icon: 'mdi:bell-alert',
      path: '/services',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Availability',
      icon: 'mdi:list-status',
      path: '/services',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Capacity',
      icon: 'mdi:thermometer-check',
      path: '/services',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Performance',
      icon: 'mdi:chart-areaspline-variant',
      path: '/services',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'SLA',
      icon: 'mdi:check-decagram',
      path: '/services'
    },
    {
      sectionTitle: 'AI/Automation',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Runbooks',
      path: '/runbooks',
      icon: 'mdi:arrow-decision-auto',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Workflows',
      path: '/workflows',
      icon: 'mdi:sitemap',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Canaries (Synthetic)',
      path: '/workflows',
      icon: 'mdi:api',
      action: 'read',
      subject: 'all'
    },
    {
      sectionTitle: 'Administration',
      action: 'manage',
      subject: 'admin-section'
    },
    {
      title: 'Settings',
      icon: 'mdi:cog',
      path: '/settings',
      action: 'manage',
      subject: 'settings-nav'
    },
    {
      sectionTitle: 'Help & Feedback',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'OSCAR Academy',
      path: '/oscar-academy',
      icon: 'mdi:school-outline',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Feedback',
      path: '/feedback',
      icon: 'mdi:comment-alert',
      action: 'read',
      subject: 'all'
    },
    {
      title: "What's New",
      path: '/new-features',
      icon: 'mdi:new-box',
      action: 'read',
      subject: 'all'
    }
  ]
}

export default navigation
