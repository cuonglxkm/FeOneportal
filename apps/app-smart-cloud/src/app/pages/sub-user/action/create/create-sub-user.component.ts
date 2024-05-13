import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormCreateSubUser } from '../../../../shared/models/sub-user.model';
import { ObjectStorageService } from '../../../../shared/services/object-storage.service';
import { SubUserService } from '../../../../shared/services/sub-user.service';
import { UserInfoObjectStorage } from '../../../../shared/models/object-storage.model';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-create-sub-user',
  templateUrl: './create-sub-user.component.html',
  styleUrls: ['./create-sub-user.component.less'],
})
export class CreateSubUserComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
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
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\-]+$/), this.duplicateNameValidator.bind(this)]],
    access: ['full', [Validators.required]]
  })

  nameList: string[] = []

  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              private objectStorageService: ObjectStorageService,
              private subUserService: SubUserService,
              private notification: NzNotificationService) {
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value)) {
      return { duplicateName: true }; // Duplicate name found
    } else {
      return null; // Name is unique
    }
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

  updateData(value) {
    this.name = value;
  }

  updateAccess(value: string) {
    this.access = value;
  }

  getListSubUser() {
    this.subUserService.getListSubUser(null, 99999, 1).subscribe(data => {
      data?.records?.forEach(item => {
        this.nameList?.push(item?.subUserId);
      });
    })
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


  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.getInformationOfUserObject()
    this.getListSubUser()

  }
}
