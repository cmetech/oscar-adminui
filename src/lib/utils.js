export function capitalizeWords(str) {
  if (!str) return ''

  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Utility function to validate UUID format
export function validateUUID(uuid) {
  const regexExp = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/

  return regexExp.test(uuid)
}

export const escapeRegExp = value => {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

// Utility function to get a value from a nested object given a path like 'networkInterfaces.ipaddress'
// Utility function to get a value from a nested object or list given a path like 'network_interfaces.ip_address'
export const getNestedValue = (obj, path) => {
  const keys = path.split('.')

  return keys.reduce((current, key) => {
    if (Array.isArray(current)) {
      // If the current field is an array, search each object within it
      return current
        .map(item => item[key])
        .filter(value => value !== undefined && value !== null)
        .join(', ') // Combine all found values into a single string (for search purposes)
    }

    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

export const detectTokensInPayload = payload => {
  const regex = /{{\s*([^}]+?)\s*}}/g
  const tokens = new Set()
  let match

  while ((match = regex.exec(payload)) !== null) {
    tokens.add(match[1].trim().toUpperCase())
  }

  return Array.from(tokens)
}
