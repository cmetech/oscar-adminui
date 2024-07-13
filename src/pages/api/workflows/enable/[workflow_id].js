import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  const { workflow_id } = req.query

  if (!workflow_id) {
    return res.status(400).json({ message: 'Workflow ID is required' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const url = new URL(`${oscarConfig.MIDDLEWARE_API_URL}/workflows/${workflow_id}/enable`)
    
    const response = await axios.post(url.toString(), {}, {
      timeout: 30000,
      httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response?.data) {
      return res.status(response.status || 200).json(response.data)
    } else {
      return res.status(500).json({ message: 'No response - An error occurred' })
    }
  } catch (error) {
    console.error(`Error enabling workflow ${workflow_id}:`, error)
    return res.status(error.response?.status || 500).json({ message: error.message })
  }
}

export default handler
