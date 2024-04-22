export class AccessRule {
  shareId: string
  created_at: string
  access_type: string
  access_to: string
  access_level: string
  id: string
  state: string
}

export class FormCreateAccessRule {
  shareId: string
  access_type: string
  access_to: string
  access_key: string
  access_level: string
  vpcId: number
  regionId: number
  customerId: number
}
