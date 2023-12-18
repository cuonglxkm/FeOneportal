export class BackupSchedule {
  id: number
  name: string
  serviceId: number
  description: string
  mode: number
  runtime: any
  maxBackup: number
  interval: number
  duration: number
  dates: number
  daysOfWeek: string
  createdAt: any
  updatedAt: any
  status: string
  nextRuntime: any
  currentBackup: number
  proccessId: string
  serviceType: number
  warningMessage: string
  backupPackageId: number
  customerId: number
  regionId: number
  backupScheduleItems: BackupScheduleItem[]
}

export class BackupScheduleItem {
  id: number
  scheduleId: number
  itemId: number
  itemType: number
}

export class FormSearchScheduleBackup {
  customerId: number
  region: number
  project: number
  name: string
  pageIndex: number
  pageSize: number
}
