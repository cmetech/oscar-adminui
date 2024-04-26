import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const session = await getSession({ req })

  console.log('Redirecting to Grafana UI')
  console.log('User:', session)

  if (session && session.user) {
    // Assuming the user object has been populated correctly in the session
    console.log('X-User:', session.user.username)
    console.log('X-Role:', session.user.role)
    console.log('X-Email:', session.user.email)
    console.log('X-Name:', session.user.firstName + ' ' + session.user.lastName)

    // Set headers for NGINX to pass to Grafana
    res.setHeader('X-User', session.user.username)
    res.setHeader('X-Role', session.user.role)
    res.setHeader('X-Email', session.user.email)

    // Redirect to the NGINX endpoint that proxies to Grafana
    res.redirect(`https://${process.env.NGINX_HOST}:${process.env.NGINX_PORT}/ui`)
  } else {
    // If not authenticated, redirect to login or handle appropriately
    res.redirect('/login')
  }
}
