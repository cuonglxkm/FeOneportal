export class FormCreateFileSystemSsSchedule {
  customerId: number
  projectId: number
  regionId: number
  dayOfWeek: string
  daysOfWeek: string[]
  description: string
  intervalWeek: number
  mode: number
  dates: string
  duration: number
  name: string
  runtime: any
  intervalMonth: number
  maxSnapshot: number
  shareIds: number[]
  }

  export class FormSearchFileSystemSsSchedule {
    searchValue: string
    regionId: number
    pageSize: number
    pageNumber: number
    }

    export class FileSystemSnapshotScheduleModel {
      id: number
      name: string
      serviceId: number
      description: string
      mode: number
      runtime: Date
      maxSnapshot: number
      interval: number
      duration: number
      dates: number
      daysOfWeek: string
      createdAt: Date
      updatedAt: Date
      status: string
      nextRuntime: Date
      currentSnapshot: number
      proccessId: string
      serviceType: number
      warningMessage: string
      customerId: number
      regionId: number
      projectId: number
      items: [
        {
          itemId: number
          itemType: number
        }
      ]
    }