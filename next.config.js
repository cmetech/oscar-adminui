/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const { defaultLocale } = require('yup')

/** @type {import('next').NextConfig} */

// Remove this if you're not using Fullcalendar features

module.exports = {
  trailingSlash: true,
  reactStrictMode: false,
  transpilePackages: ['@mui/x-charts'],
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    return config
  },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en'
  },

  serverRuntimeConfig: {
    API_URL: process.env.API_ENDPOINT
  },

  // Will be available on both server and client
  publicRuntimeConfig: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    MKDOCS_HOST: process.env.DOMAIN,
    MKDOCS_PORT: process.env.MKDOCS_PORT,
    DOMAIN: process.env.DOMAIN
  },

  output: 'standalone'
}
