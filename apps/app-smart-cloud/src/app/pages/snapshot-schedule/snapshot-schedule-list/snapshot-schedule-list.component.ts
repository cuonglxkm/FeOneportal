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
import { AbstractControl, FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
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
  projectType: number;
  projectName: string;
  packageName: string;
  snapshotPackageId: number;

  searchStatus: string = '';
  // searchStatus: string[] = [];
  searchName: string = '';

  validateForm: FormGroup<{
    name: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[\w\d]{1,64}$/), this.duplicateNameValidator.bind(this)]],
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

  isVisibleRestart: boolean = false;
  loadingRestart: any;
  isCreateOrder: boolean = false;
  scheduleName: string;
  isInput: boolean = false;
  titleBreadcrumb: string;
  breadcrumbBlockStorage: string;
  nameList: string[] = [];


  isVisibleUpdate = false;
  isLoadingUpdate = false;

  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  searchSnapshotScheduleList(checkBegin: any) {
    this.getSnapSchedules(checkBegin);
  }

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
      this.titleBreadcrumb = 'Dịch vụ hạ tầng'
      this.breadcrumbBlockStorage = 'Block Storage'
    } else {
      this.region = RegionID.ADVANCE;
      this.titleBreadcrumb = 'Dịch vụ nâng cao'
      this.breadcrumbBlockStorage = 'Block Storage nâng cao'
    }
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe((checkBegin: boolean) => {
      this.searchSnapshotScheduleList(checkBegin);
    });
    this.VMsnap = this.i18n.fanyi('app.vm.snapshot')
    this.getSnapSchedules(true)
  }
  // check trùng tên trong ds khi nhập tên
  duplicateNameValidator(control) {
    console.log("controllll", control)
    const value = control.value;
    if (!this.dataAction || value == this.dataAction.name) {
      return null;
    }
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true };
    }
    else {
      return null;
    }
  }

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
      .pipe(finalize(() => {
        this.isLoadingEntities = false;
      }))
      .subscribe({
        next: (next) => {
          this.response = next;
          this.totalData = next.totalCount;
          this.listOfData = next.records;
          this.isLoadingEntities = false;
          next.records.forEach((item) => {
            if (this.nameList.length > 0) {
              this.nameList.push(item.name);
            } else {
              this.nameList = [item.name];
            }
          });

          if (checkBegin) {
            if (this.response?.records == undefined || this.response?.records.length <= 0) {
              this.isBegin = true;
            } else {
              this.isBegin = false;
            }
          }
        },
        error: (error) => {
          this.nameList = null;
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
  // navigate to detail package snapshot
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
// Xoá lịch snapshot
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
      this.router.navigate(['/app-smart-cloud/schedule/snapshot-advance/create'], { queryParams: { snapshotTypeCreate: 2 } });
    } else {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot/create'], { queryParams: { snapshotTypeCreate: 2 } });
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
    this.projectType = project?.type;
    this.projectName = project?.projectName
    console.log("uu", project)
    this.searchSnapshotScheduleList(true);
    this.isCreateOrder = this.policyService.hasPermission("snapshotpackage:ListSnapshotPackage") &&
      this.policyService.hasPermission("snapshotpackage:GetBackupPacket") &&
      this.policyService.hasPermission("volumesnapshotschedule:Get") &&
      this.policyService.hasPermission("volumesnapshotschedule:Search") &&
      this.policyService.hasPermission("volume:List") &&
      this.policyService.hasPermission("instance:List") &&
      this.policyService.hasPermission("volume:Get") &&
      this.policyService.hasPermission("instance:Get") &&
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


  isEnableRestart: boolean = false
  isEnableRestartVpc: boolean = false

  restartId: number;


  handleCancel() {
    this.nameDelete = '';
    this.isVisibleDelete = false;
    this.isVisibleRestart = false;
    this.isVisibleUpdate = false;
    this.isInput = false;

  }
  openIpDeleteCf() {
    if (this.disableDelete == false) {
      this.DeleteSchedule();
    }
  }
  // mở popup khôi phục lịch snapshot
  enableRestart(data: any) {
    // if(this.projectType !=1){
    console.log("restart", data)
    this.packageName = data.packageName
    this.snapshotPackageId = data.snapshotPackageId;
    this.restartId = data.id
    this.isVisibleRestart = true;

  }
  // khôi phục lịch snapshot
  restartSnapshot() {
    this.loadingRestart = true;
    console.log("this.dataAction?.id", this.dataAction?.id)
    this.snapshotVolumeService.actionSchedule(this.restartId,
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
        },
        error => {
          this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.message);
        });
  }

  // mở form sửa lịch
  enableEdit(data: any) {
    this.dataAction = data;
    this.isVisibleUpdate = true;
    this.validateForm.controls['name'].setValue(data.name)
    this.validateForm.controls['description'].setValue(data.description)
    this.time = data.nextRuntime;
  }
  // call api sửa tên, mô tả, giờ lịch snapshot
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
            this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.message);
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

  // navigateToBreadcrumb
  navigateToBreadcrumb() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot-advance']);
    } else {
      this.router.navigate(['/app-smart-cloud/schedule/snapshot']);
    }
  }
}
