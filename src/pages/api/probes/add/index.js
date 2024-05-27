// pages/api/tasks/config/[taskName].js
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'POST') {
    const probeobj = req.body

    console.log('probeobj:', probeobj)

    let target = probeobj.target
    let type = 'httpurl'

    if (probeobj.type === 'PORT') {
      target = target + ':' + probeobj.port
      type = 'tcpport'
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

    try {
      const response = await axios.post(`${oscarConfig.MIDDLEWARE_API_URL}/metricstore/probes`, payload, {
        headers: {
          'X-API-Key': oscarConfig.API_KEY, // Ensure this key exists in your oscarConfig
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      if (response?.data) {
        console.log(response.data)
        res.status(200).json(response.data)
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      console.error(`Error create task:`, error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
