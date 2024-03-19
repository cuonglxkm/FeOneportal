import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
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
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ClipboardService } from 'ngx-clipboard';

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
  listOfPolicies: PermissionPolicies[] = [];
  pageIndex = 1;
  pageSize = 10;
  searchParam: string;
  loading = true;
  typePolicy: string = '';
  groupNames: string[] = [];
  policyNames = new Set<string>();
  cardHeight: string = '130px';

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
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver,
    private clipboardService: ClipboardService
  ) {
    this.optionJsonEditor = new JsonEditorOptions();
    this.optionJsonEditor.mode = 'text';
  }

  ngOnInit(): void {
    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .subscribe((result) => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          // Màn hình cỡ nhỏ
          this.cardHeight = '110px';
        } else if (result.breakpoints[Breakpoints.Small]) {
          // Màn hình cỡ nhỏ - trung bình
          this.cardHeight = '190px';
        } else if (result.breakpoints[Breakpoints.Medium]) {
          // Màn hình trung bình
          this.cardHeight = '190px';
        } else if (result.breakpoints[Breakpoints.Large]) {
          // Màn hình lớn
          this.cardHeight = '170px';
        } else if (result.breakpoints[Breakpoints.XLarge]) {
          // Màn hình rất lớn
          this.cardHeight = '130px';
        }

        // Cập nhật chiều cao của card bằng Renderer2
        this.renderer.setStyle(
          this.el.nativeElement,
          'height',
          this.cardHeight
        );
      });

    this.getGroup();
  }

  // Dùng để truyền dữ liệu khi có thay đổi
  emitData() {
    this.listGroupNames.emit(this.groupNames);
    this.listPolicyNames.emit(Array.from(this.policyNames));
  }

  resetDataPicked(): void {
    this.mapOfCheckedGroup.clear();
    this.mapOfCheckedUser.clear();
    this.setOfCheckedPolicy.clear();
    this.groupNames = [];
    this.policyNames.clear();
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
    this.resetDataPicked();
    this.resetParams();
    this.getGroup();
  }
  initCopyPolicies(): void {
    this.activeBlockAddUsertoGroup = false;
    this.activeBlockCopyPolicies = true;
    this.activeBlockAttachPolicies = false;
    this.resetDataPicked();
    this.resetParams();
    this.getCopyUserPlicies();
  }
  initAttachPolicies(): void {
    this.activeBlockAddUsertoGroup = false;
    this.activeBlockCopyPolicies = false;
    this.activeBlockAttachPolicies = true;
    this.resetDataPicked();
    this.resetParams();
    this.getPermissionPolicies();
  }

  // xử lý tập các lựa chọn tạo user
  handleDataPicked() {
    if (this.activeBlockAddUsertoGroup) {
      this.groupNames = Array.from(this.mapOfCheckedGroup.keys());
      this.policyNames.clear();
      this.mapOfCheckedGroup.forEach((e) => {
        e.forEach((item) => {
          this.policyNames.add(item);
        });
      });
      this.emitData();
    }
    if (this.activeBlockCopyPolicies) {
      this.groupNames = [];
      this.policyNames.clear();
      this.mapOfCheckedUser.forEach((e) => {
        e.forEach((item) => {
          this.policyNames.add(item);
        });
      });
      this.emitData();
    }
    if (this.activeBlockAttachPolicies) {
      this.groupNames = [];
      this.policyNames = this.setOfCheckedPolicy;
      this.emitData();
    }
  }

  // Danh sách Groups
  totalGroup = 0;
  getGroup(): void {
    this.loading = true;
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
        this.totalGroup = data.totalCount;
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
  }

  reloadGroupTable(): void {
    this.listOfGroups = [];
    this.resetDataPicked();
    this.getGroup();
  }

  checkedGroup = false;
  indeterminateGroup = false;
  mapOfCheckedGroup = new Map<string, string[]>();

  onCurrentPageDataChangeGroup(listOfCurrentPageData: UserGroup[]): void {
    this.listOfGroups = listOfCurrentPageData;
    this.refreshCheckedStatusGroup();
  }

  refreshCheckedStatusGroup(): void {
    const listOfEnabledData = this.listOfGroups;
    this.checkedGroup = listOfEnabledData.every(({ name }) =>
      this.mapOfCheckedGroup.has(name)
    );
    this.indeterminateGroup =
      listOfEnabledData.some(({ name }) => this.mapOfCheckedGroup.has(name)) &&
      !this.checkedGroup;
  }

  updateCheckedSetGroup(item: UserGroup, checked: boolean): void {
    if (checked) {
      this.mapOfCheckedGroup.set(item.name, item.policies);
    } else {
      this.mapOfCheckedGroup.delete(item.name);
    }
  }

  onItemCheckedGroup(item: UserGroup, checked: boolean): void {
    this.updateCheckedSetGroup(item, checked);
    this.handleDataPicked();
    this.refreshCheckedStatusGroup();
  }

  onAllCheckedGroup(checked: boolean): void {
    this.listOfGroups.forEach((item) =>
      this.updateCheckedSetGroup(item, checked)
    );
    this.handleDataPicked();
    this.refreshCheckedStatusGroup();
  }

  //Danh sách Users
  totalUser = 0;
  getCopyUserPlicies() {
    this.loading = true;
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
        this.totalUser = data.totalCount;
        if (!this.isCreate) {
          this.listOfUsers = this.listOfUsers.filter(
            (e) => e.userName !== this.userName
          );
        }
      });
  }

  reloadUserTable(): void {
    this.listOfUsers = [];
    this.resetDataPicked();
    this.getCopyUserPlicies();
  }

  checkedUser = false;
  indeterminateUser = false;
  mapOfCheckedUser = new Map<string, string[]>();

  onCurrentPageDataChangeUser(listOfCurrentPageData: User[]): void {
    this.listOfUsers = listOfCurrentPageData;
    this.refreshCheckedStatusUser();
  }

  refreshCheckedStatusUser(): void {
    const listOfEnabledData = this.listOfUsers;
    this.checkedUser = listOfEnabledData.every(({ userName }) =>
      this.mapOfCheckedUser.has(userName)
    );
    this.indeterminateUser =
      listOfEnabledData.some(({ userName }) =>
        this.mapOfCheckedUser.has(userName)
      ) && !this.checkedUser;
  }

  updateCheckedSetUser(item: User, checked: boolean): void {
    if (checked) {
      this.mapOfCheckedUser.set(item.userName, item.userPolicies);
    } else {
      this.mapOfCheckedUser.delete(item.userName);
    }
  }

  onItemCheckedUser(item: User, checked: boolean): void {
    this.updateCheckedSetUser(item, checked);
    this.handleDataPicked();
    this.refreshCheckedStatusUser();
  }

  onAllCheckedUser(checked: boolean): void {
    this.listOfUsers.forEach((item) =>
      this.updateCheckedSetUser(item, checked)
    );
    this.handleDataPicked();
    this.refreshCheckedStatusUser();
  }

  //Danh sách Policies
  totalPolicy = 0;
  getPermissionPolicies() {
    this.loading = true;
    this.service
      .getPolicies(this.searchParam, this.pageSize, this.pageIndex)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listOfPolicies = data.records;
        this.totalPolicy = data.totalCount;
        this.listOfPolicies.forEach((e: any) => {
          this.policyService
            .getAttachedEntities(e.name, '', 1, 9999, 1)
            .subscribe((result) => {
              e.attachedEntities = result.totalCount;
              this.cdr.detectChanges();
            });
        });
      });
  }

  reloadPolicyTable(): void {
    this.listOfPolicies = [];
    this.resetDataPicked();
    this.getPermissionPolicies();
  }

  checkedPolicy = false;
  indeterminatePolicy = false;
  setOfCheckedPolicy = new Set<string>();

  onCurrentPageDataChangePolicy(
    listOfCurrentPageData: PermissionPolicies[]
  ): void {
    this.listOfPolicies = listOfCurrentPageData;
    this.refreshCheckedStatusPolicy();
  }

  refreshCheckedStatusPolicy(): void {
    const listOfEnabledData = this.listOfPolicies;
    this.checkedPolicy = listOfEnabledData.every(({ name }) =>
      this.setOfCheckedPolicy.has(name)
    );
    this.indeterminatePolicy =
      listOfEnabledData.some(({ name }) => this.setOfCheckedPolicy.has(name)) &&
      !this.checkedPolicy;
  }

  updateCheckedSetPolicy(name: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedPolicy.add(name);
    } else {
      this.setOfCheckedPolicy.delete(name);
    }
  }

  onItemCheckedPolicy(name: string, checked: boolean): void {
    this.updateCheckedSetPolicy(name, checked);
    this.handleDataPicked();
    this.refreshCheckedStatusPolicy();
  }

  onAllCheckedPolicy(checked: boolean): void {
    this.listOfPolicies.forEach(({ name }) =>
      this.updateCheckedSetPolicy(name, checked)
    );
    this.handleDataPicked();
    this.refreshCheckedStatusPolicy();
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

  copyText(data: any) {
    this.clipboardService.copyFromContent(JSON.stringify(data));
    this.message.success('Copied to clipboard');
  }

  navigateToCreateGroup() {
    this.router.navigate(['/app-smart-cloud/iam/user-group/create']);
  }

  navigateToCreatePolicy() {
    this.router.navigate(['/app-smart-cloud/policy/create']);
  }
}
