import { AbilityBuilder, createMongoAbility } from '@casl/ability'

export const AppAbility = createMongoAbility

/**
 * Please define your own Ability rules according to your app requirements.
 * We have just shown Admin and Client rules for demo purpose where
 * admin can manage everything and client can just visit ACL page
 */
const defineRulesFor = (roles, subject) => {
  const { can, rules } = new AbilityBuilder(AppAbility)

  // Check each role in the list of roles
  roles.forEach(role => {
    if (role === 'admin') {
      can('manage', 'all')
    } else if (role === 'super') {
      can('read', 'all')
    } else if (role === 'editor') {
      can(['read', 'create', 'update'], ['inventory', 'task', 'probes', 'workflow', 'slo', 'home'])
      cannot('delete', 'all') // Example: Editors can't delete inventory
    } else if (role === 'viewer') {
      can('read', ['inventory', 'task', 'probes', 'workflow', 'slo', 'home'])
    }
    // You can add more roles here as needed
  });

  return rules
}

export const buildAbilityFor = (roles, subject) => {
  return new AppAbility(defineRulesFor(roles, subject), {
    detectSubjectType: object => object.type
  })
}

export const defaultACLObj = {
  action: 'manage',
  subject: 'all'
}

export default defineRulesFor
