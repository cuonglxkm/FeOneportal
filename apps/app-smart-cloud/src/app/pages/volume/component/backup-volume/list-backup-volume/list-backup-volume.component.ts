import {Component, Inject} from '@angular/core';
import {ProjectModel} from "../../../../../shared/models/project.model";
import {RegionModel} from "../../../../../shared/models/region.model";
import {BackupVolume} from "../backup-volume.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzMessageService} from "ng-zorro-antd/message";
import {BackupVolumeService} from "../../../../../shared/services/backup-volume.service";
import {finalize} from "rxjs/operators";

@Component({
  selector: 'one-portal-list-backup-volume',
  templateUrl: './list-backup-volume.component.html',
  styleUrls: ['./list-backup-volume.component.less'],
})
export class ListBackupVolumeComponent {
  //input
  searchKey: string = '';
  regionId: any;
  projectId: any;
  size = 10;
  index: any = 1;
  total: any = 0;
  selectedStatus: any;
  selectedAction = 'RESTORE';

  //output
  listOfData: BackupVolume[] = [];

  //common
  listStatus = [
    {label: 'Tất cả trạng thái', value: '', color: 'yellow'},
    {label: 'Hoạt động', value: 'AVAILABLE', color: 'green'},
    {label: 'Tạm dừng', value: 'SUSPENDED', color: 'orange'},
    {label: 'Lỗi', value: 'ERROR', color: 'red'},
    {label: 'Đang khởi tạo', value: 'CREATING', color: 'black'},
    {label: 'Đang xóa', value: 'DELETING', color: 'black'},
  ]

  // flag
  isVisibleDelete: boolean = false;

  constructor(private service: BackupVolumeService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private message: NzMessageService) {
  }

  //flash
  isBegin: boolean = false;
  loading = false;

  ngOnInit() {
    this.selectedStatus = this.listStatus[0].value;
  }

  loadBackupVolume(isCheckBegin: boolean) {
    this.loading = true;
    this.service.getbackupVolumeKeys(this.tokenService.get()?.userId, this.projectId, this.regionId,
      this.index, this.size, this.searchKey, this.selectedStatus)
      .pipe(finalize(() => this.loading = false))
      .subscribe(response => {
        this.listOfData = (this.checkNullObject(response) ? [] : response.records);
        this.total = (this.checkNullObject(response) ? 0 : response.totalCount);
        this.index = (this.checkNullObject(response) ? 0 : response.currentPage);
        if (isCheckBegin) {
          this.isBegin = this.checkNullObject(this.listOfData) || this.listOfData.length < 1 ? true : false;
        }
      });
  }

  projectChange(project: ProjectModel) {
    this.projectId = this.checkNullObject(project) ? "" : project.id;
    this.searchKey = "";
    this.loadBackupVolume(true);
  }

  onRegionChange(region: RegionModel) {
    this.regionId = (this.checkNullObject(region) ? "" : region.regionId);
  }

  checkNullObject(object: any): Boolean {
    if (object == null || object == undefined) {
      return true;
    }

    return false;
  }

  search(searchTerm: any) {
    this.searchKey = searchTerm;
    this.loadBackupVolume(false);
  }

  onPageSizeChange(event: any) {
    this.size = event
    this.loadBackupVolume(false);
  }

  onPageIndexChange(event: any) {
    this.index = event;
    this.loadBackupVolume(false);
  }

  detailKey(event: any) {

  }

  onchangedStatus(status: any) {
    this.selectedStatus = status;
    this.loadBackupVolume(false);
  }

  getStatusLabel(serviceStatus: string): string {
    const statusObj = this.listStatus.find(status => status.value === serviceStatus);
    return statusObj ? statusObj.label : '';
  }

  getStatusColor(serviceStatus: string): string {
    const statusObj = this.listStatus.find(status => status.value === serviceStatus);
    return statusObj ? statusObj.color : '';
  }

  handleCancel(form: any): void {
    console.log('Button cancel clicked')
    this.isVisibleDelete = false;
    form.resetForm();
  }

  handleDelete(number: any): void {
    // call api
    // this.sshKeyService.deleteSshKey(this.data.id).subscribe(() => {
    //   this.searchKey = "";
    //   this.loadSshKeys(true);
    //   this.message.create('success', `Xóa thành công keypair`);
    // });
    this.isVisibleDelete = false;
  }


  openDataMounted(event: any, id: any): void {
    if (event == "Xóa") {
      this.isVisibleDelete = true;
    }
  }
}
