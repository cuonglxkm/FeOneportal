import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { UserGroupService } from '../../../../shared/services/user-group.service';
import { FormSearchUserGroup, FormUserGroup } from '../../../../shared/models/user-group.model';
import { PolicyModel } from '../../../../shared/models/policy.model';
import { User } from '../../../../shared/models/user.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { ProjectModel } from '../../../../../../../../libs/common-utils/src';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ProjectService } from '../../../../shared/services/project.service';
import { RegionService } from '../../../../shared/services/region.service';

@Component({
  selector: 'one-portal-create-user-group',
  templateUrl: './create-user-group.component.html',
  styleUrls: ['./create-user-group.component.less']
})
export class CreateUserGroupComponent implements OnInit {

  // region = JSON.parse(localStorage.getItem('regionId'));
  // project = JSON.parse(localStorage.getItem('projectId'));
  isLoading: boolean = false;

  validateForm: FormGroup<{
    groupName: FormControl<string>
    projectIds: FormControl<number[]>
    //parentName: FormControl<string>
    policyNames: FormControl<string[]>
    userNames: FormControl<string[]>
  }>;

  //listGroupParent = []
  //listGroupParentUnique: string[] = []
  formSearch: FormSearchUserGroup = new FormSearchUserGroup();

  listPoliciesSelected: string[] = [];
  listUsersSelected: string[] = [];

  listPolicies: PolicyModel[] = [];
  listUsers: User[] = [];

  formCreate: FormUserGroup = new FormUserGroup();

  pageSize: number = 5;
  pageIndex: number = 1;

  listUserSelected: any;
  listPolicySelected: any;

  isVisibleCreate: boolean = false;

  listNameParent: string[] = [];
  isLoadingConfirm: boolean = false;

  listProject: ProjectModel[] = [];

  listProjectSelected: number[];

  constructor(
    private fb: NonNullableFormBuilder,
    private location: Location,
    private userGroupService: UserGroupService,
    private notification: NzNotificationService,
    private router: Router,
    private projectService: ProjectService,
    private regionService: RegionService,
    private renderer: Renderer2,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {
    this.validateForm = this.fb.group({
      groupName: ['', [Validators.required,
        Validators.pattern(/^[\w+=,.@\-_]{1,128}$/),
        Validators.maxLength(128), Validators.minLength(3)]],
      //parentName: [null as string | null],
      projectIds: [null as number[] | null],
      policyNames: [null as string[] | null],
      userNames: [null as string[] | null]
    });
  }

  // regionChanged(region: RegionModel) {
  //   this.region = region.regionId
  // }
  //
  // projectChanged(project: ProjectModel) {
  //   this.project = project?.id
  // }

  // getGroupParent() {
  //   this.userGroupService.search(this.formSearch).subscribe(data => {
  //     data.records.forEach(item => {
  //       if (this.listGroupParent?.length > 0) {
  //         this.listGroupParent.push(item.parent)
  //       } else {
  //         this.listGroupParent = [item.parent]
  //       }
  //       this.listGroupParentUnique = [...new Set(this.listGroupParent)]

  //     })
  //     console.log('list data', this.listGroupParent)
  //     console.log('ist data unique', this.listGroupParentUnique)

  //   }, error => {
  //     this.listGroupParentUnique = []
  //   })
  // }

  isLoadingProject: boolean = false;

  getListProject() {
    this.listProject = [];
    this.isLoadingProject = true;
    this.regionService.getListRegions().subscribe(data => {
      this.isLoadingProject = false;
      data.forEach(item => {
        this.projectService.getByRegion(item.regionId).subscribe(data2 => {
          data2.forEach(project => {
            this.listProject?.push(project);
          });
        }, error => {
          this.isLoadingProject = false;
          this.notification.error(error.statusText, this.i18n.fanyi('app.failData'));
        });
      }, error => {
        this.listProject = [];
        this.isLoadingProject = false;
        this.notification.error(error.statusText, this.i18n.fanyi('app.failData'));
      });
    });

  }

  onSelectedProject(value: number[]) {
    this.listProjectSelected = value;
  }

  submitForm(): void {
    console.log(this.validateForm.valid);
    if (this.validateForm.valid) {
      this.listPolicySelected?.forEach(item => {
        if (this.listPoliciesSelected.length !== undefined) {
          this.listPoliciesSelected.push(item.name);
        } else {
          this.listPoliciesSelected = [item.name];
        }
        if (this.listPoliciesSelected?.length > 0) {
          this.validateForm.controls.policyNames?.setValue(this.listPoliciesSelected);
        } else {
          this.validateForm.controls.policyNames?.setValue([]);
        }

      });
      this.listUserSelected?.forEach(item => {
        if (this.listUsersSelected.length !== undefined) {
          this.listUsersSelected.push(item.userName);
        } else {
          this.listUsersSelected = [item.userName];
        }
        if (this.listUsersSelected?.length > 0) {
          this.validateForm.controls.userNames.setValue(this.listUsersSelected);
        } else {
          this.validateForm.controls.userNames.setValue([]);
        }
      });
      console.log(this.validateForm.getRawValue());
      this.formCreate.groupName = this.validateForm.value.groupName;
      // if(this.validateForm.value.parentName != null) {
      //   this.formCreate.parentName = this.validateForm.value.parentName.toString()
      // }
      this.formCreate.projectIds = this.listProjectSelected;
      this.formCreate.policyNames = this.validateForm.value.policyNames;
      this.formCreate.users = this.validateForm.value.userNames;
      this.isLoadingConfirm = true;
      this.userGroupService.createOrEdit(this.formCreate).subscribe(data => {
        console.log('data return', data);
        this.isVisibleCreate = false;
        this.isLoadingConfirm = false;
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.user-group.noti.success'));
        this.validateForm.reset();
        this.router.navigate(['/app-smart-cloud/iam/user-group']);
      }, error => {
        this.isLoadingConfirm = false;
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.user-group.noti.fail'));
      });
    }
  }

  showCreate() {
    this.isVisibleCreate = true;
  }

  handleCancel() {
    this.isVisibleCreate = false;
    this.isLoadingConfirm = false;
  }

  handleCreate() {
    this.submitForm();
  }

  receivedListPoliciesSelected(object: any) {
    this.listPolicySelected = object;

    console.log('selected', this.listPolicySelected);
  }

  receivedListUsersSelected(object: any) {
    this.listUserSelected = object;
    console.log('selected user', this.listUserSelected);
  }

  getNameParent() {
    this.userGroupService.getName().subscribe(data => {
      this.listNameParent = data;
    });
  }

  ngOnInit(): void {
    //this.getGroupParent()
    this.getNameParent();
    this.getListProject();
  }

  goBack(): void {
    this.location.back();
  }


}
