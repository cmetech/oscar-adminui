// pages/api/users/
import axios from 'axios'
import { fi } from 'date-fns/locale'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {

  console.log("Request: "+ req)

  if (req.method === 'GET') {
    const query = req.query
    const { q = '', column = '', sort = '', type } = query
    const queryLowered = q.toLowerCase()

    // Create an instance of https.Agent for the request to bypass SSL certificate errors
    const httpsAgent = new https.Agent({
      rejectUnauthorized: oscarConfig.SSL_VERIFY // Remember, this is for development only!
    })

    try {
      const users = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/users', {
        httpsAgent
      })
      if (users?.data) {
        // console.log('users', users?.data)

        const dataAsc = users.data.sort((a, b) => (a[column] < b[column] ? -1 : 1))
        const dataToFilter = sort === 'asc' ? dataAsc : dataAsc.reverse()

        const filteredData = dataToFilter.filter(
          item =>
            item?.id?.toString().toLowerCase().includes(queryLowered) ||
            item?.first_name?.toLowerCase().includes(queryLowered) ||
            item?.last_name?.toLowerCase().includes(queryLowered) ||
            item?.email?.toLowerCase().includes(queryLowered) ||
            item?.username?.toLowerCase().includes(queryLowered)
        )

        res.status(200).json({
          allData: users.data,
          total: filteredData.length,
          rows: filteredData
        })
      } else {
        res.status(500).json({ message: 'No response - An error occurred' })
      }
    } catch (error) {
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else if (req.method === 'POST'){
    
    const query = req.query
    const { q = '', column = '', sort = '', type } = query
    const queryLowered = q.toLowerCase()

    // Create an instance of https.Agent for the request to bypass SSL certificate errors
    const httpsAgent = new https.Agent({
      rejectUnauthorized: oscarConfig.SSL_VERIFY // Remember, this is for development only!
    })

    try {
      
      const userData = req.body

      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/users', userData, {
        httpsAgent
      })

      
      // Respond with the status and data from the external API
      res.status(response.status).json(response.data)


    } catch (error) {
      res.status(error.response?.status || 500).json({ message: error.message })
    }
    
    
  } else {
    res.status(405).json({ message: 'Method '+req.method.toString()+' not allowed' })
  }
}

export default handler
