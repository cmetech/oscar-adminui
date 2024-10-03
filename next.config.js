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
    MKDOCS_HOST: process.env.DETECTED_IP,
    MKDOCS_PORT: process.env.MKDOCS_PORT,
    DETECTED_IP: process.env.DETECTED_IP,
    KEYCLOAK_ENABLE: process.env.KEYCLOAK_ENABLE,
    AZURE_ENABLE: process.env.AZURE_ENABLE,
    NODE_ENV: process.env.NODE_ENV,
    FLOWER_PORT: process.env.FLOWER_PORT,
    REVERSEPROXY_DASHBOARD_PORT: process.env.REVERSEPROXY_DASHBOARD_PORT,
    VAULT_HOST: process.env.VAULT_HOST,
    VAULT_PORT: process.env.VAULT_PORT,
    CHAT_WS_ENDPOINT: process.env.CHAT_WS_ENDPOINT,
    CHAT_MODE: process.env.CHAT_MODE
  },

  output: 'standalone'
}
