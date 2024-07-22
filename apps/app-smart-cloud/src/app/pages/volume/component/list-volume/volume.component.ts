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
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';

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
    { label: this.i18n.fanyi('app.status.error'), value: 'ERROR' },
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

  dataSubjectInputSearch: Subject<any> = new Subject<any>();
  private searchSubscription: Subscription;
  private enterPressed: boolean = false;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private volumeService: VolumeService,
              private fb: NonNullableFormBuilder,
              private cdr: ChangeDetectorRef,
              private notificationService: NotificationService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }


  isFirstVisit: boolean = true;
  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
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
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
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
        this.notification.error(error.statusText, this.i18n.fanyi('app.failData'));
      });
  }

  //dẫn sang tạo volume
  navigateToCreateVolume() {
    if (this.typeVPC == 1) {
      if (this.region === RegionID.ADVANCE) {
        this.router.navigate(['/app-smart-cloud/volume/vpc/create']);
      }else{
        this.router.navigate(['/app-smart-cloud/volume-advance/vpc/create']);
      }
    } else {
      if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/volume-advance/create']);
      }else{
        this.router.navigate(['/app-smart-cloud/volume/create']);
      }
    }

  }

  navigateToDetail(id){
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/volume-advance/detail', id]);
      }else{
        this.router.navigate(['/app-smart-cloud/volume/detail', id]);
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
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create', { volumeId: idVolume }], { queryParams: { snapshotTypeCreate: 0 } });
  }

  //create backup
  navigateToCreateBackup(idVolume) {
    if (this.typeVPC == 1) {
      if (this.region === RegionID.ADVANCE) {
        this.router.navigate(['/app-smart-cloud/backup-volume-advance/create/vpc', { volumeId: idVolume }]);
      }else{
        this.router.navigate(['/app-smart-cloud/backup-volume/create/vpc', { volumeId: idVolume }]);
      }
    } else {
      if (this.region === RegionID.ADVANCE) {
        this.router.navigate(['/app-smart-cloud/backup-volume-advance/create/normal', { volumeId: idVolume }]);
      }else{
        this.router.navigate(['/app-smart-cloud/backup-volume/create/normal', { volumeId: idVolume }]);
      }
    }
  }

  //create schedule backup
  navigateToCreateScheduleBackup(id) {
    if (this.typeVPC == 1) { 
      if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/schedule/backup-advance/create/vpc'], {
        queryParams: { type: 'VOLUME', idVolume: id }
      });
    }else{
      this.router.navigate(['/app-smart-cloud/schedule/backup/create/vpc'], {
        queryParams: { type: 'VOLUME', idVolume: id }
      });
    }
    } else {
      if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/schedule/backup-advance/create'], {
        queryParams: { type: 'VOLUME', idVolume: id }
      });
    }else{
      this.router.navigate(['/app-smart-cloud/schedule/backup/create'], {
        queryParams: { type: 'VOLUME', idVolume: id }
      });
    }
    }
  }

  //create snapshot
  navigateToSnapshot(idVolume: number) {
    if (this.region === RegionID.ADVANCE) {
    this.router.navigate(['/app-smart-cloud/snapshot-advance/create', { volumeId: idVolume }], { queryParams: { navigateType: 0 } });
    }else{
      this.router.navigate(['/app-smart-cloud/snapshot/create', { volumeId: idVolume }], { queryParams: { navigateType: 0 } });
    }
  }

  hasRoleSI: boolean = false;


  getSuspendedReason(suspendedReason: string) {
    switch (suspendedReason) {
      case "CHAMGIAHAN":
        return this.i18n.fanyi('app.status.low-renew')
      case "":
      default:
        break;
    }
  }
  url = window.location.pathname;

  ngOnInit() {
    // Lấy thong tin region & project từ local
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL;
      } else {
        this.region = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.region = RegionID.ADVANCE;
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
