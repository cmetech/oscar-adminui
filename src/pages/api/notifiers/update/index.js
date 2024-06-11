// pages/api/notifiers/update.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'PUT') {
    const { id } = req.query
    const notifier = req.body

    // Transform email addresses if the type is email
    let emailNotifier = null
    if (notifier.type === 'email') {
      emailNotifier = {
        email_addresses: notifier.email_addresses.map(email => ({ email }))
      }
    }

    const payload = {
      name: notifier.name,
      description: notifier.description,
      type: notifier.type,
      status: notifier.status,
      email_notifier: emailNotifier,
      webhook_notifier: notifier.type === 'webhook' ? { url: notifier.webhook_url } : null
    }

    try {
      const response = await axios.put(`${oscarConfig.MIDDLEWARE_API_URL}/notifiers/${id}`, payload, {
        headers: {
          'X-API-Key': oscarConfig.API_KEY,
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        res.status(200).json(response.data)
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error(`Error updating notifier:`, error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
