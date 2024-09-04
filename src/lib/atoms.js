import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

export const serverIdsAtom = atom([])

export const componentIdsAtom = atom([])

export const subcomponentIdsAtom = atom([])

export const taskIdsAtom = atom([])

export const userIdsAtom = atom([])

export const datacentersAtom = atom([])

export const environmentsAtom = atom([])

export const serversAtom = atom([])

export const tasksAtom = atom([])

export const componentsAtom = atom([])

export const subcomponentsAtom = atom([])

export const refetchDatacenterTriggerAtom = atom(0)

export const refetchEnvironmentTriggerAtom = atom(0)

export const refetchServerTriggerAtom = atom(0)

export const refetchComponentTriggerAtom = atom(0)

export const refetchSubcomponentTriggerAtom = atom(0)

export const refetchTaskTriggerAtom = atom(0)

export const refetchUserTriggerAtom = atom(0)

export const refetchNotifierTriggerAtom = atom(0)

export const alertIdsAtom = atom([])

export const notifierIdsAtom = atom([])

export const notifiersAtom = atom([])

export const alertsAtom = atom([])

export const sloIdsAtom = atom([])

export const slosAtom = atom([])

export const refetchSloTriggerAtom = atom(0)

export const probesAtom = atom([])

export const probeIdsAtom = atom([])

export const refetchProbeTriggerAtom = atom(0)

export const showOscarChatAtom = atom(false)

export const workflowIdsAtom = atom([])

export const workflowsAtom = atom([])

export const refetchWorkflowTriggerAtom = atom(0)

export const connectionsAtom = atom([])

export const connectionsIdsAtom = atom([])

export const refetchConnectionsTriggerAtom = atom(0)
