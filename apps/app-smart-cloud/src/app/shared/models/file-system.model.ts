export class FileSystemModel {
  id: number
  name: string
  type: string
  protocol: string
  size: number
  projectId: number
  projectName: string
  cloudId: string
  cloudIdentityId: number
  regionId: number
  regionText: string
  postResizeShareId: number
  status: string
  taskState: string
  expiredDate: Date
  createDate: Date
  customerId: number
  email: string
  description: string
  statusDisplay: string
}

export class FormSearchFileSystem {
  regionId: number
  vpcId: number
  name: string
  isCheckState: boolean
  pageSize: number
  currentPage: number
}
