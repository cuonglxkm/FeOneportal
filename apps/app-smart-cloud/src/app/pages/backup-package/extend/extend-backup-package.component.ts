import {Component, Inject, OnInit} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {ActivatedRoute, Router} from "@angular/router";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {PackageBackupModel} from "../../../shared/models/package-backup.model";

@Component({
  selector: 'one-portal-extend-backup-package',
  templateUrl: './extend-backup-package.component.html',
  styleUrls: ['./extend-backup-package.component.less'],
})
export class ExtendBackupPackageComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false

  idBackupPackage: number

  packageBackupModel: PackageBackupModel = new PackageBackupModel()

  validateForm: FormGroup<{
    time: FormControl<number>
  }> = this.fb.group({
    time: [1, [Validators.required]]
  })

  estimateExpiredDate: Date
  expiredDate: Date

  time = [
    {label: '1 tháng', value: 1},
    {label: '2 tháng', value: 2},
    {label: '3 tháng', value: 3},
    {label: '4 tháng', value: 4},
    {label: '5 tháng', value: 5},
    {label: '6 tháng', value: 6},
    {label: '7 tháng', value: 7},
    {label: '8 tháng', value: 8},
    {label: '9 tháng', value: 9},
    {label: '10 tháng', value: 10},
    {label: '11 tháng', value: 11},
    {label: '12 tháng', value: 12}
  ]

  isVisibleConfirmExtend: boolean = false
  isLoadingExtend: boolean = false

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder) {
    this.validateForm.get('time').valueChanges.subscribe(data => {
      this.estimateExpiredDate = new Date(new Date().setDate(this.expiredDate.getDate() + data*30))
    })
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  getDetailPackageBackup(id) {
    this.packageBackupService.detail(id).subscribe(data => {
      console.log('data', data)
      this.packageBackupModel = data
      this.expiredDate = this.packageBackupModel.expirationDate
    })
  }

  onTimeSelected(value){

  }

  submitForm() {

  }

  showConfirmExtend() {
    this.isVisibleConfirmExtend = true
  }

  handleOk() {
    this.isVisibleConfirmExtend = false
    this.submitForm()
  }

  handleCancel() {
    this.isVisibleConfirmExtend = false
    this.validateForm.reset()
  }

  reset() {
    this.validateForm.reset()
  }

  ngOnInit() {
    this.idBackupPackage = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    if(this.idBackupPackage) {
      this.getDetailPackageBackup(this.idBackupPackage)
    }
  }
}
