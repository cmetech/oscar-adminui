// pages/api/redirect.js
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const { path } = req.query

  console.log('path', path)

  const oscarServicesUi = `https://${process.env.DETECTED_IP}/ext/portainer/`
  res.redirect(oscarServicesUi)
}
