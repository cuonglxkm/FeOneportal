import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { NzNotificationService } from "ng-zorro-antd/notification";
import { PackageBackupService } from "../../../shared/services/package-backup.service";
import { FormUpdate, PackageBackupModel, ServiceInPackage } from "../../../shared/models/package-backup.model";
import { BaseResponse, ProjectModel, RegionModel } from "../../../../../../../libs/common-utils/src";
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from "@angular/forms";
import { getCurrentRegionAndProject } from "@shared";
import { FormSearchPackageSnapshot, PackageSnapshotModel } from 'src/app/shared/models/package-snapshot.model';
import { PackageSnapshotService } from 'src/app/shared/services/package-snapshot.service';
import { debounceTime, finalize } from 'rxjs';
import { ProjectService } from 'src/app/shared/services/project.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { VolumeService } from '../../../shared/services/volume.service';
import { SnapshotVolumeService } from '../../../shared/services/snapshot-volume.service';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';


@Component({
  selector: 'one-portal-list-packages-snapshot',
  templateUrl: './list-packages-snapshot.component.html',
  styleUrls: ['./list-packages-snapshot.component.less'],
})
export class ListPackagesSnapshotComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  pageSize: number = 10
  pageIndex: number = 1

  isLoading: boolean = false

  value: string = ''
  snapshotId: number
  customerId: number

  packageBackupModel: PackageBackupModel = new PackageBackupModel()
  response: BaseResponse<PackageSnapshotModel[]>


  isVisibleDelete: boolean = false
  isLoadingDelete: boolean = false

  isVisibleUpdate: boolean = false
  isLoadingUpdate: boolean = false

  packageName: string
  selected: any = ''
  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '600px'
  };
  validateForm: FormGroup<{
    namePackage: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    namePackage: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]*$/), Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(255)]]
  })


  valueDelete: string = '';
  isInput: boolean = false;
  projectType = 0;
  typeVPC: number

  isCheckBegin: boolean = false

  formSearchPackageSnapshot: FormSearchPackageSnapshot = new FormSearchPackageSnapshot()
  isBegin: boolean = false;
  dataAction: any;
  isLoadingSnapshot = false;
  snapshotArray: any;
  snapshotSchefuleArray: any[];
  isLoadingSnapshotSchedule = false;
  isUpdateName: boolean = false;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private router: Router,
    private packageSnapshotService: PackageSnapshotService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private notification: NzNotificationService,
    private fb: NonNullableFormBuilder,
    private vlService: VolumeService,
    private snapshotVolumeService: SnapshotVolumeService,
    private projectService: ProjectService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.project = project?.id
    this.getListPackageSnapshot(true)
    this.projectType = project?.type;
    if (project?.type == 1) {
      this.isBegin = true;
    }
  }


  onInputChange(value: string) {
    this.pageIndex = 1;
    this.value = value;
    this.getListPackageSnapshot(false)
  }


  navigateToCreate() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/packages/create'])
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/packages/create'])
    }
  }

  onPageSizeChange(value) {
    this.pageSize = value
    this.getListPackageSnapshot(false)
  }

  onPageIndexChange(value) {
    this.pageIndex = value
    this.getListPackageSnapshot(false)
  }

  onChangeSelected(value) {
    this.selected = value
    if (this.selected === '') {
      this.selected = ''
    }
    this.getListPackageSnapshot(false)
  }

  getListPackageSnapshot(checkBegin: boolean) {
    this.isLoading = true
    this.formSearchPackageSnapshot.projectId = this.project
    this.formSearchPackageSnapshot.regionId = this.region
    this.formSearchPackageSnapshot.packageName = this.value
    this.formSearchPackageSnapshot.pageSize = this.pageSize
    this.formSearchPackageSnapshot.currentPage = this.pageIndex
    this.formSearchPackageSnapshot.status = this.selected
    this.packageSnapshotService.getPackageSnapshot(this.formSearchPackageSnapshot)
      .pipe(debounceTime(500))
      .subscribe(data => {
        this.isLoading = false
        this.response = data
        if (checkBegin) {
          if (data == undefined || data.records.length <= 0) {
            this.isBegin = true;
          } else {
            this.isBegin = false;
          }
        }
      }, error => {
        this.isLoading = false
        this.response = null
      })
  }

  navigateToEdit(id) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/packages/edit/' + id])
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/packages/edit/' + id])
    }
  }


  onInputChangeDelete(value) {
    this.valueDelete = value
  }



  showDelete(data: PackageSnapshotModel) {
    this.isVisibleDelete = true
    this.dataAction = data;
    this.packageName = data.packageName;
    this.loadingSnapshot();
    this.loadingSnapshotSchedule();
  }

  handleDeletedOk() {
    this.isLoadingDelete = true
    if (this.valueDelete === this.packageName) {
      this.isInput = false;
      this.packageSnapshotService.delete(this.dataAction.id, this.project, this.region)
        .pipe(finalize(() => {
          this.handleDeleteCancel();
          this.getListPackageSnapshot(true);
        }))
        .subscribe(data => {
          this.isLoadingDelete = false
          this.isVisibleDelete = false
          this.notification.success('Thành công', 'Xóa gói Snapshot thành công')
          this.valueDelete = ''
          this.getListPackageSnapshot(true)
        }, error => {
          this.isLoadingDelete = false
          this.isVisibleDelete = false
          console.log('error', error)
          this.notification.error('Thất bại', 'Xóa gói snapshot thất bại')
        })
    } else {
      this.isInput = true;
      this.isLoadingDelete = false
      // this.notification.error('Error', 'Vui lòng nhập đúng thông tin')
    }
  }

  handleDeleteCancel() {
    this.isInput = false;
    this.isVisibleDelete = false
    this.dataAction = undefined;
    this.packageName = '';
    this.valueDelete = ''
  }


  handleUpdateCancel() {
    this.isVisibleUpdate = false
  }

  url = window.location.pathname;
  ngOnInit() {
    this.customerId = this.tokenService.get()?.userId
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    if (!this.url.includes('advance')) {
      if (Number(localStorage.getItem('regionId')) === RegionID.ADVANCE) {
        this.region = RegionID.NORMAL;
      } else {
        this.region = Number(localStorage.getItem('regionId'));
      }
    } else {
      this.region = RegionID.ADVANCE;
    }
  }

  navigateToPackageDetail(id) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([`/app-smart-cloud/snapshot-advance/packages/detail/`, id])
    } else {
      this.router.navigate([`/app-smart-cloud/snapshot/packages/detail/`, id])
    }
  }

  showUpdate(data: PackageSnapshotModel) {
    this.dataAction = data;
    this.validateForm.controls['namePackage'].setValue(data.packageName);
    this.validateForm.controls['description'].setValue(data.description);

    this.isVisibleUpdate = true;
  }

  handleUpdateOk() {
    this.isLoadingUpdate = true;
    const description = this.validateForm.controls['description'].value || '';
    let data = {
      newPackageName: this.validateForm.controls['namePackage'].value,
      id: this.dataAction.id,
      description: description,
      regionId: this.region,

    }
    console.log("dâtta name", data)
    this.packageSnapshotService.update(this.validateForm.controls['description'].value, this.validateForm.controls['namePackage'].value, this.dataAction.id, this.region, data)

      .pipe(finalize(() => {
        this.handleUpdateCancel();
        this.isLoadingUpdate = false;
      }))
      .subscribe(
        data => {
          console.log("daaaaa", data)
          this.notification.success(this.i18n.fanyi('app.status.success'), 'Cập nhật gói snapshot thành công')
          this.getListPackageSnapshot(true);
        },
        error => {
          this.notification.error(this.i18n.fanyi('app.status.fail'), error.error.message)
        }
      )
  }

  private loadingSnapshot() {
    this.isLoadingSnapshot = true;
    this.vlService.serchSnapshot(999999, 1, this.region, this.project, '', '', this.dataAction.id)
      .pipe(finalize(() => {
        this.isLoadingSnapshot = false;
      }))
      .subscribe(
        data => {
          this.snapshotArray = data.records;
          console.log("snapshotArray", this.snapshotArray)
        }
      );
  }

  private loadingSnapshotSchedule() {
    this.isLoadingSnapshotSchedule = true;
    this.snapshotVolumeService.getListSchedule(99999, 1, this.region, this.project, '', '', this.dataAction.id)
      .pipe(finalize(() => {
        this.isLoadingSnapshotSchedule = false;
      }))
      .subscribe({
        next: (next) => {
          this.snapshotSchefuleArray = next.records;
          console.log("snapshotSchefuleArray", this.snapshotSchefuleArray)
        },
        error: (error) => {
          this.notification.error(
            'Có lỗi xảy ra',
            'Lấy danh sách lịch Snapshot thất bại'
          );
        },
      });
  }

  getSuspendedReason(suspendedReason: any) {
    switch (suspendedReason) {
      case "CHAMGIAHAN":
        return this.i18n.fanyi('app.status.low-renew')
      case "VIPHAMDIEUKHOAN":
        return this.i18n.fanyi('service.status.violation')
      default:
        break;
    }
  }
  isProcessingStatus(status: string): boolean {
    const processingStatuses = [
      'DELETING',
      'CREATING',
      'EXTENDING',
      'RESIZING',
      'ERROR_DELETING',
      'PROCESSING'
    ];
    return processingStatuses.includes(status);
  }
}
