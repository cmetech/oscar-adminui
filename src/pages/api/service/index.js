import logger from '../../../middleware/logger'
import { fetchPosts, fetchServices } from '../../../api-helpers/fetchServices'

const handler = async (req, res) => {
  const { method } = req

  // Apply middleware
  logger(req, res, () => {})

  switch (method) {
    case 'GET':
      try {
        const data = await fetchServices()
        res.status(200).json(data)
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}

export default handler
