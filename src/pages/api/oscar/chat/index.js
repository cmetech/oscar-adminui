import axios from 'axios'
import https from 'https'
import oscarConfig from 'src/configs/oscarConfig'

async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body

    // Simulate a random delay between 500ms to 1500ms
    const randomDelay = Math.random() * 1000 + 1500
    await sleep(randomDelay)

    const reply = 'Echo: ' + message
    res.status(200).json({ reply })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default handler

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
