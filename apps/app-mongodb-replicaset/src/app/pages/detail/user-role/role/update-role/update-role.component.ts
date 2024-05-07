import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { DatabaseService } from '../../../../../service/database.service';
import { RoleService } from '../../../../../service/role.service';
import { CookieService } from '@delon/util/browser';
import { LoadingService } from '@delon/abc/loading';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { log } from '@delon/util/other';
import { UtilService } from 'apps/app-mongodb-replicaset/src/app/service/utils.service';
import { NotiStatusEnum } from 'apps/app-mongodb-replicaset/src/app/enum/noti-status.enum';

interface Database {
  db: string;
  coll: string[];
}

interface DB {
  db: string;
  collection: string;
}

interface privileges {
  resource: DB;
  actions: string[];
}

interface customRolesDetail {
  role: string;
  db: string;
}

interface requestRoleBody {
  service_order_code: string;
  createRole: string;
  roles: customRolesDetail[]; // role co san
  privileges: privileges[]; // role duoc them
}

interface updateRoleBody {
  service_order_code: string;
  updateRole: string;
  roles: customRolesDetail[]; // role co san
  privileges: privileges[]; // role duoc them
}

@Component({
  selector: 'one-portal-update-role',
  templateUrl: './update-role.component.html',
  styleUrls: ['./update-role.component.css'],
})
export class UpdateRoleComponent {

  @Input() roleEdit : any;
  @Input() listOfDatabase : Database[] | any;
  @Input() customRole : string[] | any;

  roleName: string | any;
  listOfCollectionActions: string[];
  listOfDiagnosticsAction: string[];
  // value: string[] | any;
  bunchOfTreeNodePrivileges : NzTreeNodeOptions[][];
  bunchOfTreeNodeDatabase : NzTreeNodeOptions[][];
  databaseCheckKey: string[][] = [];
  privilegesCheckKey: string[][] = [];

  indexOfForm : number;
  myForm: FormGroup;
  @Input() serviceCode : string;

  listOfDbAndCollUpdate : Database[] = [];
  listOfPrivilegesUpdate : string[] = [];


  get bunchOfRole(): any {
    return this.myForm.controls['bunchOfRole'];
  }

  constructor(
    private fb: FormBuilder,
    private drawerRef: NzDrawerRef<string>,
    private ref: ChangeDetectorRef,
    private dbService: DatabaseService,
    private roleService : RoleService,
    private loadingSrv: LoadingService,
    private utilService: UtilService
  ) {
    this.roleName = '';
    this.listOfCollectionActions = [
      'find',
      'insert',
      'remove',
      'update',
      'bypassDocumentValidation',
      'createCollection',
      'createIndex',
      'dropCollection',
      'changeStream',
      'collMod',
      'compact',
      'convertToCapped',
      'dropIndex',
      'reIndex',
      'collStats',
      'dbHash',
      'listIndexes',
      'validate',
    ];
    this.listOfDiagnosticsAction = ['listCollections'];
    this.bunchOfTreeNodePrivileges = [];
    this.bunchOfTreeNodeDatabase = [];
    this.indexOfForm = 0;
    this.myForm = this.fb.group({
      createName: ['', [Validators.required, Validators.maxLength(256), Validators.pattern('^[a-zA-Z0-9_-]{1,256}$')]],
      bunchOfRole: this.fb.array([]),
    });
  }

  compareArray(arrFirst: string[], arrSecond: string[]): boolean {
    arrFirst.sort();
    arrSecond.sort();

    if (arrFirst.length != arrSecond.length) {
      return false;
    } else {
      const isEqual = arrFirst.every((value, index) => value === arrSecond[index]);
      if (isEqual) {
          return true
      } else {
          return false
      }
    }
  }

