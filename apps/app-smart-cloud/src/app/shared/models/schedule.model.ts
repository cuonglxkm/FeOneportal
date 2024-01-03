export interface BackupSchedule {
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
  serviceName: string
  backupPackageName: string
}

export class BackupScheduleItem {
  id: number
  scheduleId: number
  itemId: number
  itemType: number
  itemName: string
}

export class FormSearchScheduleBackup {
  customerId: number
  region: number
  project: number
  scheduleName: string
  scheduleStatus: string
  pageIndex: number
  pageSize: number
}

export class FormAction {
  customerId: number
  scheduleId: number
  actionType: 'pause' | 'play' | 'reactive'
}

export class FormCreateSchedule {
  customerId: number
  name: string
  description: string
  mode: number
  serviceType: number
  instanceId: number
  listAttachedVolume: number[]
  volumeId: number
  maxBackup: number
  backupPacketId: number
  runtime: any
  daysOfWeek: string[]
  intervalWeek: number
  dayOfWeek: string
  intervalMonth: number
  dayOfMonth: number
}

export class FormEditSchedule {
  scheduleId: number
  customerId: number
  name: string
  description: string
  mode: number
  serviceType: number
  volumeId: number
  maxBackup: number
  runtime: any
  daysOfWeek: string[]
  intervalWeek: number
  dayOfWeek: string
  intervalMonth: number
  dayOfMonth: number
}

export class CapacityBackupSchedule {
  packageType: string
  packageName: string
  expirationDate: any
  totalCapacity: number
  usedCapacity: number
  remainingCapacity: number
}


