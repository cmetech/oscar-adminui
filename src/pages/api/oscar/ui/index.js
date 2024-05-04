// pages/api/redirect.js
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const { path } = req.query

  console.log('path', path)

  const oscarUi = `https://localhost:443/ui/${path}`
  res.redirect(oscarUi)
}
