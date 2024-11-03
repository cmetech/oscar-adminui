// pages/api/probes/disable/[taskId].js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'
import { validateUUID } from 'src/lib/utils'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  const probeobj = req.body

  let target = probeobj.target
  let type = 'httpurl'

  if (probeobj.type === 'PORT') {
    target = target + ':' + probeobj.port
    type = 'tcpport'
  }

  if (probeobj.type === 'PING') {
    type = 'icmpping'
  }

  const payload = {
    name: probeobj['name'],
    description: probeobj['description'],
    status: probeobj['status'],
    target: target,
    type: type
  }

  // Add additional information for API type
  if (probeobj.type === 'API') {
    payload.type = probeobj.type.toLowerCase()
    payload.kwargs = probeobj.kwargs || {}
    payload.schedule = probeobj.schedule || {}
  }

  console.log('payload:', payload)

  const { probeId } = req.query

  if (!probeId || !validateUUID(probeId)) {
    return res.status(400).json({ message: "Invalid or missing 'probeId'. A valid UUID is required." })
  }

  const apiToken = req.headers.authorization

  const httpsAgent = new https.Agent({
    rejectUnauthorized: oscarConfig.SSL_VERIFY
  })

  try {
    const response = await axios({
      method: 'PUT',
      url: `${oscarConfig.MIDDLEWARE_API_URL}/metricstore/probes/${probeId}`,
      data: payload,
      headers: {
        Authorization: apiToken,
        Accept: 'application/json'
      },
      httpsAgent
    })

    res.status(200).json(response.data)
  } catch (error) {
    console.error('Error forwarding PUT request to disable probe', error)
    res.status(error.response?.status || 500).json({ message: error.message })
  }
}
