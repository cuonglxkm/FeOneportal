import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../../../service/user.service';
import { Role, UserDbInfo } from '../../../../../model/userDb.model';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { DatabaseService } from '../../../../../service/database.service';
import { RoleService } from '../../../../../service/role.service';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { UserRoles } from 'apps/app-mongodb-replicaset/src/app/pipes/UserRoles.pipe';
import { RoleModel } from 'apps/app-mongodb-replicaset/src/app/model/roles.model';
import { AppConstants } from 'apps/app-mongodb-replicaset/src/app/constant/app-constant';

interface requestCreateUserBody {
  user: string;
  pwd: string;
  roles: Role[]; // role co san
  // privileges: privileges[]; // role duoc them
}

interface RolesModel {
  role: string;
  db: string[];
}

@Component({
  selector: 'one-portal-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit, OnDestroy {
  
  @Input() serviceCode: string;
  @Input() userInfo: UserDbInfo;
  @Input() formType: string;

  // isEdit: boolean;
  // isChangePassword: boolean;
  // listCustomRole: Role[];
  // listCustomRoleStr: string[];
  userDbForm: FormGroup;
  ipItems: FormArray;
  buildInRoleItems: FormArray;

  listBuildInRoleStr: string[];
  listOfSelectedBuildInRole: string[] = [];
  listSelectdCustomRole: string[];

  ipv4CidrPattern = AppConstants.IPV4_CIDR_PATTERN
  // listDbStr: string[];

  listOfDatabase: any[];
  listOfCustomRole: any[];

  usernameError: string;
  // oldPasswordError: string;
  passwordError: string;
  checkPasswordError: string;

  passwordVisible: boolean;
  checkPassVisible: boolean;

  pwdTplString: string;
  confirmTplString: string;

  constructor(
    private fb: NonNullableFormBuilder,
    private drawerRef: NzDrawerRef<string>,
    private userService: UserService,
    private dbService: DatabaseService,
    private roleService: RoleService,
    private loadingSrv: LoadingService,
    private notification: NzNotificationService
  ) {

    // this.listDbStr = ['db1', 'db2', 'db3'];

    this.passwordVisible = false;
    this.checkPassVisible = false;

    this.pwdTplString = 'Mật khẩu';

    this.listBuildInRoleStr = ['read', 'readWrite'];

    console.log('userInfo1', this.userInfo);

    // this.userDbForm = this.fb.group({
    //   buildInRoleItems: this.fb.array([]),
    // });

    // this.userDbForm = this.fb.group({
    //   bunchOfRole: this.fb.array([]),
    // });
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    // this.formType = '';
    // this.userInfo = {} as UserDbInfo;
    // this.userInfo.user = '';
    this.drawerRef.close();
  }

  createIpItem(): FormGroup {
    return this.fb.group({
      host: [null, [Validators.required, Validators.pattern(this.ipv4CidrPattern)]],
    });
  }

  addIpItem(): void {
    this.ipItems = this.userDbForm.get('ipItems') as FormArray;
    this.ipItems.push(this.createIpItem());
  }

  deleteIpItem(i: number) {
    this.ipItems = this.userDbForm.get('ipItems') as FormArray;
    if (this.ipItems.length > 0) {
      this.ipItems.removeAt(i);
    }
  }

  createBuildInRoleItem(): FormGroup {
    return this.fb.group({
      buildInRole: '',
      listDb: [],
    });
  }

  addBuildInRole(): void {
    this.buildInRoleItems = this.userDbForm.get(
      'buildInRoleItems' ) as FormArray;
    this.buildInRoleItems.push(this.createBuildInRoleItem());
  }

  deleteBuildInRole(i: number) {
    // console.log("user", this.userDbForm.get('username').value)
    // console.log("userDbForm", this.userDbForm.getRawValue())
    this.buildInRoleItems = this.userDbForm.get(
      'buildInRoleItems'
    ) as FormArray;
    if (this.buildInRoleItems.length > 0) {
      // console.log("asdasdasds: ",this.buildInRoleItems.controls[i].value)
      // console.log("valueeeeee: ",this.buildInRoleItems.at(i).value)
      this.buildInRoleItems.removeAt(i);
    }
  }
  ngOnInit() {
    console.log('userInfo2', this.userInfo);

    this.initUserDbForm();
    this.initDbAndRole();
    // role
    if (this.userInfo.roles) {
      // for (let i = 0; i < this.userInfo.roles.length; i++) {
      //   this.listSelectdCustomRole.push(this.userInfo.roles[i].role)
      // }
      this.userInfo.roles = this.transform(this.userInfo.roles);
      this.userInfo.roles.forEach((item: Role) => {
        if (this.isSelected(this.listBuildInRoleStr, item.role)) {
          this.buildInRoleItems = this.userDbForm.get(
            'buildInRoleItems'
          ) as FormArray;
          this.buildInRoleItems.push(this.fb.group({
            buildInRole: item.role,
            listDb: [item.db.split(",").map(item => item.trim())],
          }));
        }
      })
    }
    if (this.userInfo.restrict_ips) {
      this.userInfo.restrict_ips.forEach((ip: string) => {
        console.log("ipppppp", ip)
        this.ipItems = this.userDbForm.get(
          'ipItems'
        ) as FormArray;
        this.ipItems.push(this.fb.group({
          host: ip,
        }));
      })
    }


    console.log('userInfo3', this.userInfo);
    // console.log("userName: ", this.userName)
  }

  transform(roles: RoleModel[]): RoleModel[] {
    const uniqueRoles: string[] = Array.from(new Set(roles.map(roleObj => roleObj.role)));

    const transformedRoles = uniqueRoles.map(role => {

        const filteredRoles = roles.filter(roleObj => roleObj.role === role);
        
        const db = filteredRoles.map(roleObj => roleObj.db).join(', ');

        return new RoleModel(role , db);
    });

    return transformedRoles;
  }

  initDbAndRole() {
    this.dbService.getAllDatabase(this.serviceCode).subscribe((r: any) => {
      if (r && r.code == 200) {
        this.listOfDatabase = r.data.map((item: any) => ({
          ...item,
          isSelected: false,
        }));
      } else {
        console.log('getAllDatabase that bai: ', r.message);
      }
      console.log('listDb: ', this.listOfDatabase);
    });

    this.roleService.getallRole(this.serviceCode,'',1,1000).subscribe((r: any) => {
      if (r && r.code == 200) {
        console.log('r.data role:', r.data);
        this.listOfCustomRole = r.data.data.roles.map((item: any) => ({
          ...item,
          isSelected: false,
        }));
        this.listSelectdCustomRole = this.userInfo.roles
        .filter((item) => {return !this.listBuildInRoleStr.includes(item['role']);})
        .map(item => item['role']); 
        // this.listOfCustomRole = r.data.map((item: any) => ({
        //   ...item,
        //   isSelected: false,
        // }));
      } else {
        console.log('getallRole that bai: ', r.message);
        // this.listUser = this.mockListUser();
      }
      console.log('listOfCustomRole: ', this.listOfCustomRole);
    });
  }

  initUserDbForm() {
    // this.isChangePassword = true;
    this.pwdTplString =
      this.formType == 'changePass' ? 'Mật khẩu cũ' : 'Mật khẩu';

    this.buildInRoleItems = this.fb.array([]);
    this.ipItems = this.fb.array([]);

    if (this.formType == 'create') {
      this.userDbForm = this.fb.group({
        ipItems: this.fb.array([]),
        buildInRoleItems: this.fb.array([]),
        username: [
          {
            value: this.userInfo.user,
            disabled: this.formType == 'create' ? false : true,
          },
          [
            Validators.required,
            Validators.maxLength(64),
            Validators.minLength(4),
            Validators.pattern(/^[a-zA-Z0-9]+$/),
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.maxLength(64),
            Validators.minLength(8),
            Validators.pattern(
              AppConstants.PASS_REGEX
            ),
          ],
        ],
        checkPassword: [
          '',
          [Validators.required],
        ],
        customRole: [],
      });
    } else if (this.formType == 'update') {
      this.userDbForm = this.fb.group({
        ipItems: this.fb.array([]),
        buildInRoleItems: this.fb.array([]),
        username: [
          {
            value: this.userInfo.user,
            disabled: true,
          },
        ],
        customRole: [],
      });
    }

  }

  closeForm() {
    // this.visibleFrom = false;
    // this.visibleFromChange.emit(false);
    this.drawerRef.close();
  }

  get listRoleItem(): any {
    return this.userDbForm.controls['buildInRoleItems'];
  }

  get listIpItem(): any {
    return this.userDbForm.controls['ipItems'];
  }

  submitForm() {
    console.log('submitForm');
    this.loadingSrv.open({type:'spin',text:"Loading..."})
    if (this.formType == 'create') {
      const authenticationRestriction = {
        clientSource: []
      }
      const req = {
        service_order_code: this.serviceCode,
        user: this.userDbForm.get('username').value,
        pwd: this.userDbForm.get('password').value,
        roles: [],
        authenticationRestrictions: [],
      };
      // buildInRole
      for (let i = 0; i < this.listRoleItem.length; i++) {
        if (this.listRoleItem.at(i).get('listDb').value) {
          for (
            let j = 0;
            j < this.listRoleItem.at(i).get('listDb').value.length;
            j++
          ) {
            req.roles.push({
              role: this.listRoleItem.at(i).get('buildInRole').value,
              db: this.listRoleItem.at(i).get('listDb').value[j],
              builtInRole: true
            });
          }
        } else {
          req.roles.push({
            role: this.listRoleItem.at(i).get('buildInRole').value,
            db: '',
            builtInRole: true
          });
        }
      }
      // customRole
      if (this.userDbForm.get('customRole').value) {
        for (let i = 0; i < this.userDbForm.get('customRole').value.length; i++) {
          req.roles.push({
            role: this.userDbForm.get('customRole').value[i],
            db: 'admin',
            builtInRole: false
          });
        }
      }
      // authenticationRestrictions
      for (let i = 0; i < this.listIpItem.length; i++) {
        authenticationRestriction.clientSource.push(this.listIpItem.value[i].host)
      }
      req.authenticationRestrictions.push(authenticationRestriction)
      // console.log('createUser body:', req);

      this.userService.createUser(req)
        .subscribe((r: any) => {
          if (r && r.code == 200) {
            this.drawerRef.close();
            this.notification.success("Thông báo",r.message);
            console.log("CREATE USER SUCCESS")
          } else {
            this.notification.error("Thông báo",r.message);
            console.log("CREATE USER ERROR: ", r.message)
          }
          this.loadingSrv.close();
        })


    } else if (this.formType == 'update') {
      const authenticationRestriction = {
        clientSource: []
      }
      const req = {
        user: this.userDbForm.get('username').value,
        db: 'admin',
        roles: [],
        authenticationRestrictions: [],
      };

      console.log('updateUser body role1:', req.roles);
      // buildInRole
      for (let i = 0; i < this.listRoleItem.length; i++) {
        if (this.listRoleItem.at(i).get('listDb').value) {
          for (
            let j = 0;
            j < this.listRoleItem.at(i).get('listDb').value.length;
            j++
          ) {
            req.roles.push({
              role: this.listRoleItem.at(i).get('buildInRole').value,
              db: this.listRoleItem.at(i).get('listDb').value[j],
              builtInRole: true
            });
          }
        } else {
          req.roles.push({
            role: this.listRoleItem.at(i).get('buildInRole').value,
            db: '',
            builtInRole: true
          });
        }
      }
      console.log('updateUser body role2:', req.roles);

      // customRole
      if (this.userDbForm.get('customRole').value) {
        for (let i = 0; i < this.userDbForm.get('customRole').value.length; i++) {
          if (!this.isSelected(this.listBuildInRoleStr, this.userDbForm.get('customRole').value[i])) {
            req.roles.push({
              role: this.userDbForm.get('customRole').value[i],
              db: 'admin',
              builtInRole: false
            });
          }
        }
      }
      console.log('updateUser body role3:', req.roles);

      // authenticationRestrictions
      for (let i = 0; i < this.listIpItem.length; i++) {
        authenticationRestriction.clientSource.push(this.listIpItem.value[i].host)
      }
      req.authenticationRestrictions.push(authenticationRestriction)

      console.log('updateUser body:', req);


      this.userService.updateUser(this.serviceCode, req)
        .subscribe((r: any) => {
          if (r && r.code == 200) {
            this.drawerRef.close();
            this.notification.success("Thông báo",r.message);
            console.log("UPDATE USER SUCCESS")
          } else {
            this.notification.error("Thông báo",r.message);
            console.log("UPDATE USER ERROR: ", r.message)
          }
          this.loadingSrv.close();
        })

    }
    
  }

  // isNotSelected(list: string[], value: string): boolean {
  //   return list.indexOf(value) === -1;
  // }

  isSelected(list: string[], role: string): boolean {
    for (let i = 0; i < list.length; i++) {
      if (list[i] == role) {
        return true;
      }
    }
    return false;
  }

  // -------------------------------------------------

  validateUsername() {
    const usernameControl = this.userDbForm.get('username');
    if (usernameControl.hasError('required')) {
      this.usernameError = 'Tên tài khoản không được để trống';
    } else if (
      usernameControl.hasError('minlength') ||
      usernameControl.hasError('maxlength')
    ) {
      this.usernameError =
        'Tên tài khoản phải có tối thiểu 4 ký tự và tối đa 64 ký tự';
    } else if (usernameControl.hasError('pattern')) {
      this.usernameError =
        'Tên tài khoản chỉ bao gồm chữ thường, chữ hoa hoặc chữ số';
    }
    console.log('validateUsername(): {}', usernameControl.valid);
  }

  validatePassword() {
    const passwordControll = this.userDbForm.get('password');
    if (passwordControll.hasError('required')) {
      this.passwordError = `${this.pwdTplString} không được để trống`;
    } else if (
      passwordControll.hasError('minlength') ||
      passwordControll.hasError('maxlength')
    ) {
      this.passwordError = `${this.pwdTplString} phải có tối thiểu 8 ký tự và tối đa 64 ký tự`;
    } else if (passwordControll.hasError('pattern')) {
      this.passwordError = `${this.pwdTplString} phải bao gồm chữ thường, chữ hoa, số, ký tự đặc biệt và không được chứa dấu cách`;
    }
    const checkPasswordControl= this.userDbForm.get('checkPassword')
    
    if(passwordControll.value == '' || checkPasswordControl.value == ''){}
    else if(passwordControll.value === checkPasswordControl.value){
      this.checkPasswordError = ''
      checkPasswordControl.setErrors(null);
    }
    else{
      checkPasswordControl.setErrors({'confirmPassword': true})
      this.checkPasswordError = `Mật khẩu xác nhận không khớp`;
    }
  }

  //   Promise.resolve().then(() => {
  //     this.userDbForm.controls.checkPassword.updateValueAndValidity();
  //     this.validateCheckPassword();
  //   });
  // }

  validateCheckPassword() {
    const passwordControll = this.userDbForm.get('password');
    const checkPasswordControll = this.userDbForm.get('checkPassword');
    

    if (checkPasswordControll.hasError('required')) {
      this.checkPasswordError = `Mật khẩu xác nhận không được để trống`;
    } else if(passwordControll.value === checkPasswordControll.value)
      checkPasswordControll.setErrors(null);
    else
    checkPasswordControll.setErrors({'confirmPassword': true})
    
    if (checkPasswordControll.hasError('confirmPassword')) {
      this.checkPasswordError = `Mật khẩu xác nhận không khớp`;
    }
  }

  confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return { required: true };
    } else {
      const password = this.userDbForm.controls.password;

      if (control.value !== password.value) return { confirmPassword: true };
    }
    return null;
  }

  checkHide(item){
    const listSelected : string[] = this.userDbForm.controls['buildInRoleItems'].value.map(a => a.buildInRole);
    return listSelected.includes(item);
  }

  onValidateIP() {
    if (this.userDbForm.get('ipItems')['controls'].length <= 1)
      return
    let values = this.userDbForm.get('ipItems')['controls'];
    let hostList: string[] = [];
    values.forEach((formGroup: FormGroup) => {
      hostList.push(formGroup.value.host);
    });
    let findDuplicates: string[] = hostList.filter((item, index) => hostList.indexOf(item) !== index)
    
    values.forEach((element, i) => {
      if (findDuplicates.includes(element.value.host)) {
        this.listIpItem.at(i).markAsDirty()
        this.listIpItem.at(i).controls.host.setErrors({ duplicate: true });
      } else {
        delete this.listIpItem.at(i).controls.host.errors?.duplicate;
        this.listIpItem.at(i).controls.host.updateValueAndValidity()
      }
    });
  }
}
