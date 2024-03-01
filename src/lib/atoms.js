import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

export const serverIdsAtom = atom([])

export const datacentersAtom = atom([])

export const environmentsAtom = atom([])

export const serversAtom = atom([])

export const componentsAtom = atom([])

export const subcomponentsAtom = atom([])

export const refetchDatacenterTriggerAtom = atom(0)

export const refetchEnvironmentTriggerAtom = atom(0)

export const refetchServerTriggerAtom = atom(0)

export const refetchComponentTriggerAtom = atom(0)

export const refetchSubcomponentTriggerAtom = atom(0)
