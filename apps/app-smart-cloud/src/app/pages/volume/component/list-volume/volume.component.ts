import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
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
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-volume',
  templateUrl: './volume.component.html',
  styleUrls: ['./volume.component.less']
})

export class VolumeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;

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


  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private volumeService: VolumeService,
              private fb: NonNullableFormBuilder,
              private cdr: ChangeDetectorRef,
              private notificationService: NotificationService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    setTimeout(() => {
      this.getListVolume(true);
    }, 2500);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVPC = project?.type;
    this.isLoading = true;
    setTimeout(() => {
      this.getListVolume(true);
    }, 500);
  }


  onChange(value) {
    console.log('selected', value);

    this.selectedValue = value;
    this.getListVolume(false);
  }

  onInputChange(value) {
    this.value = value.trim();
    setTimeout(() => {
      this.getListVolume(false);
    }, 500);
  }

  get trimmedValue(): string {
    return this.value;
  }

  set trimmedValue(value: string) {
    this.value = value.trim();
  }

  focusOnSearch(event: KeyboardEvent): void {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của Enter nếu cần thiết
    this.trimmedValue = this.trimmedValue.trim(); // Trim khoảng trắng đầu và cuối
    this.performSearch();
  }

  performSearch(): void {
    // Thực hiện tìm kiếm với giá trị đã được trim
    console.log('Searching for:', this.trimmedValue);
    // Thực hiện các hành động tìm kiếm khác
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
        if (isBegin) {
          this.isBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
        }
      }, error => {
        this.isLoading = false;
        this.response = null;
        console.log(error);
        this.notification.error(error.statusText, 'Lấy dữ liệu thất bại');
      });
  }

  navigateToCreateVolume() {
    this.router.navigate(['/app-smart-cloud/volume/create']);
  }


  navigateToCreateVolumeVPC() {
    this.router.navigate(['/app-smart-cloud/volume/vpc/create']);
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

  navigateToCreateScheduleSnapshot() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create']);
  }

  navigateToCreateBackup(idVolume) {
    if (this.typeVPC == 1) {
      this.router.navigate(['/app-smart-cloud/backup-volume/create/vpc', { volumeId: idVolume }]);
    }
    if (this.typeVPC == 0) {
      this.router.navigate(['/app-smart-cloud/backup-volume/create/normal', { volumeId: idVolume }]);
    }


  }

  navigateToCreateScheduleBackup(id) {
    this.router.navigate(['/app-smart-cloud/schedule/backup/create'], {
      queryParams: { type: 'VOLUME', idVolume: id }
    });
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/volume/create']);
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    console.log('project', this.project);
    this.selectedValue = this.options[0].value;
    this.customerId = this.tokenService.get()?.userId;
    this.volumeService.model.subscribe(data => {
      console.log(data);
    });
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

          this.getListVolume(false);
          this.cdr.detectChanges();
        }
      }
    });
  }

}
