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
      title: 'Alerts & Events',
      icon: 'mdi:bell-alert',
      path: '/services',
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
      title: 'SLA',
      icon: 'mdi:check-decagram',
      path: '/services/sla'
    },
    {
      sectionTitle: 'Service Continuity',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Availability',
      icon: 'mdi:list-status',
      path: '/services/availability',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Capacity',
      icon: 'mdi:thermometer-check',
      path: '/services/capacity',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Performance',
      icon: 'mdi:chart-areaspline-variant',
      path: '/services/performance',
      action: 'read',
      subject: 'all'
    },
    {
      sectionTitle: 'AI/Automation',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Automations',
      path: '/tasks',
      icon: 'mdi:arrow-decision-auto',
      action: 'read',
      subject: 'all'
    },
    {
      sectionTitle: 'Infrastructure',
      action: 'manage',
      subject: 'infrastructure-section'
    },
    {
      title: 'Inventory',
      icon: 'mdi:server',
      path: '/administration/inventory',
      action: 'manage',
      subject: 'settings-nav'
    },
    {
      title: 'Services',
      icon: 'mdi:service-toolbox',
      path: '/administration/services',
      action: 'manage',
      subject: 'settings-nav'
    },
    {
      sectionTitle: 'Administration',
      action: 'manage',
      subject: 'admin-section'
    },
    {
      title: 'Users',
      icon: 'mdi:account-multiple',
      path: '/administration/users',
      action: 'manage',
      subject: 'settings-nav'
    }
  ]
}

export default navigation
