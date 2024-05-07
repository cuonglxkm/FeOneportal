import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BackupList } from '../../../../model/backup-list.model';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { BackupPlanComponent } from '../backup-plan/backup-plan.component';
import { BackupDetail } from '../../../../model/backup-detail.model';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MongodbDetail } from 'apps/app-mongodb-replicaset/src/app/model/mongodb-detail.model';

@Component({
  selector: 'app-backup-list',
  templateUrl: './backup-list.component.html',
  styleUrls: ['./backup-list.component.css']
})
export class BackupListComponent implements OnInit {

  @Input() service?: MongodbDetail;

  backupList: BackupList[] = [
    {
      "id": 90,
      "schedule_name": "cascac47",
      "created_date": "2024-03-07 14:02:49",
      "created_name": "Vũ Thị Dung",
      "backup_name":"",
      "backup_size":"",
      "type": '0',
      "status": "Đang hoạt động",
      "start_time": new Date(1712170920000),
      "end_time": new Date(1712170920000),
      "status_flag": true,
      "next_run_time": new Date(1712170920000)
    },
    {
      "id": 91,
      "schedule_name": "cascac3",
      "created_date": "2024-03-07 14:03:07",
      "created_name": "Vũ Thị Dung",
      "backup_name":"",
      "backup_size":"",
      "type": '1',
      "start_time": new Date(1712170920000),
      "end_time": new Date(1712170920000),
      "status_flag": true,
      "status": "Ngừng hoạt động",
      "next_run_time": new Date(1712170920000)
    }
  ];

  total: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;

  visibleInfor:boolean=false;
  backupDetail: BackupDetail;
  selectedBackup: BackupList = new BackupList();

  constructor(private drawerService: NzDrawerService,
    private modalService:NzModalService
  ) {


  }

  ngOnInit(): void {
    // find all
    this.searchBackupList();


  }


  closeInfor(){
    this.visibleInfor = false;
  }

  setSelectedBackup(backup: BackupList) {
    this.selectedBackup = backup;
  }

  changePageIndex(pageIndex: number) {
    this.pageIndex = pageIndex;
    this.searchBackupList();
  }

  changePageSize(pageSize: number) {
    this.pageSize = pageSize;
    this.searchBackupList();
  }

  handleCommand(command: { cmd: string, data?: Array<any> }) {
    if (command.cmd == 'search') {
      if (command.data && command.data.length >= 2)
        this.searchBackupList(command.data[0], command.data[1])
      else
        return
    } else {
      this.createBackup();
    }
  }

  searchBackupList(search_text?: string, search_type?: number) {

    // search_text = search_text ?? '';
    // search_type = search_type ?? -1;

    // Base.showLoading();
    // this.backupService.searchBackupSchedule(this.pageIndex, this.pageSize, search_text, search_type, this.service.service_order_code)
    //   .pipe(finalize(() => Base.hideLoading()))
    //   .subscribe(r => {
    //     this.total = r.total;
    //     this.backupList = r.content;
    //     this.backupList.map(b => {
    //       b.status_flag = b.status == "Đang hoạt động" ? true : false;
    //       return b;
    //     })
    //   })
  }

  // handleBackupWsResponse(wsMessage: NotificationMessage) {

  //   console.log('In Backup List: ws message = ', wsMessage);
  //   const backupWs: BackupWsResponse = JSON.parse(wsMessage.message);
  //   if (backupWs.service_order_code == this.service.service_order_code) {
  //     if (backupWs.content && backupWs.content != "") {
  //       if (wsMessage.notification_status == NotificationConstant.NOTI_OK) {
  //         Base.showNotification(backupWs.content, Base.NOTI_OK);
  //       } else {
  //         Base.showNotification(backupWs.content, Base.NOTI_ERROR);
  //       }
  //     }

  //     this.searchBackupList();

  //   }

  // }

  createBackup() {
    this.drawerService.create<BackupPlanComponent, { service: MongodbDetail }>({
      nzTitle: '<h3><b> Lập lịch backup </b><h3>',
      nzContent: BackupPlanComponent,
      nzWidth: 650,
      nzMaskStyle: { opacity: 0.2 },
      nzContentParams: {
        service: this.service,
        isEdit: false,
      }
    })
  }

  viewBackupDetail() {
    this.visibleInfor = true;
    console.log("this.selectedBackup: ",this.selectedBackup);

    // this.drawerService.create<BackupDetailComponent, { backupInfo: BackupList }>({
    //   vContent: BackupDetailComponent,
    //   vWidth: 600,
    //   vContentParams: { backupInfo: this.selectedBackup },
    //   vMaskStyle: { opacity: 0.2 },
    // })
  }

  editBackup() {
    this.drawerService.create<BackupPlanComponent, { service: MongodbDetail, serviceSelected: BackupList, isEdit: boolean }>({
      nzTitle: '<h3><b> Chỉnh sửa lịch backup </b><h3>',
      nzContent: BackupPlanComponent,
      nzWidth: 650,
      nzMaskStyle: { opacity: 0.2 },
      nzContentParams: {
        serviceSelected: this.selectedBackup,
        isEdit: true,
        service: this.service
      }
    })
  }

  confirmUpdateBackupStatus() {
    this.modalService.confirm({
      nzTitle: "Xác nhận thay đổi",
      nzContent: "Bạn có chắc chắn muốn " + (this.selectedBackup.status == "Đang hoạt động" ? "ngừng kích hoạt" : "kích hoạt") +
        " Lịch backup này không?",
      nzCancelText: "Hủy",
      nzOnOk: () => {
        this.selectedBackup.status = (this.selectedBackup.status == "Đang hoạt động")?"Ngừng hoạt động" : "Đang hoạt động";
        // this.backupService.changeBackupStatus(this.selectedBackup.id)
        //   .pipe(finalize(() => Base.hideLoading()))
        //   .subscribe(r => {
        //     if (r && r.code == 200) {
        //       this.selectedBackup.status_flag = this.selectedBackup.status_flag ? false : true;
        //       this.selectedBackup.status = this.selectedBackup.status == "Đang hoạt động" ? "Ngừng hoạt động" : "Đang hoạt động"
        //     }
        //   });
      },
      nzOnCancel: ()=>{
      }
    })
  }

  requestDelBackupSchedule() {
    this.backupList = this.backupList.filter(a=>a.id != this.selectedBackup.id);
    // Base.showLoading();
    // this.backupService.deleteBackupSchedule(this.service.service_order_code, this.selectedBackup.id)
    //   .pipe(finalize(() => {
    //     Base.hideLoading();
    //     this.searchBackupList();
    //   }))
    //   .subscribe(r => {

    //   })


    // const mode = BackupOperation.DELETE;
    // this.backupService.sendOtpBackup(mode, this.service.service_order_code, this.selectedBackup.id)
    //   .pipe(finalize(() => Base.hideLoading()))
    //   .subscribe(r => {
    //     if (r && r.code == 200) {
    //       this.modalService.create({
    //         vTitle: 'Xóa lịch backup',
    //         vFooter: null,
    //         vContent: BackupOtpComponent,
    //         vComponentParams: {
    //           service: this.service,
    //           backup: this.selectedBackup,
    //           mode: mode,
    //           titleOtp: r.msg,
    //           keyCheckOtp: r.data,
    //           data: { data: {id: this.selectedBackup.id}, mode }
    //         },
    //       })
    //     }
    //   })

  }

}