  initDataEdit() {
    this.myForm.get('createName').setValue(this.roleEdit.roles[0].role)
    // this.roleName = this.roleEdit.roles[0].role
    const uniqueArray: string[][] = [];
    if(this.roleEdit.roles[0].privileges.length > 0) {

      // Tìm mảng chỉ cuất hiện 1 lần
      for (let i = 0; i < this.roleEdit.roles[0].privileges.length; i++) {
        this.roleEdit.roles[0].privileges[i].actions.sort();
        const isUnique = !uniqueArray.some(
          (existingArray) =>
            existingArray.length === this.roleEdit.roles[0].privileges[i].actions.length &&
            existingArray.every(
              (value, index) =>
                value === this.roleEdit.roles[0].privileges[i].actions[index]
            )
        );
        if (isUnique) {
          uniqueArray.push(this.roleEdit.roles[0].privileges[i].actions);
        }
      }

      // Tìm database và collection đã được chọn.
      for(let i = 0; i < uniqueArray.length; i++) {
        const listDBChoosen : string[] = []
        for(let j = 0; j < this.roleEdit.roles[0].privileges.length; j++) {
          if(this.compareArray(uniqueArray[i], this.roleEdit.roles[0].privileges[j].actions)) {

            // handle resource 
            if(this.roleEdit.roles[0].privileges[j].resource.collection == '') {
              listDBChoosen.push(this.roleEdit.roles[0].privileges[j].resource.db+'@'+'allCollection')
            } else {
              listDBChoosen.push(this.roleEdit.roles[0].privileges[j].resource.db+'@'+this.roleEdit.roles[0].privileges[j].resource.collection)
            }
          }
        }
        this.databaseCheckKey[i] = listDBChoosen
        const nodeDatabase : NzTreeNodeOptions[] = this.convertDatabaseToTreeSelect(i);
        this.bunchOfTreeNodeDatabase.push(nodeDatabase);
      }

      // Tìm privileges được chọn
      for(let i = 0; i < uniqueArray.length; i++) {
        this.privilegesCheckKey[i] = []
        const nodePrivileges : NzTreeNodeOptions[] = this.convertPrivilegesDataToTreeSelect(i);
        nodePrivileges.forEach( item  => {
          item.children?.forEach( child  => {
            if(uniqueArray[i].includes(child.title)) {
              this.privilegesCheckKey[i].push(child.key)
              child.checked = true
            }
          })
        })
        this.bunchOfTreeNodePrivileges.push(nodePrivileges)
      }
    }

    // Khởi tạo 
    const nodePrivileges : NzTreeNodeOptions[] = this.convertPrivilegesDataToTreeSelect(uniqueArray.length);
    const nodeDatabase : NzTreeNodeOptions[] = this.convertDatabaseToTreeSelect(uniqueArray.length);
    if(this.roleEdit.roles[0].roles.length > 0) {
      this.privilegesCheckKey[uniqueArray.length] = []
      for(let i = 0; i <  this.roleEdit.roles[0].roles.length; i++) {
        this.privilegesCheckKey[uniqueArray.length].push('Custom Role '+(uniqueArray.length)+ ' ' + this.roleEdit.roles[0].roles[i].role)
      }
      this.bunchOfTreeNodePrivileges.push(nodePrivileges)
      this.bunchOfTreeNodeDatabase.push(nodeDatabase);
    }
  }

  ngOnInit() {
    this.initDataEdit();
    this.bunchOfTreeNodePrivileges.forEach( (item : any) => {
      const lessonForm = this.fb.group({
        privileges: [item, Validators.required],
        database: [this.bunchOfTreeNodeDatabase[this.indexOfForm], Validators.required],
      });
      this.indexOfForm++;
      this.bunchOfRole.push(lessonForm);
    })
  }


  add() {
    // const privileges = this.convertPrivilegesDataToTreeSelect(this.indexOfForm)
    this.bunchOfTreeNodePrivileges.push(this.convertPrivilegesDataToTreeSelect(this.indexOfForm));
    this.bunchOfTreeNodeDatabase.push(this.convertDatabaseToTreeSelect(this.indexOfForm))
    const lessonForm = this.fb.group({
      privileges: ['', Validators.required],
      database: ['', Validators.required],
    });
    this.indexOfForm++;
    this.bunchOfRole.push(lessonForm);
  }

  delete(i: number) {
    if (this.bunchOfRole.length != 1) {
      this.bunchOfRole.removeAt(i);
      this.bunchOfTreeNodePrivileges.splice(i, 1);
      this.bunchOfTreeNodeDatabase.splice(i, 1);
    }
  }

