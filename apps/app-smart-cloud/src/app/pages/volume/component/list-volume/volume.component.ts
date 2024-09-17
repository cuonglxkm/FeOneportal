import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { VolumeDTO } from '../../../../shared/dto/volume.dto';
import { VolumeService } from '../../../../shared/services/volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import {
  BaseResponse,
  NotificationService,
  ProjectModel,
  RegionModel
} from '../../../../../../../../libs/common-utils/src';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { debounceTime, Subject, Subscription } from 'rxjs';
import {
  ProjectSelectDropdownComponent
} from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';
import { ScheduleService } from '../../../../shared/services/schedule.service';
import { BackupSchedule, FormSearchScheduleBackup } from '../../../../shared/models/schedule.model';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { PolicyService } from 'src/app/shared/services/policy.service';
import { PackageSnapshotService } from 'src/app/shared/services/package-snapshot.service';

@Component({
  selector: 'app-volume',
  templateUrl: './volume.component.html',
  styleUrls: ['./volume.component.less']
})

export class VolumeComponent implements OnInit, OnDestroy {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = true;

  selectedValue: string;
  customerId: number;


  value: string;

  options = [
    { label: this.i18n.fanyi('app.status.all'), value: '' },
    { label: this.i18n.fanyi('app.status.running'), value: 'KHOITAO' },
    // { label: this.i18n.fanyi('app.status.error'), value: 'ERROR' },
    { label: this.i18n.fanyi('app.status.suspend'), value: 'SUSPENDED' }
  ];

  pageSize: number = 10;
  pageIndex: number = 1;

  response: BaseResponse<VolumeDTO[]>;

  instanceSelected: any;


