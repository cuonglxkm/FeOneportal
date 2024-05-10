

export class IKEPolicyModel {
  id: string
  name: string
  encryptionAlgorithm: string
  authorizationAlgorithm: string
  ikeVersion: string
  lifetimeUnit: string
  lifetimeValue: number
  perfectForwardSecrey: string
  ikePhase1NegotiationMode: string
  regionId: number
  customerId: number
  projectId: number

}

export class FormSearchIKEPolicy {
  projectId: number
  regionId: number
  searchValue?: string
  pageNumber: number
  pageSize: number
}


