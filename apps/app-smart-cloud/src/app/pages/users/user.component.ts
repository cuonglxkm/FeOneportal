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

  userDelete: User;
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
    // this.service.getData(this.ipAddress, this.status, this.customerId, this.regionId, this.isCheckState, this.size, this.index)
    //   .subscribe(baseResponse => {
    //   this.listOfIp = baseResponse.records;
    //     console.log(this.listOfIp);
    // });
    this.service.getUsers().pipe(
      finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    })
    ).subscribe(baseResponse => {
      this.listOfUser = baseResponse.records;
        console.log(this.listOfUser);
    });
  }

  isVisibleDelete: boolean = false;
  codeVerify: string;
  showModal() {
    this.isVisibleDelete = true;
  }

  renameModal() {
    this.nameModal = "Xóa User" + ' this.userDelete.name';
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

  onPageSizeChange(event: any) {
    // this.size = event
    // this.getSshKeys();
  }

  onPageIndexChange(event: any) {
    // this.index = event;
    // this.getSshKeys();
  }

  getUserDetail(id: number) {
    this.router.navigate(['/app-smart-cloud/users/detail/' + id]);
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/users/create']);
  }
}