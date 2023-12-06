export class User {
  id: number;
  name: string;
  groups: number;
  createdTime: string;
}

export class GroupCreateUser {
    id: number;
    name: string;
    numberUsers: number;
    attachedPolicies: string[];
    createdTime: string;
}
