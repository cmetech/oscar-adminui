const navigation = () => {
  return [
    {
      title: 'Overview',
      path: '/home',
      icon: 'mdi:home'
    },
    {
      sectionTitle: 'Observability'
    },
    {
      title: 'Advanced Dashboards',
      path: 'https://www.grafana.com',
      icon: 'mdi:monitor-eye',
      externalLink: true,
      openInNewTab: true
    },
    {
      sectionTitle: 'Service Continuity'
    },
    {
      title: 'Alerts & Incidents',
      icon: 'mdi:bell-alert',
      path: '/services'
    },
    {
      title: 'Availability',
      icon: 'mdi:list-status',
      path: '/services'
    },
    {
      title: 'Capacity',
      icon: 'mdi:thermometer-check',
      path: '/services'
    },
    {
      title: 'Performance',
      icon: 'mdi:chart-areaspline-variant',
      path: '/services'
    },
    {
      title: 'SLA',
      icon: 'mdi:check-decagram',
      path: '/services'
    },
    {
      sectionTitle: 'AI/Automation'
    },
    {
      title: 'Runbooks',
      path: '/runbooks',
      icon: 'mdi:arrow-decision-auto'
    },
    {
      title: 'Workflows',
      path: '/workflows',
      icon: 'mdi:sitemap'
    },
    {
      title: 'Canaries (Synthetic)',
      path: '/workflows',
      icon: 'mdi:api'
    },
    {
      sectionTitle: 'Help & Feedback'
    },
    {
      title: 'OSCAR Academy',
      path: '/oscar-academy',
      icon: 'mdi:school-outline'
    },
    {
      title: 'Feedback',
      path: '/feedback',
      icon: 'mdi:comment-alert'
    },
    {
      title: "What's New",
      path: '/new-features',
      icon: 'mdi:new-box'
    }
  ]
}

export default navigation
