const services = [
  { id: '1', name: 'adminui', type: 'container', status: 'running', lastStarted: '2023-10-20T12:34:56Z' },
  { id: '2', name: 'oscarui', type: 'container', status: 'stopped', lastStarted: '2023-10-19T10:20:30Z' },
  { id: '3', name: 'oscardb', type: 'container', status: 'running', lastStarted: '2023-10-19T10:20:30Z' },
  { id: '4', name: 'minio', type: 'container', status: 'pending', lastStarted: '2023-10-19T10:20:30Z' },
  { id: '5', name: 'fluent', type: 'container', status: 'running', lastStarted: '2023-10-19T10:20:30Z' },
  { id: '6', name: 'fabric', type: 'container', status: 'failed', lastStarted: '2023-10-19T10:20:30Z' },
  { id: '7', name: 'workflow1', type: 'workflow', status: 'running', lastStarted: '2023-10-19T10:20:30Z' },
  { id: '8', name: 'workflow2', type: 'workflow', status: 'running', lastStarted: '2023-10-19T10:20:30Z' },
  { id: '9', name: 'workflow3', type: 'workflow', status: 'running', lastStarted: '2023-10-19T10:20:30Z' },
  { id: '10', name: 'task1', type: 'fabric', status: 'stopped', lastStarted: '2023-10-19T10:20:30Z' },
  { id: '11', name: 'task2', type: 'fabric', status: 'stopped', lastStarted: '2023-10-19T10:20:30Z' },
  { id: '12', name: 'task3', type: 'fabric', status: 'stopped', lastStarted: '2023-10-19T10:20:30Z' }

  // ... add more services
]

export const fetchServices = async () => {
  const stub = process.env.STUB === 'true'

  if (stub) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Return mock data
    return services
  } else {
    try {
      const port = process.env.OSCARADMINUI_PORT || 4100
      const host = process.env.OSCARAPI_SERVICENAME || 'oscarapi'

      const response = await axios.get(`http://${host}:${port}/docker_compose_ps/`, {
        params: {
          project_name: 'your_project_name'
        }
      })

      return response.data.Containers // Assuming the FastAPI endpoint returns a "Containers" field in the JSON response
    } catch (error) {
      console.error('Failed to fetch data:', error)

      return null
    }
  }
}
