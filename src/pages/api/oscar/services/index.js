// pages/api/redirect.js
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {

  const host = req.headers.host

  const oscarServicesUi = `https://${host}/ext/portainer/`

  // console log the path
  console.log(oscarServicesUi)

  res.redirect(oscarServicesUi)
}
