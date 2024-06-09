// pages/api/notifiers/delete/[notifierId].js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'
import { validateUUID } from 'src/lib/utils'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { notifierId } = req.query

  if (!notifierId || !validateUUID(notifierId)) {
    return res.status(400).json({ message: "Invalid or missing 'notifierId'. A valid UUID is required." })
  }

  const apiToken = req.headers.authorization

  const httpsAgent = new https.Agent({
    rejectUnauthorized: oscarConfig.SSL_VERIFY
  })

  try {
    await axios({
      method: 'DELETE',
      url: `${oscarConfig.MIDDLEWARE_API_URL}/notifiers/${notifierId}`,
      headers: {
        Authorization: apiToken,
        Accept: 'application/json'
      },
      httpsAgent
    })

    res.status(204).end()
  } catch (error) {
    console.error('Error forwarding DELETE notifier request to middleware API', error)

    if (error.response?.status === 404) {
      return res.status(204).end()
    }
    res.status(error.response?.status || 500).json({ message: error.message })
  }
}
