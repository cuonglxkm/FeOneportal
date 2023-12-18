import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
    private cdr: ChangeDetectorRef,
    ) {}

  ngOnInit(): void {
    this.service.model.subscribe((data) => {
      console.log(data);
    });
    this.getData();
    this.renameModal();
  }

  ngOnChange(): void {}

  getData(): void {
    this.listUserPicked = [];
    this.service.search(this.searchParam, this.pageSize, this.pageIndex).pipe(
      finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    })
    ).subscribe(data => {
      this.listOfUser = data.records;
        console.log(this.listOfUser);
    });
  }

  isVisibleDelete: boolean = false;
  codeVerify: string;
  showModal() {
    if (this.listUserPicked.length == 1) {
      this.userDelete = this.listUserPicked[0];
      this.isVisibleDelete = true;
    }
  }

  renameModal() {
    this.nameModal = "Xóa User " + this.userDelete;
    this.cdr.detectChanges();
  }

  changecodeVerify(e: string) {
    this.codeVerify = e
  }

  handleCancelDelete() {
    this.isVisibleDelete = false;
  }

  handleOkDelete() {
    this.message.success('Xóa thành công');
    this.isVisibleDelete = false;
  }

  changeSearch(e: any): void {
    this.searchParam = e;
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    // this.getSshKeys();
  }

  projectChange(project: ProjectModel) {
    // this.projectId = project.id;
    // this.getSshKeys();
  }

  onClickItem(userName: string) {
    var index = 0;
    var isAdded = true;
    this.listUserPicked.forEach(e => {
      if (e == userName) {
        this.listUserPicked.splice(index, 1);
        isAdded = false;
      }
      index++;
    });
    if (isAdded) {
      this.listUserPicked.push(userName);
    }
    console.log("list user picked", this.listUserPicked);
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

  getUserDetail(id: number) {
    this.router.navigate(['/app-smart-cloud/users/detail/' + id]);
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/users/create']);
  }
}
