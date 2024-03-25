import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VolumeDTO } from '../../../../shared/dto/volume.dto';
import { VolumeService } from '../../../../shared/services/volume.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { getCurrentRegionAndProject } from '@shared';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-volume',
  templateUrl: './volume.component.html',
  styleUrls: ['./volume.component.less']
})

export class VolumeComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;

  selectedValue: string = '';
  customerId: number;


  value: string;

  options = [
    { label: 'Tất cả trạng thái', value: null },
    { label: 'Đang hoạt động', value: 'KHOITAO' },
    { label: 'Lỗi', value: 'ERROR' },
    { label: 'Tạm ngừng', value: 'SUSPENDED' }
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
              private notification: NzNotificationService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    // this.getListVolume(true)
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVPC = project?.type;
    this.isLoading = true;
    this.getListVolume(true);
  }


  onChange(value) {
    console.log('selected', value);
    this.selectedValue = value;
    this.getListVolume(false);
  }

  onInputChange(value) {
    this.value = value;
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

  getListVolume(isBegin) {
    this.isLoading = true;
    this.customerId = this.tokenService.get()?.userId;

    this.volumeService.getVolumes(this.customerId, this.project,
      this.region, this.pageSize, this.pageIndex, this.selectedValue, this.value)
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
      });
  }

  navigateToCreateVolume() {
    this.router.navigate(['/app-smart-cloud/volume/create']);
  }

  // navigateToCreateBackupVolume(id: number, startDate: Date, endDate: Date, nameVolume: string) {
  //   this.router.navigate(['/app-smart-cloud/backup-volume/create'], {
  //     queryParams: {
  //       idVolume: id,
  //       startDate: startDate,
  //       endDate: endDate,
  //       nameVolume: nameVolume
  //     }
  //   });
  // }

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
    this.getListVolume(false);
  }

  handleOkDelete() {
    this.getListVolume(false);
  }

  //update
  handleOkUpdate() {
    this.getListVolume(false);
  }

  navigateToCreateScheduleSnapshot() {
    this.router.navigate(['/app-smart-cloud/schedule/snapshot/create']);
  }

  navigateToCreateBackup(id, createdDate, endDate, name) {
    this.router.navigate(['/app-smart-cloud/backup-volume/create'], {
      queryParams: { idVolume: id, startDate: createdDate, endDate: endDate, nameVolume: name }
    });

  }

  navigateToCreateScheduleBackup() {
    this.router.navigate(['/app-smart-cloud/schedule/backup/create']);
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/volume/create'])
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    console.log('project', this.project);
    this.customerId = this.tokenService.get()?.userId;
    this.volumeService.model.subscribe(data => {
      console.log(data);
    });
    // this.getListVm()
    // this.getListVolume(true)
    if (this.notificationService.connection == undefined) {
      this.notificationService.initiateSignalrConnection();
      this.notificationService.connection.on('UpdateVolume', (data) => {
        if (data) {
          console.log(data);

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

}
