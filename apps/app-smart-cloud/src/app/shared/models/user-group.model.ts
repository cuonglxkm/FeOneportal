export interface UserGroupModel {
    name: string
    parent: string
    policies: string[]
    groupUsers: string[]
    userOfGroup: number
    createdDate: any
}

export class FormSearchUserGroup {
    name: string
    pageSize: number
    currentPage: number
}

export class FormDeleteUserGroups {
    groupNames: string[]
}

export class FormUserGroup {
    groupName: string
    parentName: string
    policyNames: string[]
    users: string[]
}

export class RemovePolicy {
  groupName: string
  items: [
      {itemName: string}
  ]
}

// export class RemoveUser {
//   userList: string[]
// }



export class FormSearchPolicy {
    policyName: string
    pageSize: number
    currentPage: number
}
