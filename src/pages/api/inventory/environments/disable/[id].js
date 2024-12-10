import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'
import { validateUUID } from 'src/lib/utils'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { id } = req.query

  if (!id || !validateUUID(id)) {
    return res.status(400).json({ message: "Invalid or missing 'id'. A valid UUID is required." })
  }

  const apiToken = req.headers.authorization

  const httpsAgent = new https.Agent({
    rejectUnauthorized: oscarConfig.SSL_VERIFY
  })

  try {
    const response = await axios({
      method: 'POST',
      url: `${oscarConfig.MIDDLEWARE_INVENTORY_API_URL}/environments/${id}/disable`,
      headers: {
        Authorization: apiToken,
        Accept: 'application/json'
      },
      httpsAgent
    })

    res.status(200).json(response.data)
  } catch (error) {
    console.error(`Error disabling environment ${id}:`, error)
    res.status(error.response?.status || 500).json({ message: error.message })
  }
}
