export class BackupRecord {

  id: number;
  scheduleName: string;
  backupRecordCode: string;
  backupName: string;
  backupSize: string;
  startTime: string;
  endTime: string;
  statusFlag: boolean;
  type: number;
  status: string;

  constructor() {
    this.id = 1;
    this.scheduleName = '';
    this.backupRecordCode = '';
    this.backupName = '';
    this.backupSize = '';
    this.startTime = '';
    this.endTime = '';
    this.statusFlag = false;
    this.type = -1;
    this.status = '';
  }
}
