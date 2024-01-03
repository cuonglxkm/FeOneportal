import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { RegionModel } from '../../shared/models/region.model';
import { ProjectModel } from '../../shared/models/project.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/shared/services/user.service';
import { finalize } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'one-portal-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent implements OnInit {
  regionId: number;
  projectId: number;
  listOfUser: User[] = [];
  pageIndex = 1;
  pageSize = 10;
  total: number = 3;
  baseResponse: BaseResponse<User[]>;
  id: any;
  searchParam: string;
  loading = true;

  userDelete: string;
  listUserPicked = [];
  nameModal: string;

  constructor(
    private service: UserService,
    private router: Router,
    public message: NzMessageService,
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
    this.listUserPicked = [];
    this.listCheckedInPage = [];
    this.checkedAllInPage = false;
    this.service
      .search(this.searchParam, this.pageSize, this.pageIndex)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data) => {
        this.listOfUser = data.records;
        console.log("list users", this.listOfUser);
      });
  }

  isVisibleDelete: boolean = false;
  isVisibleDeleteUsers: boolean = false;
  codeVerify: string;
  showModal() {
    if (this.listUserPicked.length == 1) {
      this.userDelete = this.listUserPicked[0];
      this.isVisibleDelete = true;
      this.nameModal = 'Xóa User ' + this.userDelete;
    } else if (this.listUserPicked.length > 1) {
      this.nameModal = 'Xóa ' + this.listUserPicked.length + ' User';
      this.isVisibleDeleteUsers = true;
    }
  }

  changecodeVerify(e: string) {
    this.codeVerify = e;
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
      this.service.deleteUsers(this.listUserPicked).subscribe((data) => {
        console.log(data);
        this.message.success('Xóa User thành công');
        this.reloadTable();
      }, 
      (error) => {
        console.log(error.error);
        this.message.error('Xóa User không thành công')
      });
    } else {
      this.message.error('Xóa User không thành công')
    }
  }

  handleOkDeleteUsers() {
    this.isVisibleDeleteUsers = false;
    if (this.codeVerify == 'delete') {
      this.service.deleteUsers(this.listUserPicked).subscribe((data) => {
        console.log(data);
        this.message.success('Xóa ' + this.listUserPicked.length + ' Users thành công');
        this.reloadTable();
      }, 
      (error) => {
        console.log(error.error);
        this.message.error('Xóa Users không thành công')
      });
    } else {
      this.message.error('Xóa Users không thành công')
    }
  }

  changeSearch(e: any): void {
    this.searchParam = e;
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    // this.getSshKeys();
  }

  onProjectChange(project: ProjectModel) {
    this.projectId = project.id;
    // this.getSshKeys();
  }

  onClickItem(userName: string, checked: any) {
    var index = 0;
    var isAdded = true;
    this.listUserPicked.forEach((e) => {
      if (e == userName) {
        this.listUserPicked.splice(index, 1);
        isAdded = false;
      }
      index++;
    });
    if (isAdded) {
      this.listUserPicked.push(userName);
    }
    if (this.listUserPicked.length == this.listOfUser.length) {
      this.checkedAllInPage = true;
    } else {
      this.checkedAllInPage = false;
    }
    console.log('list user picked', this.listUserPicked);
  }

  listCheckedInPage = [];
  checkedAllInPage = false;
  onChangeCheckAll(checked: any) {
    let listChecked = [];
    this.listOfUser.forEach(() => {
      listChecked.push(checked);
    });
    this.listCheckedInPage = listChecked;
    if (checked == true) {
      this.listUserPicked = [];
      this.listOfUser.forEach(e => {
        this.listUserPicked.push(e.userName);
      });
    } else {
      this.listUserPicked = [];
    }

    console.log('list user picked', this.listUserPicked);
    this.cdr.detectChanges();
  }

  onPageSizeChange(event: any) {
    // this.size = event
    // this.getSshKeys();
  }

  onPageIndexChange(event: any) {
    // this.index = event;
    // this.getSshKeys();
  }

  reloadTable(): void {
    this.listOfUser = [];
    this.getData();
  }

  getUserDetail(userName: any) {
    this.router.navigate(['/app-smart-cloud/users/detail/' + userName]);
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/users/create']);
  }
}
