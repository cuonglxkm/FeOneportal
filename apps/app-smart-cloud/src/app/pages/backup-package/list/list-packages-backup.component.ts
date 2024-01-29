import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {PackageBackupModel} from "../../../shared/models/package-backup.model";
import {BaseResponse} from "../../../../../../../libs/common-utils/src";

@Component({
  selector: 'one-portal-list-packages-backup',
  templateUrl: './list-packages-backup.component.html',
  styleUrls: ['./list-packages-backup.component.less'],
})
export class ListPackagesBackupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
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

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    this.getListPackageBackups()
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id

  }

  onInputChange(value: string) {
    this.value = value;
    console.log('input text: ', this.value)
    this.getListPackageBackups()
  }
  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/backup/packages/create'])
  }

  onPageSizeChange(value){
    this.pageSize = value
    this.getListPackageBackups()
  }

  onPageIndexChange(value){
    this.pageIndex = value
    this.getListPackageBackups()
  }


  getListPackageBackups() {
    this.isLoading = true
    this.packageBackupService.search(this.value).subscribe(data => {
      this.isLoading = false
      this.response = data
    })
  }


  navigateToEdit(id) {
    this.router.navigate(['/app-smart-cloud/backup/packages/edit/' + id])
  }

  showDelete() {
    this.isVisibleDelete = true

  }

  handleDeletedOk() {
    this.isVisibleDelete = false
  }

  handleDeleteCancel() {
    this.isVisibleDelete = false
  }
   ngOnInit() {
    this.customerId = this.tokenService.get()?.userId
    // this.getListPackageBackups()
  }
}
