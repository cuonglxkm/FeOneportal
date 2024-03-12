export class UserInfoObjectStorage {
  tenant: string
  user_id: string
  display_name: string
  email: string
  suspended: number
  max_buckets: number
  subusers: Subusers[]
  keys: Key[]
  swift_keys: SwiftKeys[]
  caps: string[]
  op_mask: string
  system: string
  admin: string
  default_placement: string
  default_storage_class: string
  placement_tags: string[]
  bucket_quota: BucketQuota
  user_quota: UserQuota
  temp_url_keys: string[]
  type: string
  mfa_ids: string[]
}

export class Key {
  user: string
  access_key: string
  secret_key: string
}

export class SwiftKeys {
  user: string
  secret_key: string
}

export class BucketQuota {
  enabled: boolean
  check_on_raw: boolean
  max_size: number
  max_size_kb: number
  max_objects: number
}

export class UserQuota {
  enabled: boolean
  check_on_raw: boolean
  max_size: number
  max_size_kb: number
  max_objects: number
}

export class Subusers {
  id: string
  permissions: string
}



