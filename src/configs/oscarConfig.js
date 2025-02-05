const COMPANY_NAME = 'Ericsson'

const oscarConfig = {
  SSL_VERIFY: false,
  MIDDLEWARE_URL: `${process.env.NEXT_PUBLIC_API_URL}`,
  MIDDLEWARE_API_URL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  MIDDLWARE_METRICSTORE_API_URL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/metricstore`,
  MIDDLEWARE_INVENTORY_API_URL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/inventory`,
  MIDDLEWARE_MAPPING_API_URL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/mapping-data`,
  COMPANY_NAME: COMPANY_NAME,
  BRANDING_TAGLINE: `powered by ${COMPANY_NAME}`
}

export default oscarConfig
