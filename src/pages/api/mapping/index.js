// Next.js API route for proxying export targets requests to FastAPI
import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'GET') {
    const query = req.query
    const { q = '', column = '', sort = '', type } = query
    const queryLowered = q.toLowerCase()

    try {
      const response = await axios.get(`${oscarConfig.MIDDLEWARE_MAPPING_API_URL}/mapping`, {
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
            item?.description?.toLowerCase().includes(queryLowered) ||
            item?.mapping_namespace_name?.toLowerCase().includes(queryLowered) ||
            item?.key?.toLowerCase().includes(queryLowered) ||
            item?.value?.toLowerCase().includes(queryLowered)
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

      const response = await axios.post(`${oscarConfig.MIDDLEWARE_MAPPING_API_URL}/mapping`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY })
      })

      // Respond with the data returned from the middleware backend
      res.status(201).json(response.data)
    } catch (error) {
      console.error('Error adding server:', error)
      res.status(error.response?.status || 500).json({ message: error.message })
    }
  } else if (req.method === 'PUT') {
    try {
      // Extract the list of server IDs from the request body
      const { ids } = req.body;
      console.log('Received IDs:____________________________________________________________________>', ids);



      // Validate that the IDs are in an array and not empty
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "The request is:"+ req.body});
      }

      // Make the second API call to the middleware
      const response = await axios.put(
        `${oscarConfig.MIDDLEWARE_MAPPING_API_URL}/mapping/bulk`,
        ids, // Directly send the list of IDs (this should match the expected payload format of the middleware API)
        {
          headers: {
            accept: '*/*',
            'Content-Type': 'application/json'
          },
          httpsAgent: new https.Agent({ rejectUnauthorized: oscarConfig.SSL_VERIFY }) // Ensure SSL verification is handled properly
        }
      );

      // If the external API responds with no content (status 204), acknowledge success
      if (response.status === 204) {
        return res.status(204).end();
      } else {
        // Handle unexpected status codes here
        return res.status(response.status).json({ message: response.statusText });
      }
    } catch (error) {
      console.error('Error calling middleware API:', error);

      // Return the error response
      return res.status(error.response?.status || 500).json({ message: error.message });

    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['GET', 'POST', 'PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler
