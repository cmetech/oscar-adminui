// pages/api/redirect.js
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const oscarServicesUi = `https://${process.env.DETECTED_IP}/ext/portainer/`

  // console log the path
  console.log(oscarServicesUi)

  res.redirect(oscarServicesUi)
}
