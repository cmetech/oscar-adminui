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
    url: '/observability/alerts',
    icon: 'mdi:bell-alert',
    title: 'Alerts',
    category: 'observability'
  },
  {
    id: 3,
    url: '/observability/performance',
    icon: 'mdi:speedometer',
    title: 'Performance',
    category: 'observability'
  },
  {
    id: 4,
    url: '/observability/logs/explorer',
    icon: 'mdi:math-log',
    title: 'Log Explorer',
    category: 'observability'
  },
  {
    id: 5,
    url: '/observability/capacity',
    icon: 'mdi:thermometer-check',
    title: 'Capacity',
    category: 'observability'
  },
  {
    id: 6,
    url: '/observability/inventory',
    icon: 'mdi:server',
    title: 'Inventory Management',
    category: 'observability'
  },
  {
    id: 7,
    url: '/service-continuity/tasks',
    icon: 'mdi:arrow-decision-auto',
    title: 'Tasks',
    category: 'serviceContinuity'
  },
  {
    id: 8,
    url: '/service-continuity/workflows',
    icon: 'mdi:workflow',
    title: 'Workflows',
    category: 'serviceContinuity'
  },
  {
    id: 9,
    url: '/service-continuity/availability',
    icon: 'mdi:list-status',
    title: 'Availability',
    category: 'serviceContinuity'
  },
  {
    id: 10,
    url: '/account-settings/account',
    icon: 'mdi:account-settings',
    title: 'Account Settings',
    category: 'management'
  },
  {
    id: 11,
    url: '/oscar/docs',
    icon: 'mdi:arrow-decision-auto',
    title: 'Doc Portal',
    category: 'documentation'
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
      documentation: [],
      management: []
    }

    const includeData = {
      observability: [],
      serviceContinuity: [],
      documentation: [],
      management: []
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
        ...exactData.documentation.concat(includeData.documentation).slice(0, resultsLength),
        ...exactData.management.concat(includeData.management).slice(0, resultsLength)
      ])
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
