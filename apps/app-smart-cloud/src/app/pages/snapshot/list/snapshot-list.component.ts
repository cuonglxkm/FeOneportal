import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { getCurrentRegionAndProject } from '@shared';
import { debounceTime, finalize, Subject } from 'rxjs';
import { TimeCommon } from '../../../shared/utils/common';
import { Router } from '@angular/router';
import { VolumeService } from '../../../shared/services/volume.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { data } from 'vis-network';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';
import { PolicyService } from 'src/app/shared/services/policy.service';

@Component({
  selector: 'one-portal-snapshot-list',
  templateUrl: './snapshot-list.component.html',
  styleUrls: ['./snapshot-list.component.less'],
})
export class SnapshotListComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));
  isBegin = false;
  value: string = '';
  searchDelay = new Subject<boolean>();
  isLoading = true;
  index = 1;
  size = 10;
  response: any;
  status: any = '';
  listStatus = [
    { label: this.i18n.fanyi('app.status.all'), value: '' },
    { label: this.i18n.fanyi('service.status.active'), value: 'KHOITAO' },
    { label: this.i18n.fanyi('app.suspend'), value: 'TAMNGUNG' },

  ];
  isVisibleDelete = false;
  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '600px',
  };
  validateForm: FormGroup<{
    name: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required,
    Validators.pattern(/^[a-zA-Z0-9_]*$/),
    Validators.maxLength(50), this.duplicateNameValidator.bind(this)]],
    description: ['', Validators.maxLength(255)],
  });

  typeVpc: number;

  dataSelected: any;
  nameDelete = '';
  isInput: boolean = false;
  disableDelete = true;
  loadingDelete = false;
  isVisibleEdit: boolean;
  isCreateOrder: boolean = false;
  titleBreadcrumb: string;
  breadcrumbBlockStorage: string;
  projectType: number;
  nameList: string[] = [];

  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;

  constructor(private router: Router,
    private fb: NonNullableFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private notification: NzNotificationService,
    private service: VolumeService,
    private policyService: PolicyService) {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
  }
  url = window.location.pathname;
  ngOnInit() {
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
    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {
      this.search(false);
    });
    this.search(true);
  }
  // validate name khi nhap trung
  duplicateNameValidator(control) {
    const value = control.value;
    if (!this.dataSelected || value == this.dataSelected.name) {
      return null;
    }
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true };
    } else {
      return null;
    }
  }
  regionChanged(region: RegionModel) {
    if (this.projectCombobox) {
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.region = region.regionId;
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    console.log("mm", project)
    this.project = project?.id;
    this.projectType = project?.type;
    this.search(true);
    this.typeVpc = project?.type;
    this.isCreateOrder = this.policyService.hasPermission("snapshotpackage:ListSnapshotPackage") &&
      this.policyService.hasPermission("volume:List") &&
      this.policyService.hasPermission("instance:List") &&
      this.policyService.hasPermission("volumesnapshot:Create");
  }

  navigateToCreate() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/snapshot-advance/create'], {
        queryParams: {
          navigateType: 2
        }
      })
    } else {
      this.router.navigate(['/app-smart-cloud/snapshot/create'], {
        queryParams: {
          navigateType: 2
        }
      })
    }
  }

  navigateToDetail(id) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([`/app-smart-cloud/snapshot-advance/detail`, id])
    } else {
      this.router.navigate([`/app-smart-cloud/snapshot/detail`, id])
    }
  }

  navigateToPackageDetail(id) {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate([`/app-smart-cloud/snapshot-advance/packages/detail/`, id])
    } else {
      this.router.navigate([`/app-smart-cloud/snapshot/packages/detail/`, id])
    }
  }

  search(isBegin: boolean) {
    this.isLoading = true;
    this.service.serchSnapshot(this.size, this.index, this.region, this.project, this.value, this.status, '')
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(
        data => {
          data.records.forEach((item) => {
            if (this.nameList.length > 0) {
              this.nameList.push(item.name);
            } else {
              this.nameList = [item.name];
            }
          });
          // this.index = 1
          this.response = data
          if (isBegin) {
            if (this.response.records.length <= 0) {
              this.isBegin = true;

            } else {
              this.isBegin = false;

            }
          }
        }, error => {
          this.nameList = null;
          if (error.status == 403) {
            this.notification.error(
              error.statusText,
              this.i18n.fanyi('app.non.permission')
            );
          }
        }
      );
  }

  onInputChange(value: string) {
    this.index = 1;
    this.value = value;
    this.search(false)
  }

  onPageIndexChange($event: number) {
    this.index = $event;
    this.search(false)
  }

  onPageSizeChange($event: number) {
    this.size = $event;
    this.search(false)

  }


  navigateToCreateVolumeVM(idSnapshot, type: any) {
    if (type == 0) {
      if (this.typeVpc == 1) {
        if (this.region === RegionID.ADVANCE) {
          this.router.navigate(['/app-smart-cloud/volumes-advance/vpc/create', { idSnapshot: idSnapshot }])
        } else {
          this.router.navigate(['/app-smart-cloud/volumes/vpc/create', { idSnapshot: idSnapshot }])
        }
      } else {
        if (this.region === RegionID.ADVANCE) {
          this.router.navigate(['/app-smart-cloud/volumes-advance/create', { idSnapshot: idSnapshot }])
        } else {
          this.router.navigate(['/app-smart-cloud/volumes/create', { idSnapshot: idSnapshot }])
        }
      }
    } else if (type == 1) {
      if (this.typeVpc == 1) {
        if (this.region === RegionID.ADVANCE) {
          this.router.navigate(['/app-smart-cloud/instances-advance/instances-create-vpc', { idSnapshot: idSnapshot }])
        } else {
          this.router.navigate(['/app-smart-cloud/instances/instances-create-vpc', { idSnapshot: idSnapshot }])
        }

      } else {
        if (this.region === RegionID.ADVANCE) {
          this.router.navigate(['/app-smart-cloud/instances-advance/instances-create', { idSnapshot: idSnapshot }])
        } else {
          this.router.navigate(['/app-smart-cloud/instances/instances-create', { idSnapshot: idSnapshot }])
        }
      }
    }
  }

  handleCancel() {
    this.isVisibleDelete = false;
    this.isVisibleEdit = false;
    this.nameDelete = '';
    this.dataSelected = null;
    this.isInput = false;
    console.log(" this.isInput = false;", this.isInput)
  }

  enableDelete(data: any) {
    this.dataSelected = data;
    this.isVisibleDelete = true;
  }

  openIpDeleteCf() {
    if (this.disableDelete == false) {
      this.openIpDelete();
    }
  }

  confirmNameDelete($event: any) {
    if ($event == this.dataSelected.name) {
      this.disableDelete = false;
    } else {
      this.disableDelete = true;
    }
  }

  openIpDelete() {
    this.loadingDelete = true;
    if (this.nameDelete === this.dataSelected.name) {
      this.isInput = false;
      this.service.deleteSnapshot(this.dataSelected.id)
        .pipe(finalize(() => {
          this.loadingDelete = false;
          this.handleCancel();
        }))
        .subscribe(
          data => {
            this.notification.success(this.i18n.fanyi('app.status.success'), 'Xóa Snapshot thành công');
            this.search(true);
          },
          error => {
            this.notification.error(this.i18n.fanyi('app.status.fail'), 'Xóa Snapshot thất bại');
          }
        )
    } else {
      this.isInput = true;
      this.loadingDelete = false;
    }

  }

  enableEdit(data: any) {
    this.dataSelected = data;
    this.isVisibleEdit = true;
    this.validateForm.controls['name'].setValue(data.name);
    this.validateForm.controls['description'].setValue(data.description);
  }

  updateSnapshot() {
    if (this.validateForm.valid) {
      this.loadingDelete = true;
      const data = {
        id: this.dataSelected.id,
        name: this.validateForm.controls['name'].value,
        description: this.validateForm.controls['description'].value,
      }
      this.service.updateSnapshot(data)
        .pipe(finalize(() => {
          this.loadingDelete = false;
          this.handleCancel();
        }))
        .subscribe(
          data => {
            this.notification.success(this.i18n.fanyi('app.status.success'), 'Cập nhật Snapshot thành công');
            this.search(true);
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

  navigateCreateVl() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/volumes-advance/create'])
    } else {
      this.router.navigate(['/app-smart-cloud/volumes/create'])
    }

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
      'PROCESSING',
      'DISABLED'
    ];
    return processingStatuses.includes(status);
  }

}
