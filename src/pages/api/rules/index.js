// oscar-adminui/src/pages/api/rules/index.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    const { namespace, perPage, page, order, column, filter } = req.query

    const params = {}

    if (namespace) {
      params.namespace = namespace
    }

    if (perPage) {
      params.perPage = perPage
    }

    if (page) {
      params.page = page
    }

    if (order) {
      params.order = order
    }

    if (column) {
      params.column = column
    }

    if (filter) {
      params.filter = filter
    }

    try {
      const response = await axios.get(`${oscarConfig.MIDDLEWARE_API_URL}/rules`, {
        params: params,
        headers: {
          'X-API-Key': oscarConfig.API_KEY
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        res.status(response.status || 200).json(response.data)
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error('Error fetching rules:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
