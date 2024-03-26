import { List } from "lodash";

export class IpsecPolicyDTO {
  name: string;
  authorizationAlgorithm: string;
  transformProtocol: string;
  encapsulationMode: string;
  encryptionAlgorithm: string;
  perfectForwardSecrecy: string;
  tenantId: string;
  lifetimeUnit: string;
  lifetimeValue: number;
  id: string;
  description: string;
  customerId: number;
  vpcId: number;
  regionId: number;
}

export class FormSearchIpsecPolicy {
  vpcId: number
  regionId: number
  name?: string
  pageSize: number
  currentPage: number
}

export class IpsecPolicyDetail {
  name: string;
  authorizationAlgorithm: string;
  transformProtocol: string;
  encapsulationMode: string;
  encryptionAlgorithm: string;
  perfectForwardSecrecy: string;
  tenantId: string;
  lifetimeUnit: string;
  lifetimeValue: number;
  id: string;
  description: string;
  customerId: number;
  vpcId: number;
  regionId: number;
}

export class FormCreateIpsecPolicy {
  name: string;
  authorizationAlgorithm: string;
  transformProtocol: string;
  encapsulationMode: string;
  encryptionAlgorithm: string;
  perfectForwardSecrecy: string;
  lifetimeUnit: string;
  lifetimeValue: number;
  description: string;
  customerId: number;
  vpcId: number;
  regionId: number;
}

export class FormEditIpsecPolicy {
  name: string;
  authorizationAlgorithm: string;
  transformProtocol: string;
  encapsulationMode: string;
  encryptionAlgorithm: string;
  perfectForwardSecrecy: string;
  lifetimeUnit: string;
  lifetimeValue: number;
  description: string;
  customerId: number;
  vpcId: number;
  regionId: number;
  id: string
}

export class FormDeleteIpsecPolicy {
  id: string
  vpcId: number
  regionId: number
}

export class FormCreateEndpointGroup {
  name: string
  type: string
  endpoints: List<string>
  description: string
  customerId: number
  vpcId: number
  regionId: number
}

export class FormDetailEndpointGroup {
  id: string
  projectId: string
  tenantId: string
  endpoints: List<string>
  type: string
  name: string
  description: string;
  customerId: number;
  vpcId: number;
  regionId: number;
}