  validateForm: FormGroup<{
    nameVolume: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    nameVolume: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9]*$/),
      Validators.maxLength(70)]],
    description: [null as string, [Validators.maxLength(255)]]
  });

  typeVPC: number;

  isBegin: boolean = false;

  dataVolumeExisted: number[] = []

  dataSubjectInputSearch: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;
  isCreateOrder: boolean = false;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private volumeService: VolumeService,
              private fb: NonNullableFormBuilder,
              private cdr: ChangeDetectorRef,
              private notificationService: NotificationService,
              private notification: NzNotificationService,
              private scheduleBackupService: ScheduleService,
              private catalogService: CatalogService,
              private packageSnapshotService: PackageSnapshotService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private policyService: PolicyService) {
  }


  isFirstVisit: boolean = true;

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    setTimeout(() => {
      this.getListVolume(true);
    }, 2500);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.isFirstVisit = false;
    this.project = project?.id;
    this.typeVPC = project?.type;
    this.isLoading = true;
    this.getListVolume(true);
    this.isCreateOrder = this.policyService.hasPermission("order:Create");
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  //Lấy các máy ảo đã có lịch snapshot
  getExistedSnapshotScheduleVolume(){
    this.packageSnapshotService.getExistedSchedule(this.project).subscribe(data => {
      for (let item of data) {
        console.log("data dataInstanceExisted", data)
        if (item.snapshotType == 0) {
          this.dataVolumeExisted.push(item.serviceInstanceId)
        }
      }
      this.cdr.detectChanges()
    })
  }

  // Tìm kiếm theo tên
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
        this.getListVolume(false);
      }
    });
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.enterPressed = true;
    const value = (event.target as HTMLInputElement).value;
    this.value = value.trim();
    this.getListVolume(false);
  }

  //tìm kiếm theo trạng thái
  onChange(value) {
    console.log('selected', value);

    this.selectedValue = value;
    this.getListVolume(false);
  }

  onPageSizeChange(value) {
    this.pageSize = value;
    this.getListVolume(false);
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListVolume(false);
  }

  volumeInstance: string = '';

  //Lấy danh sách volume
  getListVolume(isBegin) {
    this.isLoading = true;
    this.customerId = this.tokenService.get()?.userId;
    this.volumeService.getVolumes(this.customerId, this.project,
      this.region, this.pageSize, this.pageIndex, this.selectedValue, this.value)
      .pipe(debounceTime(500))
      .subscribe(data => {
        if (data) {
          this.isLoading = false;
          this.response = data;
          if ((this.response.records == null || this.response.records.length < 1) && this.pageIndex != 1) {
            this.pageIndex = 1;
            this.getListVolume(false);
          }
          this.response.records.forEach(item => {
            if (item.attachedInstances.length > 0 || item.attachedInstances != null) {
              item.attachedInstances.forEach(item2 => {
                this.volumeInstance += Array.from(item2.instanceName).join('');
              });
            } else {
              this.volumeInstance = '';
            }
          });
        } else {
          this.isLoading = false;
          this.response = null;
        }

        // begin = true: length < 1 => sang trang giới thiệu;
        // begin = false: length < 1 => danh sách trả thông tin "không có dữ liệu"
        if (isBegin) {
          this.isBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
        }
      }, error => {
        this.isLoading = false;
        this.response = null;
        console.log(error);
        if(error.status == 403){
          this.notification.error(
            error.statusText,
            this.i18n.fanyi('app.non.permission')
          );
        } else {
          this.notification.error(error.statusText, this.i18n.fanyi('app.failData'));
        }
      });
  }

  //dẫn sang tạo volume
  navigateToCreateVolume() {
    if (this.typeVPC == 1) {
      if (this.region === RegionID.ADVANCE) {
        this.router.navigate(['/app-smart-cloud/volumes-advance/vpc/create']);
      } else {
        this.router.navigate(['/app-smart-cloud/volumes/vpc/create']);
      }
    } else {
      if (this.region === RegionID.ADVANCE) {
        this.router.navigate(['/app-smart-cloud/volumes-advance/create']);
      } else {
        this.router.navigate(['/app-smart-cloud/volumes/create']);
      }
    }

  }

  navigateToDetail(id) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/volumes-advance/detail', id]);
    } else {
      this.router.navigate(['/app-smart-cloud/volumes/detail', id]);
    }
  }

  navigateToVolume() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/volumes-advance']);
    } else {
      this.router.navigate(['/app-smart-cloud/volumes']);
    }
  }

  //attach
  handleOkAttachVm() {
    // console.log('volume', this.volumeDTO)
    this.getListVolume(false);
  }

  //detach
  handleOkDetachVm() {
    setTimeout(() => {
      this.getListVolume(false);
    }, 1500);
  }

  //delete
  handleOkDelete() {
    this.getListVolume(true);
  }

  //update
  handleOkUpdate() {
    this.getListVolume(false);
  }

  //create schedule snapshot
  navigateToCreateScheduleSnapshot(idVolume: number) {
    if(this.region === RegionID.ADVANCE){
      this.router.navigate(['/app-smart-cloud/schedule/snapshot-advance/create'], { queryParams: { volumeId: idVolume , snapshotTypeCreate: 0 } });
    }else{
      this.router.navigate(['/app-smart-cloud/schedule/snapshot/create'], { queryParams: { volumeId: idVolume , snapshotTypeCreate: 0 } });
    }
  }

  //create backup
  navigateToCreateBackup(idVolume) {
    if (this.typeVPC == 1) {
      if (this.region === RegionID.ADVANCE) {
        this.router.navigate(['/app-smart-cloud/backup-volume-advance/create/vpc', { volumeId: idVolume }]);
      } else {
        this.router.navigate(['/app-smart-cloud/backup-volume/create/vpc'], {
          queryParams: { idVolume: idVolume }
        });
      }
    } else {
      if (this.region === RegionID.ADVANCE) {
        this.router.navigate(['/app-smart-cloud/backup-volume-advance/create/normal', { volumeId: idVolume }]);
      } else {
        this.router.navigate(['/app-smart-cloud/backup-volume/create/normal'], {
          queryParams: { idVolume: idVolume }
        });

      }
    }
  }

  //create schedule backup
  navigateToCreateScheduleBackup(id) {
    this.getListScheduleBackup(id);

  }

  listScheduleBackup: BackupSchedule[] = [];

  getListScheduleBackup(id) {
    this.isLoading = true;
    let formSearch = new FormSearchScheduleBackup();
    formSearch.customerId = this.tokenService.get()?.userId;
    formSearch.scheduleName = '';
    formSearch.scheduleStatus = 'ACTIVE';
    formSearch.regionId = this.region;
    formSearch.projectId = this.project;
    formSearch.serviceType = 2;
    formSearch.pageSize = 99999;
    formSearch.pageIndex = 1;
    formSearch.serviceId = id;
    this.scheduleBackupService.search(formSearch).subscribe(data => {
      this.isLoading = false;
      this.listScheduleBackup = data?.records;
      if (this.listScheduleBackup?.length <= 0) {
        if (this.typeVPC == 1) {
          if (this.region === RegionID.ADVANCE) {
            this.router.navigate(['/app-smart-cloud/schedule/backup-advance/create/vpc'], {
              queryParams: { type: 'VOLUME', idVolume: id }
            });
          } else {
            this.router.navigate(['/app-smart-cloud/schedule/backup/create/vpc'], {
              queryParams: { type: 'VOLUME', idVolume: id }
            });
          }
        } else {
          if (this.region === RegionID.ADVANCE) {
            this.router.navigate(['/app-smart-cloud/schedule/backup-advance/create'], {
              queryParams: { type: 'VOLUME', idVolume: id }
            });
          } else {
            this.router.navigate(['/app-smart-cloud/schedule/backup/create'], {
              queryParams: { type: 'VOLUME', idVolume: id }
            });
          }
        }
      } else {
        if (this.typeVPC == 1) {
          if (this.region === RegionID.ADVANCE) {
            this.router.navigate(['/app-smart-cloud/schedule/backup-advance/create/vpc'], {
              queryParams: { type: 'VOLUME', idVolume: id }
            });
          } else {
            this.listScheduleBackup.forEach(item => {
              console.log('abc', item.serviceId == id);
              if (item.serviceId == id) {
                this.notification.warning('', this.i18n.fanyi('schedule.backup.block.create'));
                this.navigateToVolume();
              } else {
                this.router.navigate(['/app-smart-cloud/schedule/backup/create/vpc'], {
                  queryParams: { type: 'VOLUME', idVolume: id }
                });
              }
            });
          }
        } else {
          if (this.region === RegionID.ADVANCE) {
            this.router.navigate(['/app-smart-cloud/schedule/backup-advance/create'], {
              queryParams: { type: 'VOLUME', idVolume: id }
            });
          } else {
            this.listScheduleBackup.forEach(item => {
              console.log('abc', item.serviceId == id);
              if (item.serviceId == id) {
                this.notification.warning('', this.i18n.fanyi('schedule.backup.block.create'));
                this.navigateToVolume();
              } else {
                this.router.navigate(['/app-smart-cloud/schedule/backup/create'], {
                  queryParams: { type: 'VOLUME', idVolume: id }
                });
              }
            });
          }
        }
      }

    }, error => {
      this.isLoading = false;
      this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.failData'));
    });

  }

  //create snapshot
  navigateToSnapshot(idVolume: number) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/create'],{queryParams:{ volumeId: idVolume, navigateType: 0 }} );
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/create'],{queryParams:{ volumeId: idVolume, navigateType: 0 }} );
      // this.router.navigate(['/app-smart-cloud/snapshot/create', { volumeId: idVolume }], { queryParams: { navigateType: 0 } });
    }
  }

  hasRoleSI: boolean = false;


  getSuspendedReason(suspendedReason: string) {
    switch (suspendedReason) {
      case 'CHAMGIAHAN':
        return this.i18n.fanyi('app.status.low-renew');
      case '':
      default:
        break;
    }
  }

  url = window.location.pathname;
  isVolumeSnapshotHdd: boolean = false;
  isVolumeSnapshotSsd: boolean = false;
  isBackupVolume: boolean = false;
  getCatalog() {
    this.catalogService.getActiveServiceByRegion(['volume-snapshot-hdd','volume-snapshot-ssd', 'backup-volume'], this.region).subscribe(data => {
      console.log('data', data)
      this.isVolumeSnapshotHdd = data.filter(
        (e) => e.productName == 'volume-snapshot-hdd'
      )[0].isActive;
      this.isVolumeSnapshotSsd = data.filter(
        (e) => e.productName == 'volume-snapshot-ssd'
      )[0].isActive;
      this.isBackupVolume = data.filter(
        (e) => e.productName == 'backup-volume'
      )[0].isActive;
      this.cdr.detectChanges();
    })
  }
  isAdvance: boolean

  ngOnInit() {
    // Lấy thong tin region & project từ local
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL;
        this.isAdvance = false
      } else {
        this.region = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.region = RegionID.ADVANCE;
      this.isAdvance = true
    }
    //lấy role
    this.hasRoleSI = localStorage.getItem('role').includes('SI');
    console.log('project', this.project);


    this.selectedValue = this.options[0].value;
    this.customerId = this.tokenService.get()?.userId;
    this.onChangeInputChange();
    this.volumeService.model.subscribe(data => {
      console.log(data);
    });
    if (!this.region && !this.project) {
      this.router.navigate(['/exception/500']);
    }
    this.getCatalog();
    this.getExistedSnapshotScheduleVolume()

    //thông báo signalR tự động reload khi trạng thái thay đổi
    this.notificationService.connection.on('UpdateVolume', (message) => {
      if (message) {
        switch (message.actionType) {
          case 'CREATING':
          case 'CREATED':
          case 'RESIZING':
          case 'RESIZED':
          case 'EXTENDING':
          case 'EXTENDED':
          case 'DELETED':
          case 'DELETING':
            this.getListVolume(true);
            break;
          //case "CREATED":
          // let volumeId = message.serviceId;
          // var foundIndex = this.response.records.findIndex(x => x.id == volumeId);
          // if (foundIndex > -1) {
          //   var record = this.response.records[foundIndex];
          //   record.serviceStatus = message.data?.serviceStatus;
          //   record.createDate = message.data?.creationDate;
          //   record.expirationDate = message.data?.expirationDate;
          //   this.response.records[foundIndex] = record;
          //   this.cdr.detectChanges();
          // }
          // else
          // {
          // this.getListVolume(true);
          //}
          //break;
        }
      }
    });
  }

}
