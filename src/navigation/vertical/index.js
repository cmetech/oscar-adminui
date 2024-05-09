const navigation = () => {
  return [
    {
      sectionTitle: 'Observability',
      action: 'read',
      subject: 'all'
    },
    {
      title: 'Alerting',
      icon: 'mdi:bell-alert',
      action: 'read',
      subject: 'all',
      children: [
        {
          title: 'Alerts',
          path: '/observability/alerts',
          icon: 'mdi:notifications-active',
          action: 'read',
          subject: 'all'
        },
        {
          title: 'Alert Rules',
          path: '/api/oscar/ui?path=alerting/list',
          icon: 'mdi:file-document-alert',
          action: 'read',
          subject: 'all',
          externalLink: true,
          openInNewTab: true,
          badgeContent: 'Grafana',
          badgeColor: 'info'
        }
      ]
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
          path: '/api/oscar/ui?path=d/bdkxfkrhtor28b/server-monitoring?orgId=1',
          icon: 'mdi:monitor-eye',
          action: 'manage',
          subject: 'settings-nav',
          externalLink: true,
          openInNewTab: true,
          badgeContent: 'Grafana',
          badgeColor: 'info'
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
          path: '/api/oscar/ui?path=explore',
          icon: 'mdi:explore',
          action: 'read',
          subject: 'all',
          externalLink: true,
          openInNewTab: true,
          badgeContent: 'Grafana',
          badgeColor: 'info'
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
      action: 'read',
      subject: 'all',
      children: [
        {
          title: 'Health',
          path: '/service-continuity/availability',
          icon: 'mdi:list-status',
          action: 'read',
          subject: 'all'
        },
        {
          title: 'Probes',
          path: '/service-continuity/probes',
          icon: 'mdi:monitor-eye',
          action: 'manage',
          subject: 'settings-nav'
        }
      ]
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
          title: 'BPMS',
          path: '/api/oscar/bpms',
          icon: 'mdi:workflow',
          action: 'read',
          subject: 'all',
          externalLink: true,
          openInNewTab: true,
          badgeContent: 'NiFi',
          badgeColor: 'info'
        }
      ]
    },
    {
      title: 'Security',
      path: '#',
      icon: 'mdi:security',
      action: 'manage',
      subject: 'settings-nav',
      badgeContent: 'Future',
      badgeColor: 'error'
    },
    {
      sectionTitle: 'AI/Analytics',
      action: 'manage',
      subject: 'admin-section'
    },
    {
      title: 'Anomaly Detection',
      icon: 'mdi:smoke-detector-variant-alert',
      path: '#',
      action: 'read',
      subject: 'all',
      badgeContent: 'Future',
      badgeColor: 'error'
    },
    {
      sectionTitle: 'Runtime',
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
      title: 'Settings',
      icon: 'mdi:cog',
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
