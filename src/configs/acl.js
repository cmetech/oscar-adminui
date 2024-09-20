import { AbilityBuilder, createMongoAbility } from '@casl/ability'

export const AppAbility = createMongoAbility

/**
 * Please define your own Ability rules according to your app requirements.
 * We have just shown Admin and Client rules for demo purpose where
 * admin can manage everything and client can just visit ACL page
 */
const defineRulesFor = (roles, subject) => {
  console.log('ACL.js roles', roles)
  const { can, cannot, rules } = new AbilityBuilder(AppAbility)

  roles.forEach(role => {
    if (role === 'admin') {
      can('manage', 'all')
    } else if (role === 'super') {
      can('read', 'all')
    } else if (role === 'editor') {
      can(['read', 'create', 'update'], ['accountsettings', 'nav', 'alerts', 'inventory', 'tasks', 'probes', 'workflows', 'slo', 'home', 'datacenters', 'environments', 'servers', 'components', 'subcomponents'])
      can('run', 'tasks')
      can('schedule', 'tasks')
      cannot('delete', 'all')
    } else if (role === 'viewer') {
      can('read', ['accountsettings', 'nav', 'alerts', 'inventory', 'tasks', 'probes', 'workflows', 'slo', 'home', 'datacenters', 'environments', 'servers'])
      cannot(['create', 'update', 'delete', 'run', 'schedule'], ['tasks', 'datacenters', 'environments', 'servers'])
      cannot('read', ['components', 'subcomponents'])
    }
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
