export class SubUser {
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
}

export class FormDeleteSubUser {
  uid: string
  subuser: string
  purge_data: true
}

export class FormCreateSubUser {
  uid: string
  subuser: string
  gen_subuser: string
  secret_key: string
  key_type: string
  access: string
  generate_secret: true
}
