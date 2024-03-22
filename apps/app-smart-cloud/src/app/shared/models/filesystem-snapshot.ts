export class FormSearchFileSystemSnapshot {
    regionId: number
    customerId: number
    vpcId: number
    isCheckState: boolean
    pageSize: number
    currentPage: number
  }

  export class FormCreateFileSystemSnapShot {
    name: string
    description: string
    projectId: string
    shareId: number
    force: boolean
    displayName: string
    displayDescription: string
    vpcId: number
    customerId: number
    region: number
    scheduleId: number
    size: number
    }