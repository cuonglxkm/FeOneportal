

export class IKEPolicyModel {
  id: string
  name: string
  encryptionAlgorithm: string
  authorizationAlgorithm: string
  ikeVersion: string
  lifetimeUnits: string
  lifetimeValue: number
  perfectForwardSecrecy: string
  phase1NegotiationMode: string
  regionId: number
  customerId: number
  projectId: number

}

export class FormSearchIKEPolicy {
  projectId: number
  regionId: number
  searchValue?: string
}


