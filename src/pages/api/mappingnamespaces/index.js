import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
    if (req.method === 'GET') {
      console.log("GET call NEXT JS")
      const query = req.query
      const { q = '', column = '', sort = '', type } = query
      const queryLowered = q.toLowerCase()
  
      try {
        const response = await axios.get(`${oscarConfig.MIDDLEWARE_MAPPING_API_URL}/mapping-namespaces`, {
          httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
        })
  
        if (response?.data) {
          // console.log('export targets', response?.data)
          const dataAsc = response.data.sort((a, b) => (a[column] < b[column] ? -1 : 1))
          const dataToFilter = sort === 'asc' ? dataAsc : dataAsc.reverse()
  
          const filteredData = dataToFilter.filter(
            item =>
              item?.id?.toString().toLowerCase().includes(queryLowered) ||
              item?.name?.toLowerCase().includes(queryLowered) ||
              item?.description?.toLowerCase().includes(queryLowered)
          )
  
          res.status(200).json({
            allData: response.data,
            total: filteredData.length,
            rows: filteredData
          })
        } else {
          res.status(500).json({ message: 'No response - An error occurred' })
        }
      } catch (error) {
        console.error('Error proxying export targets:', error)
        res.status(error.response?.status || 500).json({ message: error.message })
      }
    } else if (req.method === 'POST') {
      // Logic for handling POST request to add a new datacenter
      try {
        const data = req.body
  
        const response = await axios.post(`${oscarConfig.MIDDLEWARE_MAPPING_API_URL}/mapping-namespaces`, data, {
          headers: {
            'Content-Type': 'application/json'
          },
          httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
        })
  
        // Respond with the data returned from the middleware backend
        res.status(201).json(response.data)
      } catch (error) {
        console.error('Error adding datacenter:', error)
        res.status(error.response?.status || 500).json({ message: error.message })
      }
    } else {
      // Handle unsupported HTTP methods
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  }

export default handler
