// pages/api/tasks/history/index.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

const TIMEOUT_DURATION = 90000 // 90 seconds in milliseconds

async function handler(req, res) {
  if (req.method === 'GET') {
    const query = req.query
    const { column = '', sort = '', start_time, end_time, skip = '1', limit = '100', filter = '{}' } = query

    const queryStringParameters = {
      start_time: start_time,
      end_time: end_time,
      column: column,
      order: sort,
      page: skip,
      perPage: limit,
      filter: filter || '{}'
    }

    try {
      const url = new URL(`${oscarConfig.MIDDLEWARE_API_URL}/tasks/history`)
      Object.entries(queryStringParameters).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value)
      })

      // Create a promise that rejects after the timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out after 90 seconds'))
        }, TIMEOUT_DURATION)
      })

      // Create the actual request promise
      const requestPromise = axios.get(url.toString(), {
        headers: { 'X-API-Key': oscarConfig.API_KEY },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      // Race between the timeout and the actual request
      const response = await Promise.race([requestPromise, timeoutPromise])

      if (response?.data) {
        res.status(response.status || 200).json({
          total_pages: response.data.total_pages,
          total_records: response.data.total_records,
          records: response.data.records
        })
      } else {
        res.status(500).json({
          message: 'No response received',
          total_pages: 0,
          total_records: 0,
          records: []
        })
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      // Return empty results with error message on timeout or other errors
      res.status(error.response?.status || 504).json({
        message: error.message || 'Request failed',
        total_pages: 0,
        total_records: 0,
        records: []
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
