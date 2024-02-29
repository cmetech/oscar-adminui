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
      title: 'Users',
      icon: 'mdi:account-multiple',
      path: '/settings/users',
      action: 'manage',
      subject: 'settings-nav'
    },
    {
      title: 'Inventory',
      icon: 'mdi:server',
      path: '/settings/inventory',
      action: 'manage',
      subject: 'settings-nav'
    },
    {
      sectionTitle: 'Ask Oscar',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Oscar Chat',
      icon: 'mdi:frequently-asked-questions',
      path: '#',
      action: 'read',
      subject: 'all'
    }
  ]
}

export default navigation
