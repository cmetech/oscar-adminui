const oscarConfig = {
  SSL_VERIFY: false,
  MIDDLEWARE_API_URL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  MIDDLEWARE_INVENTORY_API_URL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/inventory`,
  BRANDING_TAGLINE: 'powered by Magenta'
}

export default oscarConfig