  convertDatabaseToTreeSelect(index : number) : NzTreeNodeOptions[] {

    const rs : NzTreeNodeOptions[] = [];

    for (let i = 0; i < this.listOfDatabase.data.length; i++) {
      const listchild: NzTreeNodeOptions[] = [];
      for (let j = 0; j < this.listOfDatabase.data[i].coll.length; j++) {
        const children: NzTreeNodeOptions = {
          title: this.listOfDatabase.data[i].coll[j],
          value: this.listOfDatabase.data[i].coll[j],
          key: this.listOfDatabase.data[i].db + '@' + this.listOfDatabase.data[i].coll[j],
          isLeaf: true,
        };
        listchild.push(children);
      } 

      const parent: NzTreeNodeOptions = {
        title: this.listOfDatabase.data[i].db,
        value: this.listOfDatabase.data[i].db,
        key: this.listOfDatabase.data[i].db+'@allCollection',
        children: listchild,
        checked: true
      };
      rs.push(parent);
    }

    return rs;

  }

  convertPrivilegesDataToTreeSelect(index : number) : NzTreeNodeOptions[] {
    const rs : NzTreeNodeOptions[] = []

    // add collection actions
    let listOfChildren: NzTreeNodeOptions[] = [];
    this.listOfCollectionActions.forEach((item : any) => {
      const chilren: NzTreeNodeOptions = {
        title: item,
        value: item,
        key: 'Collection Actions ' + index + ' ' + item,
        isLeaf: true,
      };
      listOfChildren.push(chilren);
    });

    const data1: NzTreeNodeOptions = {
      title: 'Collection Actions',
      value: 'Collection Actions',
      key: 'Collection Actions ' + index,
      children: listOfChildren,
    };
    rs.push(data1);

    // add data diagnostics Action
    listOfChildren = [];
    this.listOfDiagnosticsAction.forEach((item : any) => {
      const chilren: NzTreeNodeOptions = {
        title: item,
        value: item,
        key:'Diagnostic Actions '+index+' '+item,
        isLeaf: true,
      };
      listOfChildren.push(chilren);
    });
    const data2: NzTreeNodeOptions = {
      title: 'Diagnostic Actions',
      value: 'Diagnostic Actions',
      key: 'Diagnostic Actions '+index,
      children: listOfChildren,
    };
    rs.push(data2);

    // add custom role
    listOfChildren = [];
    this.customRole.forEach((item : any) => {
      const chilren: NzTreeNodeOptions = {
        title: item,
        value: item,
        key:'Custom Role '+index+' '+item,
        isLeaf: true,
      };
      listOfChildren.push(chilren);
    });
    const data3: NzTreeNodeOptions = {
      title: 'Custom Role',
      value: 'Custom Role',
      key: 'Custom Role '+index,
      children: listOfChildren,
    };
    rs.push(data3);

    return rs
  }

