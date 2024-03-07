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
