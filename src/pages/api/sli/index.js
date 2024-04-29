// pages/api/sli/index.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    const query = req.query

    const {
      column = '',
      sort = '',
      start_time,
      end_time,
      skip = '1',
      limit = '100',
      calculate = 'true',
      filter = '{}'
    } = query
    console.log('Filter', filter)

    const queryStringParameters = {
      sort: sort,
      column: column,
      start_time: start_time,
      end_time: end_time,
      page: skip,
      perPage: limit,
      calculate: calculate || 'true',
      filter: filter || '{}' // Default to empty object if not provided
    }

    try {
      const url = new URL(`${oscarConfig.MIDDLEWARE_API_URL}/sli`)
      Object.entries(queryStringParameters).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value)
      })

      console.log('url', url.toString())

      const response = await axios.get(url.toString(), {
        timeout: 30000,
        headers: { 'X-API-Key': oscarConfig.API_KEY },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      // console.log('response', response?.data)

      if (response?.data) {
        res.status(response.status || 200).json({
          total_records: response.data.total_records || 0,
          total_pages: response.data.total_pages || 0,
          total_breached: response.data.total_breached || -1,
          total_ok: response.data.total_ok || -1,
          records: response.data.records || []
        })
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error('Error fetching slis:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else if (req.method === 'POST') {
    // Logic for handling POST request to add a new SLO
    try {
      let data = req.body

      // Explicit type conversion for target_value and period
      if (data.target) {
        data.target.target_value = parseFloat(data.target.target_value)
        data.target.period = parseInt(data.target.period)

        // Optionally, add validation to ensure the conversion was successful
        if (isNaN(data.target.target_value) || isNaN(data.target.period)) {
          throw new Error('Invalid target_value or period')
        }
      }

      // console.log('slo data', data)

      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/sli`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      // Respond with the data returned from the middleware backend
      res.status(response.status || 201).json(response.data)
    } catch (error) {
      console.error('Error adding SLO:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else if (req.method === 'DELETE') {
    try {
      const identifiers = req.body // Assuming identifiers are sent as an array in the request body

      const response = await axios.delete(`${oscarConfig.MIDDLEWARE_API_URL}/sli/bulk`, {
        data: identifiers, // Sending the identifiers in the request body
        headers: {
          'X-API-Key': oscarConfig.API_KEY,
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      // Respond with success status
      res.status(response.status || 200).json(response.data)
    } catch (error) {
      console.error('Error deleting SLIs:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
