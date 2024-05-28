import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { BackupVolume } from '../backup-volume.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BackupVolumeService } from '../../../../../shared/services/backup-volume.service';
import { Router } from '@angular/router';
import { VolumeService } from '../../../../../shared/services/volume.service';
import { getCurrentRegionAndProject } from '@shared';
import {
  BaseResponse,
  NotificationService,
  ProjectModel,
  RegionModel
} from '../../../../../../../../../libs/common-utils/src';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';

@Component({
  selector: 'one-portal-list-backup-volume',
  templateUrl: './list-backup-volume.component.html',
  styleUrls: ['./list-backup-volume.component.less']
})
export class ListBackupVolumeComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  typeVpc: number;
  isLoading: boolean = false;

  statusSelected = 'all';

  inputName: string;

  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<BackupVolume[]>;
  isBegin: boolean = false

  status = [
    {label: this.i18n.fanyi('app.status.all'), value: 'all'},
    {label: this.i18n.fanyi('app.status.running'), value: 'available'},
    {label: this.i18n.fanyi('app.status.suspend'), value: 'suspended'}
  ]

  //child component
  // @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
  // private detailComponent: ComponentRef<DetailBackupVolumeComponent>;
  constructor(private backupVolumeService: BackupVolumeService,
              private volumeService: VolumeService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private message: NzMessageService,
              private router: Router,
              private notification: NzNotificationService,
              private cdr: ChangeDetectorRef,
              private notificationService: NotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    // this.getListBackupVolumes(true)
    // this.getListVolume(true);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVpc = project?.type;
    setTimeout(() => {this.getListBackupVolumes(true)}, 1500)
    // this.getListVolume(true);
  }

  onChange(value) {
    console.log('selected', value);
    this.statusSelected = value;
    this.getListBackupVolumes(false);
  }

  onInputChange(value) {
    this.inputName = value.trim();
    this.getListBackupVolumes(false);
  }

  onPageSizeChange(value) {
    this.pageSize = value;
    this.getListBackupVolumes(false);
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListBackupVolumes(false);
  }

  getListBackupVolumes(isBegin) {
    this.isLoading = true
    let valueSearch = '';
    if(this.statusSelected == 'all') {
      valueSearch = null
    }
    if(this.statusSelected == 'available' ) valueSearch = 'available'
    if(this.statusSelected == 'suspended') valueSearch = 'suspended'
    this.backupVolumeService.getListBackupVolume(this.region, this.project, valueSearch, this.inputName, this.pageSize, this.pageIndex).subscribe(data => {
      this.isLoading = false
      this.response = data;

      if (isBegin) {
        this.isBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
      }
    }, error =>  {
      this.isLoading = false
      this.response = null
      this.notification.error(error.statusText, 'Lấy dữ liệu thất bại')
    });
  }

  navigateToCreate(){
    if(this.typeVpc == 1) {
      this.router.navigate(['/app-smart-cloud/backup-volume/create/vpc']);
    }
    if(this.typeVpc == 0) {
      this.router.navigate(['/app-smart-cloud/backup-volume/create/normal']);
    }
  }

  handleOkDelete() {
    setTimeout(() => {this.getListBackupVolumes(true)}, 2000)
  }

  handleOkUpdate() {
    setTimeout(() => {this.getListBackupVolumes(false)}, 2000)
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    if (!this.region && !this.project) {
      this.router.navigate(['/exception/500']);
    }

    if (this.notificationService.connection == undefined) {
      this.notificationService.initiateSignalrConnection();
    }

    this.notificationService.connection.on('UpdateVolume', (data) => {
      if (data) {
        let volumeId = data.serviceId;

        var foundIndex = this.response.records.findIndex(x => x.id == volumeId);
        if (foundIndex > -1) {
          var record = this.response.records[foundIndex];

          record.status = data.status;
          record.serviceStatus = data.serviceStatus;

          this.response.records[foundIndex] = record;
          this.cdr.detectChanges();
        }
      }
    });

  }

}
