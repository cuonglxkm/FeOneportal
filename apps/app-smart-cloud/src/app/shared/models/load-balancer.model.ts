
export class LoadBalancerModel {
  id: number
  customerId: number
  name: string
  cloudId: string
  cloudIdentityId: number
  connectionLimit: number
  description: string
  internetFacing: boolean
  ipAddress: string
  projectId: number
  projectName: string
  region: number
  regionText: string
  status: string
  subnetId: string
  subnetAddress: string
  offerId: number
  vpcId: number
  createDate: Date
  expiredDate: Date
  m_LBSDNListener: m_LBSDNListener
  operatingStatus: string
  provisioningStatus: string
  listeners: string[]
  isFloatingIP: true
  floatingIPAddress: string
  ipVIP: string
  offerName: string
}

export class m_LBSDNListener {
  allowedCidrs: string[]
  description: string
  name: string
  id: string
  loadBalancerId: string
  protocol: string
  port: number
  certSSL: string
  sslCertification: SSlCertification[]
  timeoutClientData: number
  timeoutMemberConnect: number
  timeoutMemberData: number
  timeoutTcpInspect: number
  m_LBSDNSSLCertRef: m_LBSDNSSLCertRef
  m_LBSDNPool: m_LBSDNPool
  operatingStatus: string
  status: string
  provisioningStatus: string
}

export class SSlCertification {
  name: string
  secret_ref: string
  expiration: string
}

export class m_LBSDNSSLCertRef {
  name: string
  secret_ref: string
  expiration: string
}

export class m_LBSDNPool {
  id: string
  lbAlgorithm: number
  listenerId: number
  name: string
  protocol: number
  sessionPersistence: SessionPersistence
  m_LBSDNHealthMonitor: m_LBSDNHealthMonitor
  m_LBSDNMember: m_LBSDNMember
  m_LBSDNSessionPersistence: m_LBSDNSessionPersistence
}

export class SessionPersistence {
  cookieName: string
  type: number
}

export class m_LBSDNHealthMonitor {
  delay: number
  expectedCodes: string
  httpMethod: string
  id: string
  maxRetries: number
  maxRetriesDown: number
  name: string
  poolId: number
  tags: string[]
  timeout: number
  type: string
  urlPath: string
  operating_status: string
  provisioning_status: string
}

export class m_LBSDNMember {
  address: string
  backup: boolean //true
  monitorAddress: string
  monitorPort: number
  poolId: string
  protocolPort: number
  tags: string[]
}

export class m_LBSDNSessionPersistence {
  cookieName: string
  type: number
}

export class FormSearchListBalancer {
  vpcId: number
  regionId: number
  name: string
  pageSize: number
  currentPage: number
  isCheckState: boolean
}

export class FormCreateLoadBalancer {
  duration: number
  ipAddress: string
  subnetId: string
  description: string
  name: string
  isFloatingIP: boolean
  flavorId: string
  ipPublicId: number
  customerId: number
  userEmail: string
  actorEmail: string
  projectId: string
  regionId: number
  serviceName: string
  serviceType: number
  actionType: number
  serviceInstanceId: number
  createDate: string
  expireDate: string
  createDateInContract: string
  saleDept: string
  saleDeptCode: string
  contactPersonEmail: string
  contactPersonPhone: string
  contactPersonName: string
  am: string
  amManager: string
  note: string
  isTrial: false
  offerId: number
  couponCode: string
  dhsxkd_SubscriptionId: string
  dSubscriptionNumber: string
  dSubscriptionType: string
  oneSMEAddonId: string
  oneSME_SubscriptionId: string
  typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.LoadbalancerCreateSpecificationSharedKernel.IntegrationEvents Version=1.0.0.0 Culture=neutral PublicKeyToken=null"
}

export class FormCreate {
  customerId: number
  createdByUserId: number
  note: string
  couponCode: string
  orderItems: [
    {
      orderItemQuantity: number
      specification: string
      specificationType: string
      price: number
      serviceDuration: number
    }
  ]
}

export class FormUpdateLB {
  id: number
  customerId: number
  name: string
  description: string
  offerId: number
}

export class IPBySubnet {
  id: number
  ipAddress: string
  portCloudId: string
  customerId: number
  attachedVmId: number
  region: number
  regionText: string
  createDate: Date
  status: number
  cloudIdentity: number
  projectName: string
  projectId: number
  networkId: string
  iPv6Address: string
  serviceStatus: string
  attachedVm: string
  expiredDate: Date
  resourceStatus: string
  suspendType: string
  typeIP: string
  network: string
  fixedIpAddress: string
  loadbalancerId: number
  loadbalancerName: string
}


