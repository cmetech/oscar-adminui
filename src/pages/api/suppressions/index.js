// Next.js API route for managing suppressions
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    // Handle fetching all suppressions
    const query = req.query
    const { perPage = '10', page = '1', order = 'asc', column = 'name', filter = '{}' } = query

    const queryStringParameters = {
      perPage,
      page,
      order,
      column,
      filter
    }

    try {
      const url = new URL(`${oscarConfig.MIDDLEWARE_API_URL}/suppressions`)
      Object.keys(queryStringParameters).forEach(key => {
        if (queryStringParameters[key]) {
          url.searchParams.append(key, queryStringParameters[key])
        }
      })

      const response = await axios.get(url.toString(), {
        timeout: 30000,
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        res.status(response.status || 200).json(response.data)
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error('Error fetching suppressions:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else if (req.method === 'POST') {
    // Handle creating a new suppression
    try {
      const data = req.body

      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/suppressions`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      res.status(response.status || 201).json(response.data)
    } catch (error) {
      console.error('Error creating suppression:', error)
      res.status(error.response?.status || 500).json({ message: error.message, details: error.response?.data })
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
