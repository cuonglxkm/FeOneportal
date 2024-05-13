import { ShareService } from './../../../../service/share.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CustomRoleComponent } from './custom-role/custom-role.component';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { DatabaseService } from '../../../../service/database.service';
import { RoleService } from '../../../../service/role.service';
import { UpdateRoleComponent } from './update-role/update-role.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject, finalize, takeUntil, EMPTY, isEmpty } from 'rxjs';
import { UtilService } from 'apps/app-mongodb-replicaset/src/app/service/utils.service';
import { NotiStatusEnum } from 'apps/app-mongodb-replicaset/src/app/enum/noti-status.enum';

interface Database {
  db: string;
  coll: string[];
}

@Component({
  selector: 'one-portal-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
})
export class RoleComponent implements OnInit, OnDestroy{

  private destroy$ = new Subject();

  @Input() serviceCode : string;

  roleName = '';
  visible = false;


  listOfDatabase : Database[] = [];
  listOfRole : any = [];
  listOfCustomeRole : string[] = [];
  isShowIntroductionPage : boolean;
  isLocked : boolean;

  isLoading: boolean;

  pageIndex = 1;
  pageSize = 10;
  pageTotal = 0;
  isLoadSearchRole = false;
  isErrorDeleteRole = false
  constructor(
    private drawerService : NzDrawerService,
    private dbService: DatabaseService,
    private roleservice : RoleService,
    private utilService: UtilService,
    private loadingSrv: LoadingService,
    private shareService: ShareService,

  ) {
    this.listOfCustomeRole = []
    this.isLocked = false
    this.isShowIntroductionPage = false
    this.isLoading = false;
  }

  ngOnInit(): void {
    
    // listen event refresh page
    this.shareService.userRoleObs
    .pipe(takeUntil(this.destroy$))
    .subscribe(r => {
      this.searchRole();
    })
    
    this.searchRole();
    this.getListDatabase();
    // this.getAllRole();
    // this.checkRoleUsage()

  }
  
  // checkRoleUsage() {
  //   this.roleservice.getRoleAlreadyUse(this.serviceCode, 'l20').subscribe(
  //     (r : any) => {
  //       console.log("dataaaaaaaa : ", r)
  //     }
  //   )
  // }

  ngOnDestroy(): void {
      this.destroy$.next(null);
      this.destroy$.complete();
  }

  searchRole() {
    this.isLoadSearchRole = true;
    this.roleservice.getallRole(this.serviceCode,this.roleName,this.pageIndex,this.pageSize)
    .pipe(finalize(() => this.isLoadSearchRole = false))
    .subscribe(
      (result: any) => {
        this.pageIndex = result.data.page;
        this.pageSize = result.data.size;
        this.pageTotal = result.data.total;
        this.listOfRole = result.data.data.roles;

        this.updateCustomRoleList();
        this.isShowIntroductionPage = this.listOfRole.length > 0 ? false : true;

      }
    )
  }

  syncData() {
    this.roleservice.syncData(this.serviceCode).subscribe(r => {
      this.searchRole();
    })
  }

  getListDatabase() {
    this.dbService.getDbAndColl(this.serviceCode).subscribe(
      (result: any) => {
        this.listOfDatabase = result
      }
    );
  }

  updateCustomRoleList() {
    this.listOfCustomeRole = []; // Clear existing roles before adding new ones
    this.listOfRole.forEach((item: any) => {
      if (!this.listOfCustomeRole.includes(item.role)) { // Check for duplicates before adding
        this.listOfCustomeRole.push(item.role);
      }
    });
  }

  openFormCreateRole() {
    // open drawer
    const drawerRef = this.drawerService.create<CustomRoleComponent, { serviceCode: string, listOfDatabase: Database[], customRole : string[] }, string>({
      nzTitle: '<b> Thêm mới vai trò </b>',
      nzSize: 'large',
      nzContent: CustomRoleComponent,
      nzContentParams: {serviceCode: this.serviceCode, listOfDatabase: this.listOfDatabase, customRole : this.listOfCustomeRole}
    });
    drawerRef.afterClose.subscribe(()=>this.searchRole())
  }

