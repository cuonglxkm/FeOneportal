import {Component, OnInit} from '@angular/core';
import {RegionModel} from "../../../../shared/models/region.model";
import {ProjectModel} from "../../../../shared/models/project.model";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {Location} from "@angular/common";
import {UserGroupService} from "../../../../shared/services/user-group.service";
import {FormSearchUserGroup, FormUserGroup} from "../../../../shared/models/user-group.model";
import {PolicyModel} from "../../../policy/policy.model";
import {User} from "../../../../shared/models/user.model";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {Router} from '@angular/router';

@Component({
  selector: 'one-portal-create-user-group',
  templateUrl: './create-user-group.component.html',
  styleUrls: ['./create-user-group.component.less'],
})
export class CreateUserGroupComponent implements OnInit {

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));
  isLoading: boolean = false;

  validateForm: FormGroup<{
    groupName: FormControl<string>
    parentName: FormControl<string>
    policyNames: FormControl<string[]>
    userNames: FormControl<string[]>
  }>

  listGroupParent = []
  listGroupParentUnique: string[] = []
  formSearch: FormSearchUserGroup = new FormSearchUserGroup()

  listPoliciesSelected: string[] = []
  listUsersSelected: string[] = []

  listPolicies: PolicyModel[] = []
  listUsers: User[] = []

  formCreate: FormUserGroup = new FormUserGroup()

  pageSize: number = 5
  pageIndex: number = 1

  listUserSelected: any
  listPolicySelected: any

  isVisibleCreate: boolean = false

  constructor(
    private fb: NonNullableFormBuilder,
    private location: Location,
    private userGroupService: UserGroupService,
    private notification: NzNotificationService,
    private router: Router
  ) {
    this.validateForm = this.fb.group({
      groupName: ['', [Validators.required,
        Validators.pattern(/^[\w+=,.@\-_]{1,128}$/),
        Validators.maxLength(128)]],
      parentName: [null as string | null],
      policyNames: [null as string[] | null],
      userNames: [null as string[] | null]
    });
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  getGroupParent() {
    this.userGroupService.search(this.formSearch).subscribe(data => {
      data.records.forEach(item => {
        if (this.listGroupParent?.length > 0) {
          this.listGroupParent.push(item.parent)
        } else {
          this.listGroupParent = [item.parent]
        }
        this.listGroupParentUnique = [...new Set(this.listGroupParent)]

      })
      console.log('list data', this.listGroupParent)
      console.log('ist data unique', this.listGroupParentUnique)

    }, error => {
      this.listGroupParentUnique = []
    })
  }

  submitForm(): void {
    console.log(this.validateForm.valid);
    if (this.validateForm.valid) {
      this.listPolicySelected?.forEach(item => {
        if (this.listPoliciesSelected.length !== undefined) {
          this.listPoliciesSelected.push(item.name)
        } else {
          this.listPoliciesSelected = [item.name]
        }
        if(this.listPoliciesSelected?.length > 0) {
          this.validateForm.controls.policyNames?.setValue(this.listPoliciesSelected)
        } else {
          this.validateForm.controls.policyNames?.setValue([])
        }

      })
      this.listUserSelected?.forEach(item => {
        if (this.listUsersSelected.length !== undefined) {
          this.listUsersSelected.push(item.userName)
        } else {
          this.listUsersSelected = [item.userName]
        }
        if(this.listUsersSelected?.length > 0) {
          this.validateForm.controls.userNames.setValue(this.listUsersSelected)
        } else {
          this.validateForm.controls.userNames.setValue([])
        }
      })
      console.log(this.validateForm.getRawValue());
      this.formCreate.groupName = this.validateForm.value.groupName
      if(this.validateForm.value.parentName != null) {
        this.formCreate.parentName = this.validateForm.value.parentName.toString()
      }
      this.formCreate.policyNames = this.validateForm.value.policyNames
      this.formCreate.users = this.validateForm.value.userNames
      this.userGroupService.createOrEdit(this.formCreate).subscribe(data => {
        console.log('data return', data)
        this.isVisibleCreate = false
        this.notification.success('Thành công', 'Tạo mới group thành công')
        this.validateForm.reset()
        this.router.navigate(['/app-smart-cloud/iam/user-group'])
      }, error => {

        this.notification.error('Thất bại', 'Tạo mới thất bại')
      })

      console.log('data', this.formCreate)
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({onlySelf: true});
        }
      });
    }
  }

  showCreatePolicy() {
    this.isVisibleCreate = true;
  }

  handleCancel() {
    this.isVisibleCreate = false
  }

  handleCreate(){

    this.submitForm()
  }

  receivedListPoliciesSelected(object: any) {
    this.listPolicySelected = object

    console.log('selected', this.listPolicySelected)
  }

  receivedListUsersSelected(object: any) {
    this.listUserSelected = object
    console.log('selected', this.listUserSelected)
  }

  ngOnInit(): void {
    this.getGroupParent()
  }

  goBack(): void {
    this.location.back();
  }


}
