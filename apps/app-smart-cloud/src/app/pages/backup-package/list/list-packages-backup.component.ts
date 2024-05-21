import {Component, Inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {FormUpdate, PackageBackupModel, ServiceInPackage} from "../../../shared/models/package-backup.model";
import {BaseResponse, ProjectModel, RegionModel} from "../../../../../../../libs/common-utils/src";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {getCurrentRegionAndProject} from "@shared";
import { ProjectService } from 'src/app/shared/services/project.service';

@Component({
  selector: 'one-portal-list-packages-backup',
  templateUrl: './list-packages-backup.component.html',
  styleUrls: ['./list-packages-backup.component.less'],
})
export class ListPackagesBackupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  pageSize: number = 10
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

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
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
    this.getListPackageBackups(true)
  }

  onInputChange(value: string) {
    this.value = value;
    console.log('input text: ', this.value)
    this.getListPackageBackups(false)
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/backup/packages/create'])
  }

  onPageSizeChange(value) {
    this.pageSize = value
    this.getListPackageBackups(false)
  }

  onPageIndexChange(value) {
    this.pageIndex = value
    this.getListPackageBackups(false)
  }

  onChangeSelected(value) {
    this.selected = value
    if (this.selected === 'ALL') {
      this.selected = ''
    }
    this.getListPackageBackups(false)
  }

  getListPackageBackups(isBegin) {
    this.isLoading = true

    this.packageBackupService.search(this.value, this.selected, this.pageSize, this.pageIndex).subscribe(data => {
      this.isLoading = false
      this.response = data

      if (isBegin) {
        this.isCheckBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
      }
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

  packageName: string

  showDelete(data: PackageBackupModel) {
    this.isVisibleDelete = true
    this.idBackupPackage = data.id
    this.packageName = data.packageName
    console.log('data select', data)

    this.packageBackupService.getServiceInPackage(data.id).subscribe(data1 => {
      this.serviceInPackage = data1
      console.log(data1)
    })

  }

  serviceInPackage: ServiceInPackage = new ServiceInPackage()

  handleDeletedOk() {
    this.getListPackageBackups(false);
  }

  showUpdate(data: PackageBackupModel) {
    this.isVisibleUpdate = true
    this.validateForm.controls.namePackage.setValue(data.packageName)
    this.validateForm.controls.description.setValue(data.description)
    this.idBackupPackage = data.id
  }

  formUpdate: FormUpdate = new FormUpdate()
  idBackupPackage: number

  handleUpdateOk() {

    this.formUpdate.customerId = this.tokenService.get()?.userId
    this.formUpdate.packageId = this.idBackupPackage
    this.formUpdate.packageName = this.validateForm.controls.namePackage.value
    this.formUpdate.description = this.validateForm.controls.description.value

    this.isLoadingUpdate = true
    this.packageBackupService.update(this.formUpdate).subscribe(data => {
      if (data == true) {
        this.isLoadingUpdate = false
        this.isVisibleUpdate = false
        this.notification.success('Thành công', 'Cập nhật gói Backup thành công')
        this.getListPackageBackups(false)
      } else {
        this.isLoadingUpdate = false
        this.isVisibleUpdate = false
        console.log('dâata update', data)
        this.notification.error('Thất bại', 'Cập nhật gói Backup thất bại ')
        this.getListPackageBackups(false)
      }
    })
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
}
