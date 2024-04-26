import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

export const serverIdsAtom = atom([])

export const taskIdsAtom = atom([])

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

export const alertIdsAtom = atom([])

export const alertsAtom = atom([])
export const sloIdsAtom = atom([])

export const slosAtom = atom([])

export const refetchSloTriggerAtom = atom(0)
