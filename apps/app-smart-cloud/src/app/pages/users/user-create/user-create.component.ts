import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { RegionModel } from 'src/app/shared/models/region.model';
import {
  CopyUserPolicies,
  GroupCreateUser,
  PermissionPolicies,
  UseCreate,
} from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { finalize } from 'rxjs';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoadingService } from '@delon/abc/loading';
@Component({
  selector: 'one-portal-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['../user.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateComponent implements OnInit {
  userCreate: UseCreate = new UseCreate();
  regionId: number;
  projectId: number;
  listOfGroups: GroupCreateUser[] = [];
  listOfUsers: CopyUserPolicies[] = [];
  listOfpolicies: PermissionPolicies[] = [];
  pageIndex = 1;
  pageSize = 10;
  total: number = 3;
  baseResponse: BaseResponse<GroupCreateUser[]>;
  id: any;
  searchParam: string;
  loading = true;
  typePolicy: string = '';

  filterStatus = [
    { text: 'Tất cả các loại', value: '' },
    { text: 'Khởi tạo', value: 'KHOITAO' },
    { text: 'Hủy', value: 'HUY' },
    { text: 'Tạm ngưng', value: 'TAMNGUNG' },
  ];

  changeFilterStatus(e: any): void {
    this.typePolicy = e;
  }

  form: FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
  }> = this.fb.group({
    name: [
      '',
      [Validators.required, Validators.pattern(/^[\w\d+=,.@\-_]{1,64}$/)],
    ],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private fb: NonNullableFormBuilder,
    private service: UserService,
    private router: Router,
    public message: NzMessageService,
    private cdr: ChangeDetectorRef,
    private loadingSrv: LoadingService
  ) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = 'text';
  }

  ngOnInit(): void {
    this.service.model.subscribe((data) => {
      console.log(data);
    });
    this.getData();
    this.getCopyUserPlicies();
    this.getPermissionPolicies();
  }

  getData(): void {
    this.listGroupPicked = [];
    this.groupNames = [];
    this.service
      .getGroupsCreateUser()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((baseResponse) => {
        this.listOfGroups = baseResponse.records;
        console.log(this.listOfGroups);
      });
  }

  reloadGroupTable(): void {
    this.listOfGroups = [];
    this.getData();
  }

  getCopyUserPlicies() {
    this.listUserPicked = [];
    this.service
      .getCopyUserPolicies()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listOfUsers = data.records;
      });
  }

  reloadUserTable(): void {
    this.listOfUsers = [];
    this.getCopyUserPlicies();
  }

  getPermissionPolicies() {
    this.policyNames.clear();
    this.service
      .getPermissionPolicies()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listOfpolicies = data.records;
      });
  }

  reloadPolicyTable(): void {
    this.listOfpolicies = [];
    this.getPermissionPolicies();
  }

  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.regionId = region.regionId;
    this.cdr.detectChanges();
  }

  onProjectChange(project: any) {
    // Handle the region change event
    this.projectId = project.id;
    this.cdr.detectChanges();
  }

  changeSearch(e: any): void {
    this.searchParam = e;
  }

  activeBlockAddUsertoGroup: boolean = true;
  activeBlockCopyPolicies: boolean = false;
  activeBlockAttachPolicies: boolean = false;

  initAddUsertoGroup(): void {
    this.activeBlockAddUsertoGroup = true;
    this.activeBlockCopyPolicies = false;
    this.activeBlockAttachPolicies = false;
    this.listGroupPicked = [];
    this.listUserPicked = [];
    this.groupNames = [];
  }
  initCopyPolicies(): void {
    this.activeBlockAddUsertoGroup = false;
    this.activeBlockCopyPolicies = true;
    this.activeBlockAttachPolicies = false;
    this.listGroupPicked = [];
    this.listUserPicked = [];
    this.groupNames = [];
  }
  initAttachPolicies(): void {
    this.activeBlockAddUsertoGroup = false;
    this.activeBlockCopyPolicies = false;
    this.activeBlockAttachPolicies = true;
    this.listGroupPicked = [];
    this.listUserPicked = [];
    this.groupNames = [];
    this.policyNames.clear();
  }

  listGroupPicked: GroupCreateUser[] = [];
  groupNames = [];
  policyNames = new Set<string>();
  onClickGroupItem(groupName: string, item: GroupCreateUser) {
    this.policyNames.clear();
    var index = 0;
    var isAdded = true;
    this.groupNames.forEach((e) => {
      if (e == groupName) {
        this.groupNames.splice(index, 1);
        this.listGroupPicked.splice(index, 1);
        isAdded = false;
      }
      index++;
    });
    if (isAdded) {
      this.groupNames.push(groupName);
      this.listGroupPicked.push(item);
    }

    this.listGroupPicked.forEach((e) => {
      e.attachedPolicies.forEach((element) => {
        this.policyNames.add(element);
      });
    });
    console.log('list groupNames', this.groupNames);
    console.log('list Policies', this.policyNames);
  }

  listUserPicked: CopyUserPolicies[] = [];
  onClickUserItem(item: CopyUserPolicies) {
    this.policyNames.clear();
    var index = 0;
    var isAdded = true;
    this.listUserPicked.forEach((e) => {
      if (e.name == item.name) {
        this.listUserPicked.splice(index, 1);
        isAdded = false;
      }
      index++;
    });
    if (isAdded) {
      this.listUserPicked.push(item);
    }

    this.listUserPicked.forEach((e) => {
      e.attachedPolicies.forEach((element) => {
        this.policyNames.add(element);
      });
    });
    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  onClickPolicyItem(policyName: string) {
    var isAdded = true;
    this.policyNames.forEach((e) => {
      if (e == policyName) {
        this.policyNames.delete(e);
        isAdded = false;
      }
    });
    if (isAdded) {
      this.policyNames.add(policyName);
    }
    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  @ViewChild(JsonEditorComponent) editor: JsonEditorComponent;
  public optionJsonEditor: JsonEditorOptions;
  expandSet = new Set<string>();
  onExpandChange(name: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(name);
    } else {
      this.expandSet.delete(name);
    }
  }

  isVisibleCreate: boolean = false;
  showModal() {
    this.isVisibleCreate = true;
  }

  handleCancelCreate() {

    this.isVisibleCreate = false;
  }

  handleOkCreate(): void {
    this.userCreate.groupNames = this.groupNames;
    this.userCreate.policyNames = Array.from(this.policyNames)
    this.isVisibleCreate = false;
    this.service
      .create(this.userCreate)
      .pipe(
        finalize(() => {
          this.loadingSrv.close();
        })
      )
      .subscribe(
        (data: any) => {
          console.log(data);
          this.message.success('Tạo mới User thành công');
          this.router.navigateByUrl(`/app-smart-cloud/users`);
        },
        (error) => {
          console.log(error.error);
          this.message.error('Tạo mới User không thành công');
        }
      );
  }

  navigateToCreate() {}

  navigateToList() {
    this.router.navigate(['/app-smart-cloud/users']);
  }
}
