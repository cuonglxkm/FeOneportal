import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { FormCreateSubUser } from '../../../../shared/models/sub-user.model';
import { ObjectStorageService } from '../../../../shared/services/object-storage.service';
import { SubUserService } from '../../../../shared/services/sub-user.service';
import { UserInfoObjectStorage } from '../../../../shared/models/object-storage.model';
import { getCurrentRegionAndProject } from '@shared';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RegionModel, ProjectModel } from '../../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { RegionID } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'one-portal-create-sub-user',
  templateUrl: './create-sub-user.component.html',
  styleUrls: ['./create-sub-user.component.less'],
})
export class CreateSubUserComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));

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
    name: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z0-9\-]+$/),
      this.duplicateNameValidator.bind(this),
      Validators.maxLength(50),
      Validators.minLength(3)]],
    access: ['full', [Validators.required]]
  })

  nameList: string[] = []
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private router: Router,
              private fb: NonNullableFormBuilder,
              private objectStorageService: ObjectStorageService,
              private subUserService: SubUserService,
              private notification: NzNotificationService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
  }

  duplicateNameValidator(control) {
    const value = control.value;
    // Check if the input name is already in the list
    if (this.nameList && this.nameList.includes(value.toLowerCase())) {
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
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }


  updateData(value) {
    this.name = value;
  }

  updateAccess(value: string) {
    this.access = value;
  }

  getListSubUser() {
    this.subUserService.getListSubUser(null, 99999, 1, this.region).subscribe(data => {
      data?.records?.forEach(item => {
        this.nameList?.push(item?.subUserId.toLowerCase());
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
      this.subUserService.createSubUser(this.region, formCreate).subscribe(data => {
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.create.subuser.success'))
        if(this.region === RegionID.ADVANCE){
          this.router.navigate(['/app-smart-cloud/object-storage-advance/sub-user']);
        }else{
          this.router.navigate(['/app-smart-cloud/object-storage/sub-user']);
        }
      }, error => {
        this.notification.error(this.i18n.fanyi('app.status.fail'),this.i18n.fanyi('app.create.subuser.fail'))
      })
    }
  }

  getInformationOfUserObject() {
    this.objectStorageService.getUserInfo(this.region).subscribe(data => {
      console.log('data', data)
      this.userInfoObjectStorage = data
    })
  }

  navigateToSubUser() {
    if(this.region === RegionID.ADVANCE){
      this.router.navigate(['/app-smart-cloud/object-storage-advance/sub-user']);
    }else{
      this.router.navigate(['/app-smart-cloud/object-storage/sub-user']);
    }
  }

  navigateToCreateSubUser() {
    if(this.region === RegionID.ADVANCE){
      this.router.navigate(['/app-smart-cloud/object-storage-advance/sub-user/create']);
    }else{
      this.router.navigate(['/app-smart-cloud/object-storage/sub-user/create']);
    }
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.getInformationOfUserObject()
    this.getListSubUser()
  }


}
