import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormCreateSubUser } from '../../../../shared/models/sub-user.model';
import { ObjectStorageService } from '../../../../shared/services/object-storage.service';
import { SubUserService } from '../../../../shared/services/sub-user.service';
import { UserInfoObjectStorage } from '../../../../shared/models/object-storage.model';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-create-sub-user',
  templateUrl: './create-sub-user.component.html',
  styleUrls: ['./create-sub-user.component.less'],
})
export class CreateSubUserComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  value: string

  nameChange: string
  accessChange: string

  name: string = ''
  access: string = 'full'
  isLoading: boolean = false

  userInfoObjectStorage: UserInfoObjectStorage

  validateForm: FormGroup<{
    name: FormControl<string>
    access: FormControl<string>
  }> = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\-]+$/)]],
    access: ['full', [Validators.required]]
  })

  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              private objectStorageService: ObjectStorageService,
              private subUserService: SubUserService,
              private notification: NzNotificationService) {
  }

  onInputChange(value) {
    this.value = value
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  updateData(value: string) {
    this.name = value;
  }

  updateAccess(value: string) {
    this.access = value;
  }

  submitForm() {
    if(this.validateForm.valid) {
      this.isLoading = true
      let formCreate = new FormCreateSubUser()
      formCreate.uid = this.userInfoObjectStorage.user_id
      formCreate.subuser = this.validateForm.controls.name.value
      formCreate.gen_subuser = ""
      formCreate.generate_secret = true
      formCreate.secret_key = ""
      formCreate.key_type = "s3"
      if(this.validateForm.controls.access.value.includes('none')) {
        formCreate.access = ""
      } else {
        formCreate.access = this.validateForm.controls.access.value
      }
      this.subUserService.createSubUser(formCreate).subscribe(data => {
        this.notification.success('Thành công', 'Tạo mới Sub-User thành công')
        this.router.navigate(['/app-smart-cloud/object-storage/sub-user/list'])
      }, error => {
        this.notification.error('Thất bại','Tạo mới Sub-User thất bại')
      })
    }
  }

  getInformationOfUserObject() {
    this.objectStorageService.getUserInfo().subscribe(data => {
      console.log('data', data)
      this.userInfoObjectStorage = data
    })
  }

  cancel() {
    this.validateForm.reset()
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.getInformationOfUserObject()

  }
}
