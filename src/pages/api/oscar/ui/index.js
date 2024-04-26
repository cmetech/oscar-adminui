// pages/api/redirect.js
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const { url } = req.query
  const session = await getSession({ req })

  if (session && session.user) {
    // If using a proxy approach, make a server-to-server request here
    // For a simple redirect, just redirect to the Grafana URL with the token in a query string (if supported)
    const oscarUi = `https://localhost:443/ui?token=${encodeURIComponent(session.user.jwt)}`
    res.redirect(oscarUi)
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
