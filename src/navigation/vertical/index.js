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
      title: 'Infrastructure',
      icon: 'mdi:collections',
      action: 'manage',
      subject: 'infra-nav',
      children: [
        {
          title: 'Inventory',
          path: '/observability/inventory',
          icon: 'mdi:server-network',
          action: 'manage',
          subject: 'settings-nav'
        },
        {
          title: 'Monitoring',
          path: '/api/oscar/ui',
          icon: 'mdi:monitor-eye',
          action: 'manage',
          subject: 'settings-nav',
          externalLink: true,
          openInNewTab: true,
          badgeContent: 'Grafana',
          badgeColor: 'error'
        }
      ]
    },
    {
      title: 'Logs',
      icon: 'mdi:math-log',
      action: 'read',
      subject: 'all',
      children: [
        {
          title: 'Explorer',
          path: '/observability/logs/explorer',
          icon: 'mdi:explore',
          action: 'read',
          subject: 'all'
        }
      ]
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
      sectionTitle: 'Management',
      action: 'manage',
      subject: 'admin-section'
    },
    {
      title: 'Application',
      icon: 'mdi:application-cog',
      action: 'manage',
      subject: 'settings-nav',
      children: [
        {
          title: 'Services',
          path: '/management/application/services',
          icon: 'mdi:server-network',
          action: 'manage',
          subject: 'settings-nav'
        }
      ]
    },
    {
      title: 'Security',
      icon: 'mdi:account-security',
      action: 'manage',
      subject: 'settings-nav',
      children: [
        {
          title: 'Users',
          icon: 'mdi:account-multiple',
          path: '/management/security/users',
          action: 'manage',
          subject: 'settings-nav',
          badgeContent: 'Keycloak',
          badgeColor: 'error'
        }
      ]
    }
  ]
}

export default navigation
