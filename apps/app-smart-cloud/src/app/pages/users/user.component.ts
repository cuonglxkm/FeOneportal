import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { debounceTime, finalize, Subject } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { TimeCommon } from '../../shared/utils/common';

@Component({
  selector: 'one-portal-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit {
  listOfCurrentPageData: User[] = [];
  pageIndex = 1;
  pageSize = 10;
  total: number;
  searchParam: string;
  loading = true;
  checked = false;
  indeterminate = false;
  setOfCheckedName = new Set<string>();

  userDelete: string;
  nameModal: string;

  constructor(
    private service: UserService,
    private router: Router,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}
  searchDelay = new Subject<boolean>();
  ngOnInit(): void {
    this.service.model.subscribe((data) => {
      console.log(data);
    });
    this.getData();

    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {
      this.getData();
    });
  }

  ngOnChange(): void {}

  getData(): void {
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
        this.listOfCurrentPageData = data.records;
        this.total = data.totalCount;
        console.log('list users', this.listOfCurrentPageData);
      });
  }

  reloadTable(): void {
    this.listOfCurrentPageData = [];
    this.setOfCheckedName.clear();
    this.getData();
  }

  isVisibleDelete: boolean = false;
  isVisibleDeleteUsers: boolean = false;
  codeVerify: string;
  showModal() {
    this.codeVerify = '';
    if (this.setOfCheckedName.size == 1) {
      let arrayFromSet = Array.from(this.setOfCheckedName);
      this.userDelete = arrayFromSet[0];
      this.isVisibleDelete = true;
      this.nameModal = this.i18n.fanyi("app.users.deleteUser.deleteUser") + this.userDelete;
    } else if (this.setOfCheckedName.size > 1) {
      this.nameModal = this.i18n.fanyi("app.users.deleteUser.deleteUsers")+ ' ' + this.setOfCheckedName.size + ' ' + this.i18n.fanyi("app.users.deleteUser.deleteUsers2");
      this.isVisibleDeleteUsers = true;
    }
    console.log('user delete', this.userDelete);
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  handleCancelDeleteUsers() {
    this.isVisibleDeleteUsers = false;
  }

  handleOkDelete() {
    this.isVisibleDelete = false;
    if (this.codeVerify == this.userDelete) {
      this.service.deleteUsers(this.setOfCheckedName).subscribe({
        next: (data) => {
          console.log(data);
          this.notification.success(this.i18n.fanyi("app.status.success"), this.i18n.fanyi("app.user.delete.noti.success"));
          this.reloadTable();
        },
        error: (e) => {
          this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.user.delete.noti.fail"));
        },
      });
    } else {
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.user.delete.noti.fail"));
    }
  }

  handleOkDeleteUsers() {
    this.isVisibleDeleteUsers = false;
    if (this.codeVerify == 'delete') {
      this.service.deleteUsers(this.setOfCheckedName).subscribe({
        next: (data) => {
          console.log(data);
          this.notification.success(
            this.i18n.fanyi("app.status.success"),
            this.i18n.fanyi("app.user-group.deleteMany.title") + ' ' + this.setOfCheckedName.size + ' ' + this.i18n.fanyi("app.user.delete.noti.success")
          );
          this.setOfCheckedName.clear();
          this.reloadTable();
        },
        error: (e) => {
          this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.user.delete.noti.fail"));
        },
      });
    } else {
      this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi("app.user.delete.noti.fail"));
    }
  }

  onCurrentPageDataChange(listOfCurrentPageData: User[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData.every(({ userName }) =>
      this.setOfCheckedName.has(userName)
    );
    this.indeterminate =
      listOfEnabledData.some(({ userName }) =>
        this.setOfCheckedName.has(userName)
      ) && !this.checked;
  }

  updateCheckedSet(userName: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedName.add(userName);
    } else {
      this.setOfCheckedName.delete(userName);
    }
  }

  onItemChecked(userName: string, checked: boolean): void {
    this.updateCheckedSet(userName, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData.forEach(({ userName }) =>
      this.updateCheckedSet(userName, checked)
    );
    this.refreshCheckedStatus();
  }

  getUserDetail(userName: any) {
    this.router.navigate(['/app-smart-cloud/users/detail/' + userName]);
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/users/create']);
  }
}
