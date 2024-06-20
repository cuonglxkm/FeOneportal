import {Component, Inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {FormUpdate, PackageBackupModel, ServiceInPackage} from "../../../shared/models/package-backup.model";
import {BaseResponse, ProjectModel, RegionModel} from "../../../../../../../libs/common-utils/src";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {getCurrentRegionAndProject} from "@shared";
import { FormSearchPackageSnapshot, PackageSnapshotModel } from 'src/app/shared/models/package-snapshot.model';
import { PackageSnapshotService } from 'src/app/shared/services/package-snapshot.service';
import { debounceTime } from 'rxjs';
import { ProjectService } from 'src/app/shared/services/project.service';


@Component({
  selector: 'one-portal-list-packages-snapshot',
  templateUrl: './list-packages-snapshot.component.html',
  styleUrls: ['./list-packages-snapshot.component.less'],
})
export class ListPackagesSnapshotComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  pageSize: number = 5
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

  validateForm: FormGroup<{
    namePackage: FormControl<string>
    description: FormControl<string>
  }> = this.fb.group({
    namePackage: [null as string, [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9]*$/),
      Validators.maxLength(70)]],
    description: [null as string, [Validators.maxLength(255)]]
  })

  valueDelete: string
  projectType = 0;
  typeVPC: number

  isCheckBegin: boolean = false

  formSearchPackageSnapshot: FormSearchPackageSnapshot = new FormSearchPackageSnapshot()
  isBegin: boolean = false;

  constructor(private router: Router,
              private packageSnapshotService: PackageSnapshotService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,
              private projectService: ProjectService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
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
    this.value = value;
    this.getListPackageSnapshot(false)
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/snapshot/packages/create'])
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
    this.formSearchPackageSnapshot.packageName =this.value
    this.formSearchPackageSnapshot.pageSize = this.pageSize
    this.formSearchPackageSnapshot.currentPage = this.pageIndex
    this.formSearchPackageSnapshot.status = this.selected
    this.packageSnapshotService.getPackageSnapshot(this.formSearchPackageSnapshot)
      .pipe(debounceTime(500))
      .subscribe(data => {
      this.isLoading = false
      console.log(data);
      this.response = data;
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
    this.router.navigate(['/app-smart-cloud/snapshot/packages/edit/' + id])
  }


  onInputChangeDelete(value) {
    this.valueDelete = value
  }



  showDelete(data: PackageSnapshotModel) {
    this.isVisibleDelete = true
    this.snapshotId = data.id
    this.packageName = data.packageName
  }

  handleDeletedOk() {
    this.isLoadingDelete = true

    if (this.valueDelete === this.packageName) {
      this.packageSnapshotService.delete(this.snapshotId).subscribe(data => {
        this.isLoadingDelete = false
        this.isVisibleDelete = false
        this.notification.success('Thành công', 'Xóa gói snapshot thành công')
        this.valueDelete = ''
        this.getListPackageSnapshot(true)
      }, error => {
        this.isLoadingDelete = false
        this.isVisibleDelete = false
        console.log('error', error)
        this.notification.error('Thất bại', 'Xóa gói snapshot thất bại')
      })
    } else {
      this.isLoadingDelete = false
      this.notification.error('Error', 'Vui lòng nhập đúng thông tin')
    }
  }

  handleDeleteCancel() {
    this.isVisibleDelete = false
  }


  handleUpdateCancel() {
    this.isVisibleUpdate = false
  }


  ngOnInit() {
    this.customerId = this.tokenService.get()?.userId
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId

  }

  showUpdate(data: PackageSnapshotModel) {
    this.isVisibleUpdate = true;
  }
}
