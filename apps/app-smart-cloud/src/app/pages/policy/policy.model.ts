import {BaseResponse} from "../../../../../../libs/common-utils/src";

export interface PolicyModel {
  id: any;
  name: any;
  type: any;
  description: any;
  jsonData: JSON;
  expand: boolean;
}

export interface PermissionPolicyModel {
  id: any;
  name: any;
  description: any;
}

export interface AttachedEntitiesDTO{
  name: string;
  type: number;
}
