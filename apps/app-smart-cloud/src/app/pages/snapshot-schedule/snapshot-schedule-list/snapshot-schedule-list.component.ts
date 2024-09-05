import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SnapshotVolumeService } from '../../../shared/services/snapshot-volume.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { FormSearchScheduleSnapshot, ScheduleSnapshotVL } from 'src/app/shared/models/snapshotvl.model';
import { getCurrentRegionAndProject } from '@shared';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { debounceTime, finalize, Subject } from 'rxjs';
import { TimeCommon } from '../../../shared/utils/common';
import { size } from 'lodash';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { time } from 'echarts';
import { DatePipe } from '@angular/common';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';
import { PolicyService } from 'src/app/shared/services/policy.service';

@Component({
  selector: 'one-portal-list-schedule-snapshot',
  templateUrl: './snapshot-schedule-list.component.html',
  styleUrls: ['./snapshot-schedule-list.component.less']
})
export class SnapshotScheduleListComponent implements OnInit {
  region: number;
  project: number;

  searchStatus: string = '';
  // searchStatus: string[] = [];
  searchName: string = '';

  validateForm: FormGroup<{
    name: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[\w\d]{1,64}$/)]],
    description: ['', [Validators.maxLength(255)]]
  })
  formSearchScheduleSnapshot: FormSearchScheduleSnapshot = new FormSearchScheduleSnapshot()
  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '600px'
  };

  // status = [
  //   { label: 'Tất cả trạng thái', value: '' },
  //   { label: 'Gián đoạn', value: 'DISABLED' },
  //   { label: 'Đang hoat động', value: 'ACTIVE' }

  // ];

  pageSize: number = 10;
  pageNumber: number = 1;
  listOfData: ScheduleSnapshotVL[];
  totalData: number;
  isLoadingEntities: boolean = true;
  customerId: number;

  actionSelected: number;
  isBegin = false;
  searchDelay = new Subject<boolean>();
  response: any;
  isVisibleDelete = false;
  dataAction: any;
  nameDelete: any;
  disableDelete = true;
  loadingDelete = false;

  isVisibleRestart:boolean = false;
  loadingRestart: any;
  isCreateOrder: boolean = false;
  scheduleName:string;
  isInput: boolean = false;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  searchSnapshotScheduleList(checkBegin: any) {
    this.getSnapSchedules(checkBegin);
  }

  // private doGetSnapSchedules(pageSize: number, pageNumber: number, regionId: number, projectId: number, name: string, volumeName: string, checkBegin: boolean) {
  //   this.isLoadingEntities = true;
  //   this.listOfData = [];
  //   this.snapshot.getListSchedule(pageSize, pageNumber, regionId, projectId, name, volumeName, '')
  //     .subscribe({
  //       next: (next) => {
  //         this.response = next;
  //         this.totalData = next.totalCount;
  //         this.listOfData = next.records;
  //         this.isLoadingEntities = false;
  //         console.log("this.response?.records", this.response?.records)
  //         if (checkBegin) {
  //           if (this.response?.records == undefined || this.response?.records.length == 0) {
  //             this.isBegin = true;
  //           } else {
  //             this.isBegin = false;
  //           }
  //         }
  //       },
  //       error: (error) => {
  //         if (error.status == 403) {
  //           this.notification.error(
  //             error.statusText,
  //             this.i18n.fanyi('app.non.permission')
  //           );
  //         } else {
  //           this.notification.error(
  //             'Có lỗi xảy ra',
  //             'Lấy danh sách lịch Snapshot thất bại'
  //           );
  //         }
  //         this.isLoadingEntities = false;
  //       }
  //     });
  // }

  constructor(
    private router: Router,
    private datepipe: DatePipe,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private snapshot: SnapshotVolumeService,
    private modalService: NzModalService,
    private snapshotVolumeService: SnapshotVolumeService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fb: NonNullableFormBuilder,
    private notification: NzNotificationService,
    private policyService: PolicyService,
    private cdr: ChangeDetectorRef
  ) {
  }
  url = window.location.pathname;
  ngOnInit(): void {
    this.customerId = this.tokenService.get()?.userId;
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
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe((checkBegin: boolean) => {
      this.searchSnapshotScheduleList(checkBegin);
    });
    this.VMsnap = this.i18n.fanyi('app.vm.snapshot')
  }

  // private doGetSnapSchedules(pageSize: number, pageNumber: number, regionId: number, projectId: number, name: string, volumeName: string, checkBegin: boolean) {
  //   this.isLoadingEntities = true;
  //   this.listOfData = [];
  //   this.snapshot.getListSchedule(pageSize, pageNumber, regionId, projectId, name, volumeName, '')
  //     .subscribe({
  //       next: (next) => {
  //         this.response = next;
  //         this.totalData = next.totalCount;
  //         this.listOfData = next.records;
  //         this.isLoadingEntities = false;
  //         console.log("this.response?.records", this.response?.records)
  //         if (checkBegin) {
  //           if (this.response?.records == undefined || this.response?.records.length == 0) {
  //             this.isBegin = true;
  //           } else {
  //             this.isBegin = false;
  //           }
  //         }
  //       },
  //       error: (error) => {
  //         if (error.status == 403) {
  //           this.notification.error(
  //             error.statusText,
  //             this.i18n.fanyi('app.non.permission')
  //           );
  //         } else {
  //           this.notification.error(
  //             'Có lỗi xảy ra',
  //             'Lấy danh sách lịch Snapshot thất bại'
  //           );
  //         }
  //         this.isLoadingEntities = false;
  //       }
  //     });
  // }

  // call api get list snapshot schedule
  private getSnapSchedules(checkBegin: boolean) {
    this.isLoadingEntities = true;
    this.listOfData = [];
    this.formSearchScheduleSnapshot.projectId = this.project
    this.formSearchScheduleSnapshot.regionId = this.region
    this.formSearchScheduleSnapshot.pageSize = this.pageSize
    this.formSearchScheduleSnapshot.pageNumber = this.pageNumber
    this.formSearchScheduleSnapshot.name = this.searchName
    this.formSearchScheduleSnapshot.state = this.searchStatus
    this.formSearchScheduleSnapshot.volumeName = ''
    this.formSearchScheduleSnapshot.ssPackageId = ''
    this.snapshot.getListSchedule(this.formSearchScheduleSnapshot)
      .subscribe({
        next: (next) => {
          this.response = next;
          this.totalData = next.totalCount;
          this.listOfData = next.records;
          this.isLoadingEntities = false;
          console.log("this.response?.records", this.response?.records)
          if (checkBegin) {
            if (this.response?.records == undefined || this.response?.records.length <= 0) {
              this.isBegin = true;
            } else {
              this.isBegin = false;
            }
          }
        },
        error: (error) => {
          if (error.status == 403) {
            this.notification.error(
              error.statusText,
              this.i18n.fanyi('app.non.permission')
            );
          } else {
            this.notification.error(
              'Có lỗi xảy ra',
              'Lấy danh sách lịch Snapshot thất bại'
            );
          }
          this.isLoadingEntities = false;
        }
      });
  }
  // search theo ten snapshot schedule
  onInputChange(value: string) {
    this.pageNumber = 1;
    this.searchName = value;
    this.getSnapSchedules(false)
  }
  // search theo status snapshot schedule
  onChangeStatus(value) {
   
    this.searchStatus = value
    console.log(" this.searchStatus", this.searchStatus)
    if (value === '') {
      this.searchStatus = '';
    }
    this.getSnapSchedules(false)
  }
  

  getDisplayText(): string {
    // Nếu mảng rỗng, hiển thị "Tất cả trạng thái"
    if (this.searchStatus.length === 0) {
      return 'Tất cả trạng thái';
    }
  
    // Nếu không, hiển thị giá trị đầu tiên trong mảng (có thể bạn chỉ lưu 1 giá trị trong mảng này)
    return this.searchStatus[0];  // Hiển thị dưới dạng chuỗi phân cách bởi dấu phẩy
  }


  navigateToPackageDetail(id) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([`/app-smart-cloud/snapshot-advance/packages/detail/`, id])
    } else {
      this.router.navigate([`/app-smart-cloud/snapshot/packages/detail/`, id])
    }
  }

  navigateToUpdate(id: number) {
    console.log(id);
  }

  showModalSuppend(id: number) {
    console.log(id);
  }

  // showModalDelete(id: number) {
  //   console.log(id);
  // }

  showDelete(data: ScheduleSnapshotVL) {
    this.isVisibleDelete = true
    this.dataAction = data;
    this.scheduleName = data.name;
    console.log(" this.scheduleName", this.scheduleName)
    // this.loadingSnapshot();
    // this.loadingSnapshotSchedule();
  }


  enableDelete(data: any) {
    this.isVisibleDelete = true;
    this.dataAction = data;

   
  }

  // DeleteSchedule() {
  //   this.loadingDelete = true;
  //   this.snapshotVolumeService.deleteSnapshotSchedule(this.dataAction.id, this.customerId, this.region, this.project)
  //     .pipe(finalize(() => {
  //       this.loadingDelete = false;
  //       this.handleCancel();
  //       this.getSnapSchedules(true)
  //     }))
  //     .subscribe((result: any) => {
  //       if (result == true) {
  //         this.notification.success('', 'Xóa lịch Snapshot thành công');
  //         this.getSnapSchedules(true)
  //         // this.getSnapSchedules(this.pageSize, this.pageNumber, this.region, this.project, this.searchName, '', true);
  //       } else {
  //         this.notification.error(
  //           '',
  //           'Xóa lịch Snapshot không thành công'
  //         );
  //       }
  //     });
  // }
  DeleteSchedule() {
    this.loadingDelete = true;
    if (this.nameDelete === this.scheduleName) {
      this.isInput = false;
      
      this.snapshotVolumeService.deleteSnapshotSchedule(this.dataAction.id, this.customerId, this.region, this.project)
        .pipe(finalize(() => {
         
          this.handleCancel();
          this.getSnapSchedules(true)
        }))
        .subscribe((data: any) => {
          this.loadingDelete = false
          this.isVisibleDelete = false
          this.notification.success('Thành công', 'Xóa lịch Snapshot thành công');
          this.nameDelete = ''
          this.getSnapSchedules(true)
  
        }, error => {
          this.isVisibleDelete = false
          this.isVisibleDelete = false
          this.notification.error('Thất bại', 'Xóa lịch Snapshot thất bại')
        });
    }
    else {
      this.isInput = true;
      this.loadingDelete = false
      // this.notification.error('Error', 'Vui lòng nhập đúng thông tin')
    }
  }
  confirmNameDelete(nameDelete) {
    this.nameDelete = nameDelete
  }

  navigateToDetail(id: number) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot-advance/detail/' + id]);
    } else {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot/detail/' + id]);
    }
  }

  navigateToEdit(id: number) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot-advance/edit/' + id]);
    } else {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot/edit/' + id]);
    }
  }

  navigateToCreate() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot-advance/create'],{queryParams: {  snapshotTypeCreate: 2 }});
    } else {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot/create'],{queryParams: {  snapshotTypeCreate: 2 }});
    }
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  onProjectChange(project: ProjectModel) {
    this.project = project?.id;
    this.searchSnapshotScheduleList(true);
    this.isCreateOrder = this.policyService.hasPermission("snapshotpackage:ListSnapshotPackage") &&
      this.policyService.hasPermission("volumesnapshotschedule:Get") &&
      this.policyService.hasPermission("volume:List") &&
      this.policyService.hasPermission("instance:List") &&
      this.policyService.hasPermission("volumesnapshotschedule:Create");
  }

  onPageSizeChange($event: number) {
    this.pageSize = $event;
    this.searchSnapshotScheduleList(false);
  }

  onPageIndexChange($event: number) {
    this.pageNumber = $event;
    this.searchSnapshotScheduleList(false);
  }

  enableEdit(data: any) {
    this.dataAction = data;
    this.isVisibleUpdate = true;
    this.validateForm.controls['name'].setValue(data.name)
    this.validateForm.controls['description'].setValue(data.description)
    this.time = data.nextRuntime;
  }

  enableRestart(data: any) {

    // this.isVisibleRestart = true;
    // this.dataAction = data;

    this.snapshotVolumeService.checkValidSchedule(data.id)
    .pipe(finalize(() => {}))
    .subscribe(
      result => {
        if(result.success){
          this.isVisibleRestart = true;
          this.dataAction = data;
        }
        else{
          this.notification.error(this.i18n.fanyi('app.status.fail'), result.message);
        }
      },
      error => {
        this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.message);
      });
  }

  handleCancel() {
    this.nameDelete='';
    this.isVisibleDelete = false;
    this.isVisibleRestart = false;
    this.isVisibleUpdate = false;
  }

  // confirmNameDelete($event: any) {
  //   if ($event == this.dataAction.name) {
  //     this.disableDelete = false;
  //   } else {
  //     this.disableDelete = true;
  //   }
  // }


  openIpDeleteCf() {
    if (this.disableDelete == false) {
      this.DeleteSchedule();
    }
  }

  restartSnapshot() {
    this.loadingRestart = true;
    this.snapshotVolumeService.actionSchedule(this.dataAction.id,
      'restore',
      this.customerId,
      this.region,
      this.project)
      .pipe(finalize(() => {
        this.loadingRestart = false;
        this.handleCancel();
      }))
      .subscribe(
        result => {
          this.notification.success(this.i18n.fanyi('app.status.success'), 'Khôi phục lịch Snapshot thành công');
          this.getSnapSchedules(true)
          // this.getSnapSchedules(this.pageSize, this.pageNumber, this.region, this.project, this.searchName, '', true);

        },
        error => {
          this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.message);
        });
  }

  isVisibleUpdate = false;
  isLoadingUpdate = false;

  handleUpdateOk() {
    if (this.validateForm.valid) {
      this.isLoadingUpdate = true;
      let data = {
        id: this.dataAction.id,
        mode: 1,
        projectId: this.project,
        regionId: this.region,
        name: this.validateForm.controls['name'].value,
        description: this.validateForm.controls['description'].value,
        runtime: this.datepipe.transform(
          this.time,
          'yyyy-MM-ddTHH:mm:ss',
          'vi-VI'
        ),
      }
      this.snapshotVolumeService.editSnapshotSchedule(data)
        .pipe(finalize(() => {
          this.isLoadingUpdate = false;
          this.handleCancel();
        }))
        .subscribe(
          data => {
            this.notification.success(this.i18n.fanyi('app.status.success'), 'Sửa lịch Snapshot thành công');
            this.searchSnapshotScheduleList(true);
          },
          error => {
            this.notification.error(this.i18n.fanyi('app.status.fail'),  error.error.message);
          }
        )
    }
    else {
      this.validateForm.markAllAsTouched();
    }
  }

  time: any;
  VMsnap: string;

  getSuspendedReason(warningMessage: any) {
    switch (warningMessage) {
      case "CHAMGIAHAN":
        return this.i18n.fanyi('app.status.low-renew')
      case "VIPHAMDIEUKHOAN":
        return this.i18n.fanyi('service.status.violation')
      default:
        break;
    }
  }
  // checkValidSchedule(data:any){
  //   this.snapshotVolumeService.checkValidSchedule(this.dataAction.id)
  //     .pipe(finalize(() => {
  //       this.loadingRestart = false;
  //       this.handleCancel();
  //     }))
  //     .subscribe(
  //       result => {
  //         this.isVisibleRestart = true;
  //   this.dataAction = data;
  //         // this.enableRestart();
  //         // this.notification.success(this.i18n.fanyi('app.status.success'), 'Khôi phục lịch Snapshot thành công');
  //         // this.getSnapSchedules(true)
  //         // this.getSnapSchedules(this.pageSize, this.pageNumber, this.region, this.project, this.searchName, '', true);

  //       },
  //       error => {
  //         this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.message);
  //       });
  // }
}
