// Next.js API route for a specific suppression
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  const { name } = req.query

  if (!name) {
    return res.status(400).json({ message: 'Suppression window ID is required' })
  }

  const encodedName = encodeURIComponent(name)

  if (req.method === 'GET') {
    try {
      const response = await axios.get(`${oscarConfig.MIDDLEWARE_API_URL}/suppressions/${encodedName}`, {
        headers: {
          'X-API-Key': oscarConfig.API_KEY
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (!response.data) {
        return res.status(404).json({ message: 'Suppression window not found' })
      }

      return res.status(200).json(response.data)
    } catch (error) {
      console.error(`Error fetching suppression ${name}:`, error)
      if (error.response?.status === 404) {
        return res.status(404).json({ message: 'Suppression window not found' })
      }

      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.detail || 'Error fetching suppression window'
      })
    }
  } else if (req.method === 'PUT') {
    const update = req.body

    // Validate numeric fields if provided
    const numericFields = ['start_hour', 'start_minute', 'end_hour', 'end_minute']
    for (const field of numericFields) {
      if (update[field] !== undefined) {
        if (typeof update[field] !== 'number' || isNaN(update[field])) {
          return res.status(400).json({
            message: `${field} must be a valid number`
          })
        }
      }
    }

    // Validate time ranges if provided
    if (update.start_hour !== undefined && update.end_hour !== undefined) {
      if (update.start_hour < 0 || update.start_hour > 23 || update.end_hour < 0 || update.end_hour > 23) {
        return res.status(400).json({
          message: 'Hours must be between 0 and 23'
        })
      }
    }

    if (update.start_minute !== undefined && update.end_minute !== undefined) {
      if (update.start_minute < 0 || update.start_minute > 59 || update.end_minute < 0 || update.end_minute > 59) {
        return res.status(400).json({
          message: 'Minutes must be between 0 and 59'
        })
      }
    }

    // Validate complete time range if all components are provided
    if (
      update.start_hour !== undefined &&
      update.end_hour !== undefined &&
      update.start_minute !== undefined &&
      update.end_minute !== undefined
    ) {
      if (update.start_hour === update.end_hour && update.start_minute >= update.end_minute) {
        return res.status(400).json({
          message: 'End time must be after start time when hours are equal'
        })
      }
    }

    try {
      const response = await axios.put(`${oscarConfig.MIDDLEWARE_API_URL}/suppressions/${encodedName}`, update, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': oscarConfig.API_KEY
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      return res.status(200).json(response.data)
    } catch (error) {
      console.error(`Error updating suppression ${name}:`, error)

      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.detail || 'Error updating suppression window'
      })
    }
  } else if (req.method === 'DELETE') {
    try {
      await axios.delete(`${oscarConfig.MIDDLEWARE_API_URL}/suppressions/${encodedName}`, {
        headers: {
          'X-API-Key': oscarConfig.API_KEY
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      return res.status(204).end()
    } catch (error) {
      console.error(`Error deleting suppression ${name}:`, error)
      if (error.response?.status === 404) {
        return res.status(404).json({ message: 'Suppression window not found' })
      }

      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.detail || 'Error deleting suppression window'
      })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
