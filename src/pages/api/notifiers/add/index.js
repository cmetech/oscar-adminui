// pages/api/notifiers/add.js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'POST') {
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
      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/notifiers`, payload, {
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
      console.error(`Error creating notifier:`, error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
