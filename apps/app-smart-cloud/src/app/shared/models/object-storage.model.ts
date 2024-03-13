export class ObjectStorageCreate {
  quota: number;
  customerId: number;
  userEmail: any;
  actorEmail: any;
  vpcId: any;
  regionId: number;
  serviceName: any;
  serviceType: number;
  actionType: number;
  serviceInstanceId: number;
  createDate: string;
  expireDate: string;
  createDateInContract: any;
  saleDept: any;
  saleDeptCode: any;
  contactPersonEmail: any;
  contactPersonPhone: any;
  contactPersonName: any;
  am: any;
  amManager: any;
  note: any;
  isTrial: boolean;
  offerId: number;
  couponCode: any;
  dhsxkd_SubscriptionId: any;
  dSubscriptionNumber: any;
  dSubscriptionType: any;
  oneSMEAddonId: any;
  oneSME_SubscriptionId: any;
  typeName: string;
}

export class ObjectStorageExtend {
  regionId: number;
  serviceName: any;
  customerId: number;
  vpcId: any;
  typeName: string;
  serviceType: number;
  actionType: number;
  serviceInstanceId: number;
  newExpireDate: string;
  userEmail: any;
  actorEmail: any;
}

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



