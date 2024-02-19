import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { finalize } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.service.model.subscribe((data) => {
      console.log(data);
    });
    this.getData();
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
      this.nameModal = 'Xóa User ' + this.userDelete;
    } else if (this.setOfCheckedName.size > 1) {
      this.nameModal = 'Xóa ' + this.setOfCheckedName.size + ' User';
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
          this.notification.success('', 'Xóa User thành công');
          this.reloadTable();
        },
        error: (error) => {
          console.log(error.error);
          this.notification.error('', 'Xóa User không thành công');
        },
      });
    } else {
      this.notification.error('', 'Xóa User không thành công');
    }
  }

  handleOkDeleteUsers() {
    this.isVisibleDeleteUsers = false;
    if (this.codeVerify == 'delete') {
      this.service.deleteUsers(this.setOfCheckedName).subscribe({
        next: (data) => {
          console.log(data);
          this.notification.success(
            '',
            'Xóa ' + this.setOfCheckedName.size + ' Users thành công'
          );
          this.setOfCheckedName.clear();
          this.reloadTable();
        },
        error: (error) => {
          console.log(error.error);
          this.notification.error('', 'Xóa Users không thành công');
        },
      });
    } else {
      this.notification.error('', 'Xóa Users không thành công');
    }
  }

  changeSearch(e: any): void {
    this.searchParam = e;
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
