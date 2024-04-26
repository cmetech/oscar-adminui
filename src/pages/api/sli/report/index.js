// pages/api/sli/events/index.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    const query = req.query
    const { q = '', column = '', sort = '', type, start_time, end_time, skip = '1', limit = '100' } = query
    const queryLowered = q.toLowerCase()

    try {
      // Construct the request URL with query parameters
      const url = new URL(`${oscarConfig.MIDDLEWARE_API_URL}/sli/calculate-slos`)
      if (start_time) url.searchParams.append('start_time', start_time)
      if (end_time) url.searchParams.append('end_time', end_time)

      //   url.searchParams.append('page', skip)
      //   url.searchParams.append('perPage', limit)
      //   url.searchParams.append('column', column)
      //   url.searchParams.append('order', sort)

      const response = await axios.get(url.toString(), {
        headers: { 'X-API-Key': oscarConfig.API_KEY },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        return res.status(response.status || 200).json(response.data)
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error('Error fetching slis:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
