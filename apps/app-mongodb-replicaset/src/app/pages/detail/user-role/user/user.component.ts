import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { LoadingService } from '@delon/abc/loading';
import { AppConstants } from 'apps/app-mongodb-replicaset/src/app/constant/app-constant';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ListUserDbInfo, UserDbInfo } from '../../../../model/userDb.model';
import { UserService } from '../../../../service/user.service';
import { ShareService } from './../../../../service/share.service';
import { UserFormComponent } from './user-form/user-form.component';

@Component({
  selector: 'one-portal-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();

  @Input() serviceCode: string;

  listUser: ListUserDbInfo;
  keySearch = '';

  userInfo: UserDbInfo;
  userName: string;

  selectedUser: UserDbInfo;

  pageIndex = 1;
  pageSize = 10;
  pageTotal = 0;
  isLoad = false;

  // input confirm delete modal
  deleteUserName: string;
  isShowModalDeleteUser = false;
  isSubmitDelete = false;
  isWrongName = true;

  changepassForm = false;
  oldPassVisible = false;
  newPassVisible = false;
  reNewPassVisible = false;
  
  validateForm: FormGroup<{
    userName: FormControl<string>;
    oldPass: FormControl<string>;
    newPass: FormControl<string>;
    reNewPass: FormControl<string>;
  }> = this.fb.group({
    userName: [{value:'',disabled:true}, [Validators.required]],
    oldPass: ['', [Validators.required,Validators.pattern(AppConstants.PASS_REGEX)]],
    newPass: ['', [Validators.required,Validators.pattern(AppConstants.PASS_REGEX)]],
    reNewPass: ['', [Validators.required]]
  });

  constructor(
    private userService: UserService,
    private drawerService: NzDrawerService,
    private loadingSrv: LoadingService,
    private notification: NzNotificationService,
    private shareService: ShareService,
    private fb: NonNullableFormBuilder
  ) { 
  }

  ngOnInit(): void {
    this.searchUser();
        // listen event refresh page
        this.shareService.userRoleObs
        .pipe(takeUntil(this.destroy$))
        .subscribe(r => {
          
          this.searchUser();
    
        })
  }

  ngOnDestroy(): void {
      this.destroy$.next(null);
      this.destroy$.complete();
  }
  
  resetPageFilter() {
    this.pageIndex = 1;
    this.pageSize = 10;
  }

  searchUser() {
    this.isLoad = true;
    this.userService.getUsers(this.serviceCode, this.keySearch.trim(), this.pageIndex, this.pageSize)
    .pipe(finalize(() => this.isLoad = false))
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.mapSearchResponseToModel(r);
      }
    });
  }

  syncUser() {
    this.isLoad = true;
    this.userService.syncUser(this.serviceCode)
    .pipe(finalize(() => this.isLoad = false))
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.mapSearchResponseToModel(r);
      }
    });
  }

  mapSearchResponseToModel(r) {
    this.pageIndex = r.data.page;
    this.pageSize = r.data.size;
    this.pageTotal = r.data.totals;
    this.listUser = new ListUserDbInfo(r.data);
  }
  showModalConfirmDeleteUser(user: UserDbInfo) {
    this.isShowModalDeleteUser = true;
    this.selectedUser = user;
  }

  handleDeleteUser() {
    this.isSubmitDelete = true;
    this.loadingSrv.open({type:'spin',text:'Loading...'})
    this.userService
      .deleteUser(this.serviceCode, this.selectedUser.user)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.notification.success("Thông báo", r.message)
          // setTimeout(() => {
          //   this.roleService.notifyRefreshUserList();
          // }, 1000);
          // console.log('DELETE USER SUCCESS');
          this.searchUser();
        } else {
          this.notification.error("Thông báo",r.message);
          // console.log('DELETE USER ERROR: ', r.message);
          this.searchUser();
        }
        this.loadingSrv.close();
      });
    this.isShowModalDeleteUser = false;
    this.isSubmitDelete = false;
    this.deleteUserName = null;
  }

  handleCloseModalDelete() {
    this.isShowModalDeleteUser = false;
    this.deleteUserName = null;
    this.onInputDeleteUser(null);
  }

  onInputDeleteUser(userName: string) {
    if (userName) {
      if (userName !== this.selectedUser.user) this.isWrongName = true;
      else this.isWrongName = false;
    }
  }

  openForm(formType: string, userName: string) {
    // this.visibleFrom = true;
    // this.userName = userName;
    if (userName != '') {
      this.userService.getUserInfo(this.serviceCode, userName).subscribe(
        (result: any) => {
          // console.log('result:', result);
          this.userInfo = new UserDbInfo(result.data);
          // open drawer
          const drawerRef = this.drawerService.create<UserFormComponent,{ serviceCode: string; userInfo: UserDbInfo; formType: string }, string>({
            nzTitle: '<b>Cập nhật tài khoản</b>',
            nzSize: 'large',
            // nzFooter: 'formFooterTpl',
            nzContent: UserFormComponent,
            nzContentParams: { serviceCode: this.serviceCode, userInfo: this.userInfo, formType: formType },

          });

          drawerRef.afterClose.subscribe(() => this.searchUser());
        }
      );
    } else {
      this.userInfo = new UserDbInfo(null);
      // open drawer
      const drawerRef = this.drawerService.create<
        UserFormComponent,
        { serviceCode: string; userInfo: UserDbInfo; formType: string },
        string
      >({
        nzTitle: '<b>Thêm tài khoản</b>',
        nzSize: 'large',
        // nzFooter: 'formFooterTpl',
        nzContent: UserFormComponent,
        nzContentParams: { serviceCode: this.serviceCode, userInfo: this.userInfo, formType: formType },
      });
      drawerRef.afterClose.subscribe(()=> this.searchUser());
    }
  }

  onFilterUserName() {
    this.resetPageFilter();
    this.searchUser();
  }

  changeSize(size: number) {
    this.pageIndex = 1;
    this.pageSize = size;
    this.searchUser();
  }

  changePage(page: number) {
    this.pageIndex = page;
    this.searchUser();
  }

  otherDB(data:any){
    // console.log("otherDB: ",data);

    const newArray = data.slice(3);
    let text = "";
    newArray.forEach(element => {
      text += ` [@${element}] `
    });
    return text;
  }

  otherUser(data:any[]){
    const newArray = data.slice(3);
    let text = "";
    newArray.forEach(element => {
      let db = (element.db || element.db == "" )? "" : " @ "+ element.db;
      text += ` [${element.role}${db}] `
    });
  return text;
  }

  openChangepass(data:UserDbInfo){
    this.validateForm.reset();
    this.selectedUser = data;
    this.validateForm.controls.userName.setValue(data.user);
    this.changepassForm = true;
  }

  checkOtherPass(){
    const newp = this.validateForm.controls.newPass;
    const old = this.validateForm.controls.oldPass;
    if( !newp.value || !old.value)
      return
    if( newp.value === old.value){
      newp.setErrors({'other': true})
    } else {
      newp.setErrors(null);
    }
  }

  checkNewPass(){
    const newp = this.validateForm.controls.newPass;
    const old = this.validateForm.controls.oldPass;
    const reNewP = this.validateForm.controls.reNewPass;

    if( !newp.value || !old.value)
      return
    if( newp.value === old.value){
      newp.setErrors({'other': true})
    } else {
      newp.setErrors(null);
    }
  }

  checkNewPassDup(){
    const newp = this.validateForm.controls.newPass;
    const reNewP = this.validateForm.controls.reNewPass;
    console.log(newp.value);
    console.log(reNewP.value);
    
    if( !newp.value || !reNewP.value)
      return
    if( newp.value !== reNewP.value){
      reNewP.setErrors({'dupilcate': true})
    } else {
      reNewP.setErrors(null);
    }
  }

  checkReNewPass(){
    const newp = this.validateForm.controls.newPass;
    const reNewP = this.validateForm.controls.reNewPass;
    if( !newp.value || !reNewP.value)
      return
    if( newp.value !== reNewP.value){
      reNewP.setErrors({'dupilcate': true})
    } else {
      reNewP.setErrors(null);
    }
  }

  closeForm(){
    this.changepassForm = false;
  }

  submitForm(){
    this.loadingSrv.open({type:'spin',text:'Loading...'});
    const json= {
      username:this.validateForm.controls.userName.value,
      oldPassword:this.validateForm.controls.oldPass.value,
      newPassword:this.validateForm.controls.newPass.value
    }
    this.userService.changePass(this.serviceCode,json).subscribe(
      (r: any) => {
        if (r && r.code == 200) {
          this.notification.success("Thông báo", r.message)
          this.searchUser();
          this.changepassForm = false;
        } else {
          this.notification.error("Thông báo", r.message);
          this.searchUser();
        }
        this.loadingSrv.close();
      })

  }
}
