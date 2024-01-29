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
  selector: 'one-portal-edit-backup-package',
  templateUrl: './edit-backup-package.component.html',
  styleUrls: ['./edit-backup-package.component.less'],
})
export class EditBackupPackageComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idBackupPackage: number

  validateForm: FormGroup<{
    namePackage: FormControl<string>
    storage: FormControl<number>
    description: FormControl<string>
    time: FormControl<number>
  }> = this.fb.group({
    namePackage: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9 ]*$/),
      Validators.maxLength(70)]],
    storage: [1, [Validators.required]],
    description: [null as string, [Validators.maxLength(255)]],
    time: [1, [Validators.required]]
  })

  isLoading: boolean = false
  packageBackupModel: PackageBackupModel = new PackageBackupModel()

  isVisibleEdit: boolean = false
  isLoadingEdit: boolean = false

  storage: number

  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private route: ActivatedRoute,
              private fb: NonNullableFormBuilder) {
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
      this.validateForm.controls.namePackage.setValue(this.packageBackupModel.packageName)
      this.storage = this.packageBackupModel.sizeInGB
      this.validateForm.controls.storage.setValue(this.packageBackupModel.sizeInGB)
      this.validateForm.controls.description.setValue(this.packageBackupModel.description)
    })
  }

  changeValueInput() {

  }
  goBack() {

  }

  showModalEdit() {
    this.isVisibleEdit = true
  }

  handleOk(){
    this.isVisibleEdit =  false
    this.update()
  }

  handleCancel() {
    this.isVisibleEdit = false
    this.validateForm.reset()
  }

  reset() {
    this.validateForm.reset()
  }

  update() {
    if(this.validateForm.valid) {

    }
  }

  ngOnInit() {
    this.idBackupPackage = Number.parseInt(this.route.snapshot.paramMap.get('id'))
    if(this.idBackupPackage) {
      this.getDetailPackageBackup(this.idBackupPackage)
    }
  }
}
