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
