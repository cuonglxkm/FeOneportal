export interface BackupVm {
  id: number,
  name: string,
  instanceId: number,
  description: string,
  regionId: number,
  cloudIdentityId: number,
  projectId: number,
  projectName: string,
  status: string,
  scheduleId: number,
  backupPacketId: number,
  systemInfoBackups: SystemInfoBackup,
  securityGroupBackups: SecurityGroupBackup,
  serviceStatus: string,
  creationDate: any,
  suspendDate: any,
  suspendType: string,
  vpcName: string,
  customerEmail: string,
  instanceName: string
}

export interface SystemInfoBackup {
  id: number,
  instanceBackupId: number,
  ram: number,
  cpu: number,
  rootSize: number,
  flavorName: string,
  osName: string,
  imageId: string
}

export interface SecurityGroupBackup {
  id: number,
  instanceBackupId: number,
  sgName: string,
  protocol: string,
  portMax: number,
  portMin: number,
  direction: string,
  etherType: string,
  remoteIpPrefix: string
}

export interface BackupVMFormSearch {
  regionId: number,
  customerId: number,
  projectId: number,
  status: string,
  instanceBackupName: string,
  pageSize: number,
  currentPage: number
}
