// pages/api/redirect.js
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const { path } = req.query
  const host = req.headers.host

  console.log('path', path)

  const oscarUi = `https://${host}/ext/observability/ui/${path}`
  res.redirect(oscarUi)
}
