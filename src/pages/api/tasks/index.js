// pages/api/tasks/index.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    const query = req.query
    const { column = '', sort = '', skip = '1', limit = '100', filter = '{}' } = query

    // console.log('Filter', filter)

    const queryStringParameters = {
      column: column,
      order: sort,
      page: skip,
      perPage: limit,
      filter: filter || '{}' // Default to empty object if not provided
    }

    try {
      // Construct the request URL with query parameters
      const url = new URL(`${oscarConfig.MIDDLEWARE_API_URL}/tasks`)
      Object.entries(queryStringParameters).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value)
      })

      // console.log('url', url.toString())

      const response = await axios.get(url.toString(), {
        timeout: 30000,
        headers: { 'X-API-Key': oscarConfig.API_KEY },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        res.status(response.status || 200).json({
          total_pages: response.data.total_pages,
          total_records: response.data.total_records,
          records: response.data.records
        })
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
