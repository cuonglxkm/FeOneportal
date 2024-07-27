import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { debounceTime, Subject, Subscription } from 'rxjs';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';

@Component({
  selector: 'one-portal-list-backup-volume',
  templateUrl: './list-backup-volume.component.html',
  styleUrls: ['./list-backup-volume.component.less']
})
export class ListBackupVolumeComponent implements OnInit, OnDestroy{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  typeVpc: number;
  isLoading: boolean = false;

  statusSelected = 'all';

  value: string;

  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<BackupVolume[]>;
  isBegin: boolean = false

  status = [
    {label: this.i18n.fanyi('app.status.all'), value: 'all'},
    {label: this.i18n.fanyi('app.status.running'), value: 'available'},
    {label: this.i18n.fanyi('app.status.suspend'), value: 'suspended'},
    { label: this.i18n.fanyi('app.status.error'), value: 'ERROR' },
  ]

  dataSubjectInputSearch: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
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
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    // this.getListBackupVolumes(true)
    // this.getListVolume(true);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
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

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  changeInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.enterPressed = false;
    this.dataSubjectInputSearch.next(value);
  }

  onChangeInputChange() {
    this.searchSubscription = this.dataSubjectInputSearch.pipe(
      debounceTime(700)
    ).subscribe(res => {
      if (!this.enterPressed) {
        this.value = res.trim();
        this.getListBackupVolumes(false);
      }
    });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    const value = (event.target as HTMLInputElement).value;
    this.value = value.trim();
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
    if(this.statusSelected == 'available' ) valueSearch = 'AVAILABLE'
    if(this.statusSelected == 'suspended') valueSearch = 'SUSPENDED'
    if(this.statusSelected == 'ERROR') valueSearch = 'ERROR'
    this.backupVolumeService.getListBackupVolume(this.region, this.project, valueSearch, this.value, this.pageSize, this.pageIndex).subscribe(data => {
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
    if(this.typeVpc != 1) {
      this.router.navigate(['/app-smart-cloud/backup-volume/create/normal']);
    }
  }

  handleOkDelete() {
    setTimeout(() => {this.getListBackupVolumes(true)}, 2000)
  }

  handleOkUpdate() {
    setTimeout(() => {this.getListBackupVolumes(false)}, 2000)
  }

  navigateToRestore(id) {
    if(this.typeVpc == 1) {
      this.router.navigate(['/app-smart-cloud/backup-volume/restore/vpc/' + id])
    } else {
      this.router.navigate(['/app-smart-cloud/backup-volume/restore/' + id])
    }

  }

  getSuspendedReason(suspendedReason: string) {
    switch (suspendedReason) {
      case "CHAMGIAHAN":
        return this.i18n.fanyi('app.status.low-renew')
      case "":
      default:
        break;
    }
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    this.onChangeInputChange();
    if (!this.region && !this.project) {
      this.router.navigate(['/exception/500']);
    }

    this.notificationService.connection.on('UpdateVolumeBackup', (message) => {
      if (message) {
        switch (message.actionType) {
          case "CREATING":
          case "CREATED":
          case "RESIZING":
          case "RESIZED":
          case "EXTENDING":
          case "EXTENDED":
          case "DELETING":
          case "DELETED":
          case "RESTORING":
          case "RESTORED":
            this.getListBackupVolumes(false);
          break;
          }
      }
    });

  }

}
