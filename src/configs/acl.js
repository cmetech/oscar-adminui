import { AbilityBuilder, createMongoAbility } from '@casl/ability'

export const AppAbility = createMongoAbility

/**
 * Please define your own Ability rules according to your app requirements.
 * We have just shown Admin and Client rules for demo purpose where
 * admin can manage everything and client can just visit ACL page
 */
const defineRulesFor = (roles, subject) => {
  const { can, rules } = new AbilityBuilder(AppAbility)

  if (roles.includes('admin')) {
    can('manage', 'all')
  } else if (roles.includes('super')) {
    can('read', 'all')
  } else {
    // For any other role
    can('read', 'all')
  }

  // You can add more specific rules for other roles here
  // For example:
  // if (roles.includes('editor')) {
  //   can(['read', 'create', 'update'], 'article')
  // }

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
