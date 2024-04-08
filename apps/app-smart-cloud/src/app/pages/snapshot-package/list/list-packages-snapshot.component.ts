import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {FormUpdate, PackageBackupModel, ServiceInPackage} from "../../../shared/models/package-backup.model";
import {BaseResponse} from "../../../../../../../libs/common-utils/src";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {getCurrentRegionAndProject} from "@shared";
import {ProjectService} from 'src/app/shared/services/project.service';
import { FormSearchPackageSnapshot } from 'src/app/shared/models/package-snapshot.model';
import { PackageSnapshotService } from 'src/app/shared/services/package-snapshot.service';
import { debounceTime } from 'rxjs';


@Component({
  selector: 'one-portal-list-packages-snapshot',
  templateUrl: './list-packages-snapshot.component.html',
  styleUrls: ['./list-packages-snapshot.component.less'],
})
export class ListPackagesSnapshotComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  pageSize: number = 5
  pageIndex: number = 1

  isLoading: boolean = false

  value: string = ''

  customerId: number

  packageBackupModel: PackageBackupModel = new PackageBackupModel()
  response: BaseResponse<PackageBackupModel[]>

  isVisibleDelete: boolean = false
  isLoadingDelete: boolean = false

  isVisibleUpdate: boolean = false
  isLoadingUpdate: boolean = false

  packageName: string
  selected: any = 'ALL'

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

  typeVPC: number

  isCheckBegin: boolean = false

  formSearchPackageSnapshot: FormSearchPackageSnapshot = new FormSearchPackageSnapshot()

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

  projectChanged(project: ProjectModel) {
    this.project = project?.id
   
  }

  onInputChange(value: string) {
    this.value = value;
    console.log('input text: ', this.value)
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/snapshot/packages/create'])
  }

  onPageSizeChange(value) {
    this.pageSize = value
  }

  onPageIndexChange(value) {
    this.pageIndex = value
  }

  onChangeSelected(value) {
    this.selected = value
    if (this.selected === 'ALL') {
      this.selected = ''
    }
  }

  getListPackageBackups() {
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
      
      this.response = data

    }, error => {
      this.isLoading = false
      this.response = null
    })
  }


  navigateToEdit(id) {
    this.router.navigate(['/app-smart-cloud/backup/packages/edit/' + id])
  }


  onInputChangeDelete(value) {
    this.valueDelete = value
  }

  

  // showDelete(data: PackageBackupModel) {
  //   this.isVisibleDelete = true
  //   this.idBackupPackage = data.id
  //   this.packageName = data.packageName
  //   console.log('data select', data)

  //   this.packageBackupService.getServiceInPackage(data.id).subscribe(data1 => {
  //     this.serviceInPackage = data1
  //     console.log(data1)
  //   })

  // }

  // serviceInPackage: ServiceInPackage = new ServiceInPackage()

  // handleDeletedOk() {
  //   this.isLoadingDelete = true

  //   if (this.valueDelete.includes(this.packageName)) {
  //     this.packageBackupService.delete(this.idBackupPackage).subscribe(data => {
  //       this.isLoadingDelete = false
  //       this.isVisibleDelete = false
  //       this.notification.success('Thành công', 'Xóa gói backup thành công')
  
  //     }, error => {
  //       this.isLoadingDelete = false
  //       this.isVisibleDelete = false
  //       console.log('error', error)
  //       this.notification.error('Thất bại', 'Xóa gói backup thất bại')
  //     })
  //   } else {
  //     this.notification.error('Error', 'Vui lòng nhập đúng thông tin')
  //   }
  // }

  // handleDeleteCancel() {
  //   this.isVisibleDelete = false
  // }

  // showUpdate(data: PackageBackupModel) {
  //   this.isVisibleUpdate = true
  //   this.validateForm.controls.namePackage.setValue(data.packageName)
  //   this.validateForm.controls.description.setValue(data.description)
  //   this.idBackupPackage = data.id
  // }

  // formUpdate: FormUpdate = new FormUpdate()
  // idBackupPackage: number

  // handleUpdateOk() {

  //   this.formUpdate.customerId = this.tokenService.get()?.userId
  //   this.formUpdate.packageId = this.idBackupPackage
  //   this.formUpdate.packageName = this.validateForm.controls.namePackage.value
  //   this.formUpdate.description = this.validateForm.controls.description.value

  //   this.isLoadingUpdate = true
  //   this.packageBackupService.update(this.formUpdate).subscribe(data => {
  //     if (data == true) {
  //       this.isLoadingUpdate = false
  //       this.isVisibleUpdate = false
  //       this.notification.success('Thành công', 'Cập nhật gói Backup thành công')
  
  //     } else {
  //       this.isLoadingUpdate = false
  //       this.isVisibleUpdate = false
  //       console.log('dâata update', data)
  //       this.notification.error('Thất bại', 'Cập nhật gói Backup thất bại ')
  
  //     }
  //   })
  // }

  handleUpdateCancel() {
    this.isVisibleUpdate = false
  }


  ngOnInit() {
    this.customerId = this.tokenService.get()?.userId
    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.getListPackageBackups()
  }
}
