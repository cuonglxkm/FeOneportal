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
  CopyUserPolicies,
  GroupCreateUser,
  PermissionPolicies,
} from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { finalize } from 'rxjs';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'one-portal-attach-permission-policy',
  templateUrl: './attach-permission-policy.component.html',
  styleUrls: ['./attach-permission-policy.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachPermissionPolicyComponent implements OnInit {
  @Input() isCreate: boolean = true;
  @Output() listPolicyNames = new EventEmitter();
  @Output() listGroupNames = new EventEmitter();

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
  checkedAllInPage = false;
  listCheckedInPage = []

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
    public message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = 'text';
  }

  ngOnInit(): void {
    this.service.model.subscribe((data) => {
      console.log(data);
    });
    this.getGroup();
    this.getCopyUserPlicies();
    this.getPermissionPolicies();
  }

  changeSearch(e: any): void {
    this.searchParam = e;
  }

  activeBlockAddUsertoGroup: boolean = true;
  activeBlockCopyPolicies: boolean = false;
  activeBlockAttachPolicies: boolean = false;

  resetDataPicked(): void {
    this.groupNames = [];
    this.policyNames.clear();
    this.listCheckedInPage = [];
    this.checkedAllInPage = false;
    this.emitData();
  }
  initAddUsertoGroup(): void {
    this.activeBlockAddUsertoGroup = true;
    this.activeBlockCopyPolicies = false;
    this.activeBlockAttachPolicies = false;
    this.resetDataPicked();
    this.listGroupPicked = [];
  }
  initCopyPolicies(): void {
    this.activeBlockAddUsertoGroup = false;
    this.activeBlockCopyPolicies = true;
    this.activeBlockAttachPolicies = false;
    this.resetDataPicked();
    this.listUserPicked = [];
  }
  initAttachPolicies(): void {
    this.activeBlockAddUsertoGroup = false;
    this.activeBlockCopyPolicies = false;
    this.activeBlockAttachPolicies = true;
    this.resetDataPicked();
  }

  // xử lý tập các quyền khi chọn
  handlePolicyNames(listPicked: any[]) {
    this.policyNames.clear();
    listPicked.forEach((e) => {
      e.attachedPolicies.forEach((element) => {
        this.policyNames.add(element);
      });
    });
  }

  // Dùng để truyền dữ liệu khi có thay đổi
  emitData() {
    this.listGroupNames.emit(this.groupNames);
    this.listPolicyNames.emit(Array.from(this.policyNames));
  }

  // Danh sách Groups
  getGroup(): void {
    this.resetDataPicked();
    this.listGroupPicked = [];
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
    console.log('listGroupPicked', this.listGroupPicked);
  }

  reloadGroupTable(): void {
    this.listOfGroups = [];
    this.getGroup();
  }

  listGroupPicked: GroupCreateUser[] = [];
  groupNames = [];
  policyNames = new Set<string>();
  onClickGroupItem(groupName: string, item: GroupCreateUser) {
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

    // Kiểm tra xem có chọn tất cả không
    if (this.listGroupPicked.length == this.listOfGroups.length) {
      this.checkedAllInPage = true;
    } else {
      this.checkedAllInPage = false;
    }

    this.handlePolicyNames(this.listGroupPicked);
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
      e.attachedPolicies.forEach((element) => {
        this.policyNames.add(element);
      });
    });
    this.emitData();

    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  //Danh sách Users
  getCopyUserPlicies() {
    this.resetDataPicked();
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

    console.log('list groupNames', this.groupNames);
    console.log('list policyNames', this.policyNames);
  }

  reloadUserTable(): void {
    this.listOfUsers = [];
    this.getCopyUserPlicies();
  }

  listUserPicked: CopyUserPolicies[] = [];
  onClickUserItem(item: CopyUserPolicies) {
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

    if (this.listUserPicked.length == this.listOfUsers.length) {
      this.checkedAllInPage = true;
    } else {
      this.checkedAllInPage = false;
    }

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
    this.resetDataPicked();
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

    if (this.listOfpolicies.length == this.policyNames.size) {
      this.checkedAllInPage = true;
    } else {
      this.checkedAllInPage = false;
    }

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
}
