// pages/api/redirect.js
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const { path } = req.query

  console.log('path', path)

  const oscarUi = `https://${process.env.DOMAIN}/ext/observability/ui/${path}`
  res.redirect(oscarUi)
}
