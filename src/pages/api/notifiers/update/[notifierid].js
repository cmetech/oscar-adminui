// pages/api/notifiers/update.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  console.log('Request received:', req.method, req.url)

  if (req.method === 'PUT') {
    const { notifierid } = req.query
    const notifier = req.body

    console.log('Notifier ID:', notifierid)
    console.log('Notifier data:', notifier)

    // Initialize the payload with common fields
    const payload = {
      name: notifier.name,
      description: notifier.description,
      type: notifier.type,
      status: notifier.status
    }

    // Add type-specific configuration based on notifier type
    if (notifier.type === 'email' && notifier.email_addresses?.length > 0) {
      payload.email_notifier = {
        email_addresses: notifier.email_addresses.map(email => ({ email: email.trim() }))
      }
    } else if (notifier.type === 'webhook' && notifier.webhook_url) {
      payload.webhook_notifier = {
        url: notifier.webhook_url.trim()
      }
    }

    console.log('Payload to be sent:', payload)

    try {
      const response = await axios.put(`${oscarConfig.MIDDLEWARE_API_URL}/notifiers/${notifierid}`, payload, {
        headers: {
          'X-API-Key': oscarConfig.API_KEY,
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      console.log('Response from middleware API:', response.data)

      if (response?.data) {
        res.status(200).json(response.data)
      } else {
        console.log('No response data received')
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error('Error updating notifier:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    console.log(`Method ${req.method} not allowed`)
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
