/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = roles => {
  // Check if roles is an array, if not, convert it to an array
  const userRoles = Array.isArray(roles) ? roles : [roles];

  if (userRoles.includes('admin')) {
    return '/home'  // Assuming admins should go to the main home page
  } else if (userRoles.includes('client')) {
    return '/acl'
  } else {
    // Default route for any other role
    return '/home'
  }
}

export default getHomeRoute
