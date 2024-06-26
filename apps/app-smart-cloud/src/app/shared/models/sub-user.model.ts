export class SubUser {
  rowNumber: number
  userId: string
  subUserId: string
  permissions: string
  keys: SubUserKeys[]
}

export class SubUserKeys {
  userId: string
  accessKey: string
  secretKey: string
}

export class FormUpdateSubUser {
  uid: string
  subuser: string
  access: string
  actorEmail: string
  regionId: number
}

export class FormDeleteSubUser {
  uid: string
  subuser: string
  purge_data: true
  actorEmail: string
  regionId: number
}

export class FormCreateSubUser {
  uid: string
  subuser: string
  gen_subuser: string
  secret_key: string
  key_type: string
  access: string
  generate_secret: true
  regionId: number
}
