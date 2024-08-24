const navigation = () => {
  return [
    {
      sectionTitle: 'Observability',
      action: 'read',
      subject: 'nav'
    },
    {
      title: 'Alerting',
      icon: 'mdi:bell-alert',
      action: 'read',
      subject: 'nav',
      children: [
        {
          title: 'Alerts',
          path: '/observability/alerts',
          icon: 'mdi:notifications-active',
          action: 'read',
          subject: 'nav'
        },
        {
          title: 'Alert Rules',
          path: '/api/oscar/ui?path=alerting/list',
          icon: 'mdi:file-document-alert',
          action: 'read',
          subject: 'nav',
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
      action: 'read',
      subject: 'nav',
      children: [
        {
          title: 'Inventory',
          path: '/observability/inventory',
          icon: 'mdi:server-network',
          action: 'read',
          subject: 'nav'
        },
        {
          title: 'Monitoring',
          path: '/api/oscar/ui?path=d/bdkxfkrhtor28b/server-monitoring?orgId=1',
          icon: 'mdi:monitor-eye',
          action: 'read',
          subject: 'nav',
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
      subject: 'nav',
      children: [
        {
          title: 'Explorer',
          path: '/api/oscar/ui?path=explore',
          icon: 'mdi:explore',
          action: 'read',
          subject: 'nav',
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
      subject: 'nav'
    },
    {
      title: 'SLOs',
      path: '/service-continuity/slo',
      icon: 'mdi:target',
      action: 'read',
      subject: 'nav'
    },
    {
      title: 'Availability',
      icon: 'mdi:list-status',
      action: 'read',
      subject: 'nav',
      children: [
        {
          title: 'Probes',
          path: '/service-continuity/probes',
          icon: 'mdi:monitor-eye',
          action: 'read',
          subject: 'nav'
        }
      ]
    },
    {
      title: 'Automations',
      icon: 'mdi:arrow-decision-auto',
      action: 'read',
      subject: 'nav',
      children: [
        {
          title: 'Tasks',
          path: '/service-continuity/tasks',
          icon: 'mdi:subtasks',
          action: 'read',
          subject: 'nav'
        },
        {
          title: 'Workflows',
          path: '/service-continuity/workflows',
          icon: 'mdi:workflow',
          action: 'read',
          subject: 'nav'
        }
      ]
    },
    {
      sectionTitle: 'AI/Analytics',
      action: 'read',
      subject: 'nav'
    },
    {
      title: 'Anomaly Detection',
      icon: 'mdi:smoke-detector-variant-alert',
      path: '#',
      action: 'read',
      subject: 'nav',
      badgeContent: 'Future',
      badgeColor: 'error'
    },
    {
      sectionTitle: 'Runtime',
      action: 'manage',
      subject: 'runtime'
    },
    {
      title: 'Application',
      icon: 'mdi:application-cog',
      action: 'manage',
      subject: 'runtime',
      children: [
        {
          title: 'Services',
          path: '/api/oscar/services',
          icon: 'mdi:server-network',
          action: 'manage',
          subject: 'runtime',
          externalLink: true,
          openInNewTab: true,
          badgeContent: 'Portainer',
          badgeColor: 'info'
        },
        {
          title: 'Notifiers',
          path: '/management/application/notifiers',
          icon: 'mdi:notifications-active',
          action: 'manage',
          subject: 'runtime'
        },
        {
          title: 'Connections',
          path: '/management/application/connections',
          icon: 'mdi:transit-connection-variant',
          action: 'manage',
          subject: 'runtime'
        },
      ]
    },
    {
      title: 'Settings',
      icon: 'mdi:cog',
      action: 'manage',
      subject: 'runtime',
      children: [
        {
          title: 'Users',
          icon: 'mdi:account-multiple',
          path: '/management/security/users',
          action: 'manage',
          subject: 'runtime'
        }
      ]
    }
  ]
}

export default navigation
