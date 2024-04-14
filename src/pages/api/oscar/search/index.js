import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

const searchData = [
  {
    id: 1,
    url: '/home',
    icon: 'mdi:home',
    title: 'Overview',
    category: 'home'
  },
  {
    id: 2,
    url: '/observability',
    icon: 'mdi:bell-alert',
    title: 'Alerts & Events',
    category: 'observability'
  },
  {
    id: 3,
    url: 'https:localhost/ui',
    icon: 'mdi:monitor-eye',
    title: 'Advanced Dashboards',
    category: 'observability'
  },
  {
    id: 4,
    url: '/observability/slo/overview',
    icon: 'mdi:view-dashboard-variant',
    title: 'Overview',
    category: 'observability'
  },
  {
    id: 5,
    url: '/observability/slo/details',
    icon: 'mdi:cog',
    title: 'Details',
    category: 'observability'
  },
  {
    id: 6,
    url: '/services/availability',
    icon: 'mdi:list-status',
    title: 'Availability',
    category: 'serviceContinuity'
  },
  {
    id: 7,
    url: '/services/capacity',
    icon: 'mdi:thermometer-check',
    title: 'Capacity',
    category: 'serviceContinuity'
  },
  {
    id: 8,
    url: '/services/performance',
    icon: 'mdi:chart-areaspline-variant',
    title: 'Performance',
    category: 'serviceContinuity'
  },
  {
    id: 9,
    url: '/tasks',
    icon: 'mdi:arrow-decision-auto',
    title: 'Automations',
    category: 'aiAutomation'
  },
  {
    id: 10,
    url: '/administration/inventory',
    icon: 'mdi:server',
    title: 'Inventory',
    category: 'infrastructure'
  },
  {
    id: 11,
    url: '/administration/services',
    icon: 'mdi:service-toolbox',
    title: 'Services',
    category: 'infrastructure'
  }
]

async function handler(req, res) {
  if (req.method === 'GET') {
    const { q = '' } = req.query
    const queryLowered = q.toLowerCase()

    console.log('queryLowered', queryLowered)

    const exactData = {
      observability: [],
      serviceContinuity: [],
      aiAutomation: [],
      infrastructure: []
    }

    const includeData = {
      observability: [],
      serviceContinuity: [],
      aiAutomation: [],
      infrastructure: []
    }

    searchData.forEach(obj => {
      const isMatched = obj.title.toLowerCase().startsWith(queryLowered)
      if (isMatched && exactData[obj.category].length < 5) {
        exactData[obj.category].push(obj)
      }
    })
    searchData.forEach(obj => {
      const isMatched =
        !obj.title.toLowerCase().startsWith(queryLowered) && obj.title.toLowerCase().includes(queryLowered)
      if (isMatched && includeData[obj.category].length < 5) {
        includeData[obj.category].push(obj)
      }
    })
    const categoriesCheck = []
    Object.keys(exactData).forEach(category => {
      if (exactData[category].length > 0) {
        categoriesCheck.push(category)
      }
    })
    if (categoriesCheck.length === 0) {
      Object.keys(includeData).forEach(category => {
        if (includeData[category].length > 0) {
          categoriesCheck.push(category)
        }
      })
    }
    const resultsLength = categoriesCheck.length === 1 ? 5 : 3

    res
      .status(200)
      .json([
        ...exactData.observability.concat(includeData.observability).slice(0, resultsLength),
        ...exactData.serviceContinuity.concat(includeData.serviceContinuity).slice(0, resultsLength),
        ...exactData.aiAutomation.concat(includeData.aiAutomation).slice(0, resultsLength),
        ...exactData.infrastructure.concat(includeData.infrastructure).slice(0, resultsLength)
      ])
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
