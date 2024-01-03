import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  PermissionPolicies,
  User,
  UserGroup,
} from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { finalize } from 'rxjs';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PolicyService } from 'src/app/shared/services/policy.service';
import { Router } from '@angular/router';

@Component({
  selector: 'one-portal-attach-permission-policy',
  templateUrl: './attach-permission-policy.component.html',
  styleUrls: ['./attach-permission-policy.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachPermissionPolicyComponent implements OnInit {
  @Input() isCreate: boolean;
  @Input() userName: any;
  @Output() listPolicyNames = new EventEmitter();
  @Output() listGroupNames = new EventEmitter();

  listOfGroups: UserGroup[] = [];
  listOfUsers: User[] = [];
  listOfpolicies: PermissionPolicies[] = [];
  pageIndex = 1;
  pageSize = 10;
  total: number = 3;
  id: any;
  searchParam: string;
  loading = true;
  typePolicy: string = '';
  checkedAllInPage = false;
  listCheckedInPage = [];

  filterStatus = [
    { text: 'Tất cả các loại', value: '' },
    { text: 'Khởi tạo', value: 'KHOITAO' },
    { text: 'Hủy', value: 'HUY' },
    { text: 'Tạm ngưng', value: 'TAMNGUNG' },
  ];

  changeFilterStatus(e: any): void {
    this.typePolicy = e;
  }

  constructor(
    private service: UserService,
    private policyService: PolicyService,
    public message: NzMessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = 'text';
  }

  ngOnInit(): void {
    console.log('isCreate', this.isCreate);
    console.log('userName', this.userName);
    this.service.model.subscribe((data) => {
      console.log(data);
    });
    this.getGroup();
  }

  changeSearch(e: any): void {
    this.searchParam = e;
  }

  // Dùng để truyền dữ liệu khi có thay đổi
  emitData() {
    this.listGroupNames.emit(this.groupNames);
    this.listPolicyNames.emit(Array.from(this.policyNames));
  }

  resetDataPicked(): void {
    this.groupNames = [];
    this.policyNames.clear();
    this.listCheckedInPage = [];
    this.checkedAllInPage = false;
    this.emitData();
  }

  resetParams(): void {
    this.searchParam = '';
    this.pageSize = 10;
    this.pageIndex = 1;
  }

  activeBlockAddUsertoGroup: boolean = true;
  activeBlockCopyPolicies: boolean = false;
  activeBlockAttachPolicies: boolean = false;
  initAddUsertoGroup(): void {
    this.activeBlockAddUsertoGroup = true;
    this.activeBlockCopyPolicies = false;
    this.activeBlockAttachPolicies = false;
    this.resetParams();
    this.getGroup();
    this.listGroupPicked = [];
  }
  initCopyPolicies(): void {
    this.activeBlockAddUsertoGroup = false;
    this.activeBlockCopyPolicies = true;
    this.activeBlockAttachPolicies = false;
    this.resetParams();
    this.getCopyUserPlicies();
    this.listUserPicked = [];
  }
  initAttachPolicies(): void {
    this.activeBlockAddUsertoGroup = false;
    this.activeBlockCopyPolicies = false;
    this.activeBlockAttachPolicies = true;
    this.resetParams();
    this.getPermissionPolicies();
  }

  // xử lý tập các quyền khi chọn
  handlePolicyNames(listPicked: any[]) {
    this.policyNames.clear();
    listPicked.forEach((e) => {
      e.userPolicies.forEach((element) => {
        this.policyNames.add(element);
      });
    });
  }

  // Kiểm tra xem có chọn tất cả không
  checkPickAll(listPicked: any[], listCurrent: any[]): void {
    if (listPicked.length == listCurrent.length) {
      this.checkedAllInPage = true;
    } else {
      this.checkedAllInPage = false;
    }
  }

  // Danh sách Groups
  getGroup(): void {
    this.loading = true;
    this.resetDataPicked();
    this.listGroupPicked = [];
    this.service
      .getGroups(this.searchParam, this.pageSize, this.pageIndex)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listOfGroups = data.records;
        this.listOfGroups.forEach((e) => {
          this.service
            .getUsersOfGroup(e.name, 9999, 1)
            .subscribe((data: any) => {
              e.numberOfUser = data.totalCount;
              data.records.forEach((user: any) => {
                if (!this.isCreate && user.userName == this.userName) {
                  this.listOfGroups = this.listOfGroups.filter(
                    (item) => item != e
                  );
                }
                this.cdr.detectChanges();
              });
            });
        });

        console.log(this.listOfGroups);
      });
    console.log('listGroupPicked', this.listGroupPicked);
  }

  reloadGroupTable(): void {
    this.listOfGroups = [];
    this.getGroup();
  }

  listGroupPicked: UserGroup[] = [];
  groupNames = [];
  policyNames = new Set<string>();
  onClickGroupItem(groupName: string, item: UserGroup) {
    var index = 0;
    var isAdded = true;
    // Kiểm tra mảng có phần tử đc chọn không
    this.groupNames.forEach((e) => {
      if (e == groupName) {
        // nếu có xóa đi
        this.groupNames.splice(index, 1);
        this.listGroupPicked.splice(index, 1);
        isAdded = false;
      }
      index++;
    });
    if (isAdded) {
      //nếu không thêm vào
      this.groupNames.push(groupName);
      this.listGroupPicked.push(item);
    }

    this.checkPickAll(this.listGroupPicked, this.listOfGroups);

    this.policyNames.clear();
    this.listGroupPicked.forEach((e) => {
      e.policies.forEach((element) => {
        this.policyNames.add(element);
      });
    });
    this.emitData();

    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  onChangeCheckAllGroup(checked: any) {
    let listChecked = [];
    this.listOfGroups.forEach(() => {
      listChecked.push(checked);
    });
    this.listCheckedInPage = listChecked;
    if (checked == true) {
      this.listGroupPicked = [];
      this.listOfGroups.forEach((e) => {
        this.listGroupPicked.push(e);
      });
    } else {
      this.listGroupPicked = [];
    }

    this.groupNames = [];
    this.policyNames.clear();
    this.listGroupPicked.forEach((e) => {
      this.groupNames.push(e.name);
      e.policies.forEach((element) => {
        this.policyNames.add(element);
      });
    });
    this.emitData();

    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  //Danh sách Users
  getCopyUserPlicies() {
    this.loading = true;
    this.resetDataPicked();
    this.listUserPicked = [];
    this.service
      .search(this.searchParam, this.pageSize, this.pageIndex)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listOfUsers = data.records;
        if (!this.isCreate) {
          this.listOfUsers = this.listOfUsers.filter(
            (e) => e.userName !== this.userName
          );
        }
      });

    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  reloadUserTable(): void {
    this.listOfUsers = [];
    this.getCopyUserPlicies();
  }

  listUserPicked: User[] = [];
  onClickUserItem(item: User) {
    var index = 0;
    var isAdded = true;
    this.listUserPicked.forEach((e) => {
      if (e.userName == item.userName) {
        this.listUserPicked.splice(index, 1);
        isAdded = false;
      }
      index++;
    });
    if (isAdded) {
      this.listUserPicked.push(item);
    }

    this.checkPickAll(this.listUserPicked, this.listOfUsers);

    this.handlePolicyNames(this.listUserPicked);
    this.emitData();

    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  onChangeCheckAllUser(checked: any) {
    let listChecked = [];
    this.listOfUsers.forEach(() => {
      listChecked.push(checked);
    });
    this.listCheckedInPage = listChecked;
    if (checked == true) {
      this.listUserPicked = [];
      this.listOfUsers.forEach((e) => {
        this.listUserPicked.push(e);
      });
    } else {
      this.listUserPicked = [];
    }

    this.handlePolicyNames(this.listUserPicked);
    this.emitData();

    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  //Danh sách Policies
  getPermissionPolicies() {
    this.loading = true;
    this.resetDataPicked();
    this.service
      .getPolicies(this.searchParam, this.pageSize, this.pageIndex)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listOfpolicies = data.records;
        this.listOfpolicies.forEach((e: any) => {
          this.policyService
            .getAttachedEntities(e.name, '', 1, 9999, 1)
            .subscribe((result) => {
              e.attachedEntities = result.totalCount;
              this.cdr.detectChanges();
            });
        });
      });

    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  reloadPolicyTable(): void {
    this.listOfpolicies = [];
    this.getPermissionPolicies();
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

    this.checkPickAll(Array.from(this.policyNames), this.listOfpolicies);

    this.emitData();
    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  onChangeCheckAllPolicy(checked: any) {
    let listChecked = [];
    this.listOfpolicies.forEach(() => {
      listChecked.push(checked);
    });
    this.listCheckedInPage = listChecked;
    if (checked == true) {
      this.policyNames.clear();
      this.listOfpolicies.forEach((e) => {
        this.policyNames.add(e.name);
      });
    } else {
      this.policyNames.clear();
    }

    this.emitData();
    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  // View Json Object
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

  navigateToCreateGroup() {
    this.router.navigate(['/app-smart-cloud/iam/user-group/create']);
  }

  navigateToCreatePolicy() {
    this.router.navigate(['/app-smart-cloud/policy/create']);
  }
}
