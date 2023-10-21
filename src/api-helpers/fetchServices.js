const services = [
  { id: '1', name: 'adminui', status: 'running', lastStarted: '2023-10-20T12:34:56Z' },
  { id: '2', name: 'oscarui', status: 'stop', lastStarted: '2023-10-19T10:20:30Z' }

  // ... add more services
]

export const fetchServices = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Return mock data
  return services
}
