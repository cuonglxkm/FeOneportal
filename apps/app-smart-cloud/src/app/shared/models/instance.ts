export class InstanceFormSearch {
  searchValue: string
  status: string
  isCheckState: boolean
  fromDate: any
  toDate: any
  region: number
  userId: number
  pageNumber: number
  pageSize: number
  securityGroupId: string
  projectId: number
}

export interface Instance {
  id: number,
  cloudId: string,
  name: string,
  flavorId: number,
  flavorName: string,
  customerId: number,
  ipPublic: string,
  ipPrivate: string,
  regionId: number,
  regionText: string,
  createdDate: any,
  cloudIdentityId: number,
  projectName: string,
  projectId: number,
  volumeRootId: number,
  status: string,
  taskState: string,
  securityGroups: string
}
