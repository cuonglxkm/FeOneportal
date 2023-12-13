export class User {
  userName: string;
  email: string;
  userGroups: string[];
  userPolicies: string[];
  userOfGroups: number;
  createdDate: string;
}

export class UseCreate {
  userName: string;
  email: string;
  groupNames: string[];
  policyNames: string[];
}

export class GroupCreateUser {
    id: number;
    name: string;
    numberUsers: number;
    attachedPolicies: string[];
    createdTime: string;
}

export class CopyUserPolicies {
    id: number;
    name: string;
    groups: string[];
    attachedPolicies: string[];
    createdTime: string;
}

export class PermissionPolicies {
  id: number;
  name: string;
  type: string;
  attachedEntities: number;
}

export class PoliciesOfUser {
  id: number;
  name: string;
  type: string;
  attachedVia: string[];
}
