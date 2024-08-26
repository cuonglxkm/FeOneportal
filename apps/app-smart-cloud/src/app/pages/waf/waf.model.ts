export class WafsDTO {
  wafName: string;
  wafPackage: string;
  beginDate: Date;
  endDate: string;
  status: string;
}

export class WAFExtend {
  regionId: number
  serviceName: string
  customerId: number
  projectId: string
  vpcId: string
  typeName: string
  serviceType: number
  actionType: number
  serviceInstanceId: number
  newExpireDate: string
  userEmail: string
  actorEmail: string
}

export class WAFResize {
  newOfferId: number;
  serviceType: number;
  actionType: number;
  serviceInstanceId: number;
  regionId: number;
  serviceName: string;
  customerId: number;
  projectId: string;
  vpcId: string;
  typeName: string;
  userEmail: string;
  actorEmail: string;
}
export class WafDTO{
  id: number;
  name:string;
  package:string;
  begin:Date;
  end:Date;
  status:string;
}

export class WafDetailDTO{
  id: number
  name: string
  policyId: number
  policyName: number
  offerName: string
  offerId: number
  status: string
  customerId: number
  createdDate: Date
  expiredDate: Date
  serviceStatus: string
  suspendType: string
  suspendReason: string
  quotaDomain: number
  domainTotal: number
  wafDomains: [
    {
      id: number
      domain: string
      ipPublic: string
      host: string
      port: string
      sslCertId: string
      policyId: number
      status: string
      wafPackageId: number
      customerId: number
      cdnId: string
    }
  ]
}


export class SslCertRequest{
 name: string
 privateKey: string
 certificate: string
 remarks:string
}

export interface WafDomain {
  id: number;
  domain: string;
  ipPublic: string;
  cName:string;
  host: string;
  port: number | null;
  protocol: string;
  portRewriting:number | null;
  sslCertId: number | null;
  policyId: number | null;
  status: string;
  wafPackageId: number;
  customerId: number;
  cdnId: number | null;
  message: string;
  resouceStatus: string;
  offerName: string;
  wafPackageName: string;
  sysDomainInfoVO : SysDomainInfoVO;
  packagePolicies: PackagePolicies;
  someSwitchesOn : boolean;
  sslCertName: string
}

export interface SysDomainInfoVO{
    id?: string;
    domain?: string;
    createTime?: string;
    deployStatus?: string;
    blockSwitch?: string;
    defendStatus?: string;
    dmsDefendSwitch?: string;
    botManageSwitch?: string;
    customizeRuleSwitch?: string;
    apiDefendSwitch?: string;
    rateLimitSwitch?: string;
    whitelistSwitch?: string;
    intelligenceSwitch?: string;
    wafDefendSwitch?: string;
}

export class AddDomainRequest {
  domain: string
  ipPublic: string
  host: string
  port: string
  sslCertId: string | number
  policyId: string | number
  packageId: string | number
}

export class EditDomainRequest {
  ipPublic: string;
  host: string;
  port: string | number
}

export class HttpsSettingRequest {
  certId: number;
  protocol?: string;
  port?: string
}

export interface SslCertDTO {
  id: number;
  name: string;
  customerId: number;
  cdCertId: number;
  type: number;
  serial: string;
  notBefore: string;
  notAfter: string;
  commonName: string;
  issuer: string;
  subjectAlternativeNames: string[];
  domains: AssociatedDomainDTO[];
  content: string;
  certType: string;
  domainAllowAssociates: AllowedAssociatedDomainDTO[]
  keyUsage: string;
}
export interface UpdatePolicies {
  ddos?: boolean | null;
  iPGeoBlock?: boolean | null;
  rateLimit?: boolean | null;
  customRules?: boolean | null;
  waf?: boolean | null;
  whiteList?: boolean | null;
  threatIntelligence?: boolean | null;
}

export interface AssociatedDomainDTO {
  domainName: string;
  domainStatus: string
  id: number
}

export interface AllowedAssociatedDomainDTO {
  domainName: string;
  id: number
}

export interface PackagePolicies {
  ddos: boolean;
  ipGeoBlock: boolean;
  rateLimit: boolean;
  customRules: boolean;
  waf: boolean;
  whiteList: boolean;
  threatIntelligence: boolean;
}

export class QueryBandwidthForMultiDomainResponse2  {
    bandwidthReport: QueryBandwidthForMultiDomainResponseBandwidthReport[];
    code: string;
    message: string;
}

export class QueryBandwidthForMultiDomainResponseBandwidthReport {
    timestamp: string;
    bandwidth: number | null;
}

export class QueryTrafficForMultiDomainResponse  {
  flowSummary: number;
  flowData: QueryTrafficForMultiDomainResponseFlowData[];
  code: string;
  message: string;
}

export class QueryTrafficForMultiDomainResponseFlowData {
  timestamp: string;
  flow: number | null;
}

export class QueryRequesBandwidthtSavingRatioRequestDto {
  dateFrom : Date;
  dateTo : Date
  domain : string[];
  dataInterval : string
}

export class QueryRequesBandwidthtSavingRatioResponse {
  code: string;
  message: string;
  data: QueryRequesBandwidthtSavingRatioResponseData[];
}

export class QueryRequesBandwidthtSavingRatioResponseData {
  realDate: string;
  totalAvg: number | null;
  savingBandwidthDatas: QueryRequesBandwidthtSavingRatioResponseDataSavingBandwidthDatas[];
}

export class QueryRequesBandwidthtSavingRatioResponseDataSavingBandwidthDatas {
  timestamp: string;
  savingBandwidth: string;
}

export class QueryBacktoOriginTrafficAndRequestRequestDto {
  dateFrom : Date;
  dateTo : Date;
  dataInterval : string;
  domain : string[];
  groupBy : string[];
  backsrcOnly : number | null;
}

export class QueryBacktoOriginTrafficAndRequestResponse {
  code: string;
  message: string;
  result: QueryBacktoOriginTrafficAndRequestResponseResult[];
}

export class QueryBacktoOriginTrafficAndRequestResponseResult {
  domain: string;
  totalFlow: string;
  totalRequest: string;
  peakRequest: string;
  peakRequestTime: string;
  peakBandwidth: string;
  peakBandwidthTime: string;
  flowRequestOriginData: QueryBacktoOriginTrafficAndRequestResponseResultFlowRequestOriginData[];
}

export class QueryBacktoOriginTrafficAndRequestResponseResultFlowRequestOriginData {
  timestamp: string;
  flow: string;
  bandwidth: string;
  request: string;
}

export class QueryTrafficRequestInTotalAndPeakValueRequestDto {
  dateFrom: Date;
  dateTo: Date;
  domain: string[];
  groupBy: string[];
  dataPadding: boolean | null;
}

export class QueryTrafficRequestInTotalAndPeakValueResponse {
  code: string;
  message: string;
  result: QueryTrafficRequestInTotalAndPeakValueResponseResult[];
}

export class QueryTrafficRequestInTotalAndPeakValueResponseResult {
  domain: string;
  totalFlow: string;
  totalRequest: string;
  peakBandwidth: string;
  peakTime: string;
  peakRequest: string;
  peakRequestTime: string;
  flowRequestData: QueryTrafficRequestInTotalAndPeakValueResponseResultFlowRequestData[];
}

export class QueryTrafficRequestInTotalAndPeakValueResponseResultFlowRequestData {
  timestamp: string;
  flow: string;
  bandwidth: string;
  request: string;
}