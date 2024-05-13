import { Component, OnInit } from '@angular/core';
import { BackupRecord } from '../../../../model/backup-record.model';

@Component({
  selector: 'app-backup-history',
  templateUrl: './backup-history.component.html',
  styleUrls: ['./backup-history.component.css']
})
export class BackupHistoryComponent implements OnInit {

  backupRecordList : BackupRecord[] = [
    {
      "id": 2048,
      "scheduleName": "cascac47",
      "backupName": "",
      "backupSize": "",
      "backupRecordCode": "23z2anhqttey",
      "startTime": "2024-04-02 02:02:01",
      "endTime": "",
      "statusFlag": true,
      "type": 0,
      "status": "Thất bại"
    },
    {
      "id": 2047,
      "scheduleName": "cascac47",
      "backupName": "",
      "backupSize": "",
      "backupRecordCode": "63yo0c1w9x2x",
      "startTime": "2024-04-01 14:50:17",
      "endTime": "",
      "statusFlag": true,
      "type": 0,
      "status": "Thất bại"
    },
    {
      "id": 2046,
      "scheduleName": "cascac47",
      "backupName": "",
      "backupSize": "",
      "backupRecordCode": "x3udukp5j5n4",
      "startTime": "2024-03-28 02:02:02",
      "endTime": "",
      "statusFlag": true,
      "type": 0,
      "status": "Thất bại"
    },
    {
      "id": 2045,
      "scheduleName": "cascac47",
      "backupName": "",
      "backupSize": "",
      "backupRecordCode": "83tj813uxjg2",
      "startTime": "2024-03-27 02:02:02",
      "endTime": "",
      "statusFlag": true,
      "type": 0,
      "status": "Thất bại"
    },
    {
      "id": 2044,
      "scheduleName": "cascac47",
      "backupName": "",
      "backupSize": "",
      "backupRecordCode": "d3solhlqdje5",
      "startTime": "2024-03-26 02:02:02",
      "endTime": "",
      "statusFlag": true,
      "type": 0,
      "status": "Thất bại"
    },
    {
      "id": 2043,
      "scheduleName": "cascac47",
      "backupName": "",
      "backupSize": "",
      "backupRecordCode": "y3rtyxu2sq23",
      "startTime": "2024-03-25 02:02:02",
      "endTime": "",
      "statusFlag": true,
      "type": 0,
      "status": "Thất bại"
    },
    {
      "id": 2042,
      "scheduleName": "cascac47",
      "backupName": "",
      "backupSize": "",
      "backupRecordCode": "y3qzcebmbfnc",
      "startTime": "2024-03-24 02:02:02",
      "endTime": "",
      "statusFlag": true,
      "type": 0,
      "status": "Thất bại"
    },
    {
      "id": 2041,
      "scheduleName": "cascac47",
      "backupName": "",
      "backupSize": "",
      "backupRecordCode": "t3q4puu7l8wd",
      "startTime": "2024-03-23 02:02:02",
      "endTime": "",
      "statusFlag": true,
      "type": 0,
      "status": "Thất bại"
    },
    {
      "id": 2040,
      "scheduleName": "cascac47",
      "backupName": "",
      "backupSize": "",
      "backupRecordCode": "83pa3b1goqtv",
      "startTime": "2024-03-22 02:02:02",
      "endTime": "",
      "statusFlag": true,
      "type": 0,
      "status": "Thất bại"
    },
    {
      "id": 2039,
      "scheduleName": "cascac47",
      "backupName": "",
      "backupSize": "",
      "backupRecordCode": "h3ofgs52b13a",
      "startTime": "2024-03-21 02:02:03",
      "endTime": "",
      "statusFlag": true,
      "type": 0,
      "status": "Thất bại"
    }
  ];

  selectedBackupRecord: BackupRecord = new BackupRecord();

  total: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;

  constructor() {

    // this.backupService.refreshBackupListHistory$
    //   .pipe(takeUntil(this.destroyService))
    //   .subscribe(() => {
    //     this.searchBackupHistory();
    //   })

    // this.eventService.backupEvent$
    //   .pipe(takeUntil(this.destroyService))
    //   .subscribe(r => {
    //     this.handleBackupWsResponse(r);
    //   })

  }

  ngOnInit(): void {

    // this.searchBackupHistory();

  }

  // ngOnDestroy(): void {

  //   this.destroyService.destroy();

  // }

  changePageIndex(pageIndex: number) {
    this.pageIndex = pageIndex;
    // this.searchBackupHistory();
  }

  changePageSize(pageSize: number) {
    this.pageSize = pageSize;
    // this.searchBackupHistory();
  }

  // // only search command in backup history
  handleCommand(command: { cmd: string, data?: Array<any> }) {
    // this.searchBackupHistory(command.data[0], command.data[1])
  }

  // searchBackupHistory(search_text?: string, search_status?: number) {

  //   search_text = search_text ?? '';
  //   search_status = search_status ?? -1; // ?? nulllish coalescing

  //   Base.showLoading();
  //   this.backupService.searchBackupHistory(this.pageIndex, this.pageSize, search_text, search_status, this.service.service_order_code)
  //     .pipe(finalize(() => Base.hideLoading()))
  //     .subscribe(r => {
  //       this.total = r.total;
  //       this.backupRecordList = r.content;
  //     })
  // }

  // handleBackupWsResponse(wsMessage: NotificationMessage) {

  //   console.log('In Backup History: ws message = ', wsMessage);
  //   const backupWs: BackupWsResponse = JSON.parse(wsMessage.message);
  //   if (backupWs.service_order_code == this.service.service_order_code) {
  //     if (backupWs.content && backupWs.content != "") {
  //       if (wsMessage.notification_status == NotificationConstant.NOTI_OK) {
  //         Base.showNotification(backupWs.content, Base.NOTI_OK);
  //       } else {
  //         Base.showNotification(backupWs.content, Base.NOTI_ERROR);
  //       }
  //     }

  //     this.searchBackupHistory();

  //   }

  // }

  setSelectedBackup(backup: BackupRecord) {
    this.selectedBackupRecord = backup;
  }

  requestCancelBackup() {
    // Base.showLoading();
    // this.backupService.cancelBackup(this.service.service_order_code, this.selectedBackupRecord.backup_record_code)
    //   .pipe(finalize(() => {
    //     Base.showLoading();
    //     this.searchBackupHistory();
    //   }))
    //   .subscribe(r => {

    //   });
  }

  requestDeleteBackupRecord() {
    // Base.showLoading();
    // this.backupService.deleteBackupRecord(this.service.service_order_code, this.selectedBackupRecord.backup_record_code)
    //   .pipe(finalize(() => {
    //     Base.hideLoading();
    //     this.searchBackupHistory();
    //   }))
    //   .subscribe(r => {

    //   });
  }

}