  closeFormCreateRole() {
    this.visible = false
  }

  removeDuplicateElement(element: string): void {
    const index = this.listOfCustomeRole.indexOf(element);
    if (index !== -1) {
        this.listOfCustomeRole.splice(index, 1);
    }
  }

  updateRole(nameRole : string) {
    this.isLocked = true
    this.removeDuplicateElement(nameRole)

    this.roleservice.getRoleByName(this.serviceCode, nameRole).subscribe(
      (r: any) => {
        if (r && r.code == 200) {
          const drawerRef = this.drawerService.create<UpdateRoleComponent, { serviceCode: string, roleEdit: any, listOfDatabase : Database[], customRole : string[] }, string>({
            nzTitle: '<h3>Sửa quyền</h3>',
            nzSize: 'large',
            nzContent: UpdateRoleComponent,
            nzContentParams: {serviceCode: this.serviceCode, roleEdit: r.data, listOfDatabase: this.listOfDatabase, customRole : this.listOfCustomeRole}
          });
          clearTimeout(timeoutId);
          this.isLocked = false
          drawerRef.afterClose.subscribe(()=>this.searchRole())
        }
      }
    )

    const timeoutId = setTimeout(() => {
      this.isLocked = false
      console.log('Có lỗi xảy ra khi mở form update role')
    }, 15000)
  }

  isVisible = false;
  roleNameDelete   = '';
  deleteRole(nameRole : string) {
    this.isVisible = true;
    this.roleNameDelete = nameRole
  }

  handleOk(roleName : string): void {
    this.loadingSrv.open({type:'spin',text:'Loading...'});
    this.roleservice.deleteRole(roleName, this.serviceCode)
      .subscribe(
        (r: any) => {
          if (r && r.code == 200) {
            this.utilService.showNotification(NotiStatusEnum.SUCCESS,"Thông báo",r.message);
            this.searchRole()
            this.isVisible = false;
            this.isLoading = false;
            clearTimeout(timeOutID);
  
            this.isErrorDeleteRole = false;
            this.isDeleteRole = false;
          } else
            this.utilService.showNotification(NotiStatusEnum.ERROR,"Thông báo",r.message);
          this.loadingSrv.close();
        }
      )
    const timeOutID = setTimeout(() => {
      this.isVisible = false;
      this.isLoading = false;
      console.log('Không thể kết nối tới server.')
    }, 10000);
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  isDeleteRole = false
  roleHadDelete = ''
  showDeleteConfirm(role: any): void {
    this.roleHadDelete = role
    this.isDeleteRole = true;
  }

  listRoleHasUse = []
  confirmDeleteRole() {
    this.checkRoleHasUsage()
    // this.handleOk(this.roleHadDelete)
  }

  checkRoleHasUsage() {
    this.roleservice.getRoleAlreadyUse(this.serviceCode, this.roleHadDelete).subscribe(
      (r : any) => {
        if(r.data.length > 0) {
          this.isErrorDeleteRole = true;
          this.listRoleHasUse = r.data
        } else {
          this.handleOk(this.roleHadDelete)
        }
      }
    )
  }

  handleCancelDeleteRole() {
    this.isErrorDeleteRole = false;
    this.isDeleteRole = false;
  }
 
  tooltipRole(data:any){
    let tt = "";
    data.actions.slice(3).forEach(element => {
      tt += ` [${element}] `;
    });

    return tt;
  }

  resetPageFilter() {
    this.pageIndex = 1;
    this.pageSize = 10;
  }

  changeSize(size: number) {
    this.pageIndex = 1;
    this.pageSize = size;
    this.searchRole();
  }

  changePage(page: number) {
    this.pageIndex = page;
    this.searchRole();
  }

}