  onChangePrivileges(event : Event[], index: number) {
    if(event == undefined) event = [];

    if(event.length != 0 ) {
      this.bunchOfRole.at(index).get('database').enable()
      if (this.bunchOfRole.at(index).get('privileges').value[0].includes('Diagnostic Actions')) {
        this.bunchOfTreeNodeDatabase[index].forEach((item: any) => {
          item.isLeaf = true
          item.expanded = true
        });
      } else if (this.bunchOfRole.at(index).get('privileges').value[0].includes('Custom Role')) {
        console.log('Custome role')
        this.bunchOfRole.at(index).get('database').disable()
      }

      this.bunchOfTreeNodePrivileges[index].forEach((item: any) => {
        if (!this.bunchOfRole.at(index).get('privileges').value[0].includes(item.key)) {
          item.disabled = true
          item.isLeaf = true
        }
      });

      this.bunchOfTreeNodeDatabase[index] = [...this.bunchOfTreeNodeDatabase[index]]
      this.bunchOfTreeNodePrivileges[index] = [...this.bunchOfTreeNodePrivileges[index]]
    } else {
      this.bunchOfTreeNodeDatabase[index].forEach((item: any) => {
        item.disabled = false
        item.isLeaf = false
        item.expanded = false
      });

      this.bunchOfTreeNodePrivileges[index].forEach((item : any) => {
        item.disabled = false
        item.isLeaf = false
      });

      this.bunchOfTreeNodeDatabase[index] = [...this.bunchOfTreeNodeDatabase[index]]
      this.bunchOfTreeNodePrivileges[index] = [...this.bunchOfTreeNodePrivileges[index]]
    }
  }

  
  createRole() {
    this.loadingSrv.open({type:'spin',text:'Loading...'})
    const req: updateRoleBody = {
      service_order_code: this.serviceCode,
      updateRole: this.myForm.get('createName').value,
      roles: [],
      privileges: [],
    };

    const listCustom : customRolesDetail[] = []

    req.updateRole = this.myForm.get('createName').value;
    for (let i = 0; i < this.bunchOfRole.length; i++) {
      let listPri : string[] = [];
      // privileges
      for(let j = 0; j < this.bunchOfRole.at(i).get('privileges').value.length ; j++) {
        if(this.bunchOfRole.at(i).get('privileges').value[j] == ('Collection Actions '+i)) {
          listPri = this.listOfCollectionActions
        } else if(this.bunchOfRole.at(i).get('privileges').value[j] == ('Diagnostic Actions '+i)) {
          listPri = this.listOfDiagnosticsAction
        } else if ( this.bunchOfRole.at(i).get('privileges').value[j] == ('Custom Role '+i) ){
          this.customRole.forEach( (item: any) => {
            const c : customRolesDetail = {
              role : item,
              db : 'admin'
            }
            listCustom.push(c)
          })
        } else if(this.bunchOfRole.at(i).get('privileges').value[j].includes('Collection Actions '+i)) {
          listPri.push(this.bunchOfRole.at(i).get('privileges').value[j].replace(('Collection Actions '+i+' '), ''))
        } else if (this.bunchOfRole.at(i).get('privileges').value[j].includes('Diagnostic Actions '+i)) {
          listPri.push(this.bunchOfRole.at(i).get('privileges').value[j].replace(('Diagnostic Actions '+i+' '), ''))
        } else if(this.bunchOfRole.at(i).get('privileges').value[j].includes('Custom Role '+i)) {
          const c : customRolesDetail = {
            role : this.bunchOfRole.at(i).get('privileges').value[j].replace(('Custom Role '+i+' '), ''),
            db : 'admin'
          }
          listCustom.push(c)
        }
      }
      // database
      if(this.bunchOfRole.at(i).get('database').value != undefined) {
        for(let j = 0; j < this.bunchOfRole.at(i).get('database').value.length ; j++) {
          const dbtemp : DB = {
            db : '',
            collection : ''
          }
          if(this.bunchOfRole.at(i).get('database').value[j].includes("allCollection")) {
            const db = this.bunchOfRole.at(i).get('database').value[j].split('@')[0];
            dbtemp.db = db;
          } else {
            const coll = this.bunchOfRole.at(i).get('database').value[j].split('@')[1];
            const db = this.bunchOfRole.at(i).get('database').value[j].split('@')[0];
            dbtemp.db = db;
            dbtemp.collection = coll;
          }
          const pritmp : privileges = {
            resource : dbtemp,
            actions : listPri
          }
          req.privileges.push(pritmp);
        }
      }
    }

    req.roles = listCustom
    // add role
    this.roleService.updateRole(req)
    .subscribe((r: any) => {
      if (r && r.code == 200) {
        this.drawerRef.close();
        setTimeout(() => {
          this.roleService.notifyRefreshUserList();
        }, 1000);
        console.log("update thanh cong");
        this.utilService.showNotification(NotiStatusEnum.SUCCESS,r.message,"Thông báo")
      } else
        this.utilService.showNotification(NotiStatusEnum.ERROR,r.message,"Thông báo")
      this.loadingSrv.close();
    })
  }

  submit() {
    console.log('click submit');
  }

  closeDrawer() {
    this.drawerRef.close();
  }

}
