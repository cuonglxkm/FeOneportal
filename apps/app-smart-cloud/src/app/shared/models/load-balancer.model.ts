
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
  subnetName: string
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

export class FormOrder {
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

export class PoolDetail {
  poolId: string;
  name: string;
  description: string;
  adminStateUp: boolean;
  lb_algorithm: string;
  cookie_name: string;
  type: string;
  healthMonitorId: string;
  protocol: string;
  sessionPersistence: boolean;
}


export class FormExtendLoadBalancer {
  regionId: number
  serviceName: string
  customerId: number
  projectId: number
  vpcId: number
  typeName: "SharedKernel.IntegrationEvents.Orders.Specifications.LoadBalancerExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null"
  serviceType: number
  actionType: number
  serviceInstanceId: number
  newExpireDate: Date
  userEmail: string
  actorEmail: string
}

export class Pool {
  loadbalancerCloudId: string
  listener_id: string
  name: string
  description: string
  algorithm: string
  sessionPersistence: true
  provisioningStatus: string
  operatingStatus: string
  protocol: string
  id: string
  tag: string[]
  healthmonitor_id: string
}

export class CreatePool {
  listener_id: string
  name: string
  description: string
  algorithm: string
  sessionPersistence: boolean
  protocol: string
  customerId: number
  regionId: number
  vpcId: number
  loadbalancer_id: string
}

export class FormCreateL7Policy {
  action: string
  adminStateUp: boolean
  description: string
  listenerId: string
  regionId: number
  vpcId: number
  name: string
  position: number
  projectId: string
  redirectHttpCode: number
  redirectPoolId: string
  redirectUrl: string
  customerId: number
}

export class FormUpdatePool {
  poolId: string
  name: string
  description: string
  adminStateUp: true
  lb_algorithm: string
  session: boolean
  customerId: number
  vpcId: number
  regionId: number
}

export class MemberOfPool {
  id: string;
  customerId: number;
  regionId: number;
  vpcId: number;
  name: string;
  ipAddress: string;
  port: number;
  weight: number;
  poolId: string;
  backup: boolean;
  subnetId: string;
}

export class MemberCreateOfPool {
  customerId: number
  regionId: number
  vpcId: number
  name: string
  address: string
  protocol_port: number
  weight: number
  poolId: string
  backup: boolean
  subnetId: string
}

export class MemberUpdateOfPool {
  memberId: string
  customerId: number
  regionId: number
  vpcId: number
  name: string
  address: string
  protocol_port: number
  weight: number
  poolId: string
  backup: boolean
}

export class HealthCreate {
  name: string;
  delay: number;
  maxRetries: number;
  type: string;
  timeout: number;
  adminStateUp: boolean;
  poolId: string;
  expectedCodes: string;
  httpMethod: string;
  urlPath: string;
  maxRetriesDown: number;
  customerId: number;
  projectId: number;
  regionId: number;
}

export class HealthUpdate {
  id: string;
  name: string;
  delay: number;
  maxRetries: number;
  timeout: number;
  adminStateUp: boolean;
  expectedCodes: string;
  httpMethod: string;
  urlPath: string;
  maxRetriesDown: number;
  customerId: number;
  projectId: number;
  regionId: number;
}


