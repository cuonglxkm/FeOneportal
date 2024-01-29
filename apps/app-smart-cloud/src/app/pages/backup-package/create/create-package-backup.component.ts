import {Component, Inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {PackageBackupService} from "../../../shared/services/package-backup.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {RegionModel} from "../../../shared/models/region.model";
import {ProjectModel} from "../../../shared/models/project.model";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'one-portal-create-package-backup',
  templateUrl: './create-package-backup.component.html',
  styleUrls: ['./create-package-backup.component.less'],
})
export class CreatePackageBackupComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  validateForm: FormGroup<{
    namePackage: FormControl<string>
    storage: FormControl<number>
    description: FormControl<string>
    time: FormControl<number>
  }> = this.fb.group({
    namePackage: ['', [Validators.required]],
    storage: [1, [Validators.required]],
    description: [null as string, [Validators.maxLength(255)]],
    time: [1, [Validators.required]]
  })

  createdDate: Date = new Date()
  expiredDate: Date = new Date()

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

  timeSelected: any



  constructor(private router: Router,
              private packageBackupService: PackageBackupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService,
              private fb: NonNullableFormBuilder,) {
      this.validateForm.get('time').valueChanges.subscribe(data => {
        console.log('create', this.createdDate.toISOString())
        console.log('change', this.expiredDate.setDate(this.createdDate.getDate() + data*30))
      })


  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  onTimeSelected(value) {
    console.log('value selected', value)
  }

  submitForm(){

  }

  goBack(){
    this.router.navigate(['/app-smart-cloud/backup/packages'])
  }


  packageBackpInit() {

  }

  ngOnInit() {
    const date = this.createdDate.getDate() + 30
    this.expiredDate.setDate(date)
    console.log('first', new Date(this.expiredDate).toISOString())
  }
}


