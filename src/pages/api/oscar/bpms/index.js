// pages/api/redirect.js
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const nifiUi = `https://${process.env.NIFI_HOST}:${process.env.NIFI_PORT}/nifi`
  res.redirect(nifiUi)
}
