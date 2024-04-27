const navigation = () => {
  return [
    {
      title: 'Overview',
      path: '/home',
      icon: 'mdi:telescope',
      action: 'read',
      subject: 'all'
    },
    {
      sectionTitle: 'Observability',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Alerts',
      icon: 'mdi:bell-alert',
      path: '/observability/alerts',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Advanced Dashboards',
      path: '/api/oscar/ui',
      icon: 'mdi:monitor-eye',
      externalLink: true,
      openInNewTab: true,
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Performance',
      icon: 'mdi:chart-areaspline-variant',
      path: '/observability/performance',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Capacity',
      icon: 'mdi:thermometer-check',
      path: '/observability/capacity',
      action: 'read',
      subject: 'all'
    },
    {
      sectionTitle: 'Service Continuity',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'SLOs',
      path: '/service-continuity/slo',
      icon: 'mdi:target',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Availability',
      icon: 'mdi:list-status',
      path: '/service-continuity/availability',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Automations',
      icon: 'mdi:arrow-decision-auto',
      action: 'read',
      subject: 'all',
      children: [
        {
          title: 'Tasks',
          path: '/service-continuity/tasks',
          icon: 'mdi:subtasks',
          action: 'read',
          subject: 'all'
        },
        {
          title: 'Workflows',
          path: '/service-continuity/workflows',
          icon: 'mdi:workflow',
          action: 'read',
          subject: 'all'
        }
      ]
    },
    {
      sectionTitle: 'Administration',
      action: 'manage',
      subject: 'admin-section'
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
      title: 'Users',
      icon: 'mdi:account-multiple',
      path: '/administration/users',
      action: 'manage',
      subject: 'settings-nav'
    }
  ]
}

export default navigation
