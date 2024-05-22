import { KubernetesConstant } from "../constants/kubernetes.constant";
import { KubernetesCluster } from "./cluster.model";

export class SecurityGroupSearchCondition {
  userId: number;
  regionId: number;
  projectId: number;
  securityGroupId?: string | number;
}

export interface SecurityGroup {
  tenantId?: string;
  regionId?: number;
  id?: string;
  name?: string;
  description?: string;
  rulesInfo?: SecurityGroupRule[];
  securityGroupRules?: SecurityGroupRule[];
}

export default interface SecurityGroupRule {
  id?: string,
  remoteGroupId?: string,
  remoteIpPrefix?: string,
  portRangeMax?: number,
  portRangeMin?: number,
  protocol?: string,
  etherType?: string,
  direction: 'ingress' | 'egress',
  securityGroupId?: string,
  portRange?: string,
  remoteIp?: string,
  description: string;
}

export class CreateSGReqDto {
  userId: number;
  name: string;
  description: string;
  regionId: number;
  projectId: number;
}

export class SecurityGroupData {
  regionId: number;
  projectId: number;
  detailCluster: KubernetesCluster;
  securityGroupId: string;
  listOfSG: SecurityGroup[];
  listOfInbound: SecurityGroupRule[];
  listOfOutbound: SecurityGroupRule[];
}

export class FormDeleteRule {
  id: string
  userId: number
  regionId: number
  projectId: number
}

export class SGLoggingReqDto {

  securityGroupName: string;
  serviceOrderCode: string;
  operation: string;
  resourceType: string = KubernetesConstant.DEFAULT_RESOURCE;
  userId: string;
  action: string;
  jsonRule: string;

}
