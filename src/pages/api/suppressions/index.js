// Next.js API route for managing suppressions
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    const { perPage = '10', page = '1', filters } = req.query

    // Validate parameters
    const parsedPage = parseInt(page)
    const parsedPerPage = parseInt(perPage)

    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({ message: 'Invalid page parameter' })
    }

    if (isNaN(parsedPerPage) || parsedPerPage < 1 || parsedPerPage > 100) {
      return res.status(400).json({ message: 'PerPage must be between 1 and 100' })
    }

    const params = {
      page: parsedPage,
      perPage: parsedPerPage
    }

    if (filters) {
      try {
        // Ensure filters is valid JSON
        JSON.parse(filters)
        params.filters = filters
      } catch (error) {
        return res.status(400).json({ message: 'Invalid filters format' })
      }
    }

    try {
      const response = await axios.get(`${oscarConfig.MIDDLEWARE_API_URL}/suppressions`, {
        params,
        headers: {
          'X-API-Key': oscarConfig.API_KEY
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      return res.status(200).json(response.data)
    } catch (error) {
      console.error('Error fetching suppressions:', error)

      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.detail || 'Error fetching suppressions'
      })
    }
  } else if (req.method === 'POST') {
    const window = req.body

    // Validate required fields
    const requiredFields = ['name', 'start_hour', 'start_minute', 'end_hour', 'end_minute']
    for (const field of requiredFields) {
      if (window[field] === undefined) {
        return res.status(400).json({
          message: `Missing required field: ${field}`
        })
      }
    }

    // Validate numeric fields
    const numericFields = ['start_hour', 'start_minute', 'end_hour', 'end_minute']
    for (const field of numericFields) {
      if (typeof window[field] !== 'number' || isNaN(window[field])) {
        return res.status(400).json({
          message: `${field} must be a valid number`
        })
      }
    }

    // Validate time ranges
    if (window.start_hour < 0 || window.start_hour > 23 || window.end_hour < 0 || window.end_hour > 23) {
      return res.status(400).json({
        message: 'Hours must be between 0 and 23'
      })
    }

    if (window.start_minute < 0 || window.start_minute > 59 || window.end_minute < 0 || window.end_minute > 59) {
      return res.status(400).json({
        message: 'Minutes must be between 0 and 59'
      })
    }

    if (window.start_hour === window.end_hour && window.start_minute >= window.end_minute) {
      return res.status(400).json({
        message: 'End time must be after start time when hours are equal'
      })
    }

    try {
      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/suppressions`, window, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': oscarConfig.API_KEY
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      return res.status(201).json(response.data)
    } catch (error) {
      console.error('Error creating suppression:', error)

      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.detail || 'Error creating suppression window'
      })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
