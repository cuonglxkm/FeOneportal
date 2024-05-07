import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzFormatEmitEvent, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { DatabaseService } from '../../../../../service/database.service';
import { RoleService } from '../../../../../service/role.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LoadingService } from '@delon/abc/loading';
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

interface requestRoleBodyUpdate {
  service_order_code: string;
  updateRole: string;
  roles: customRolesDetail[]; // role co san
  privileges: privileges[]; // role duoc them
}

@Component({
  selector: 'one-portal-custom-role',
  templateUrl: './custom-role.component.html',
  styleUrls: ['./custom-role.component.css'],
})
export class CustomRoleComponent implements OnInit {

  @Input() listOfDatabase : Database[] | any;
  @Input() customRole : string[];
  @Input() serviceCode : string;

  roleName: string;
  listOfCollectionActions: string[];
  listOfDiagnosticsAction: string[];
  bunchOfTreeNodePrivileges : NzTreeNodeOptions[][];
  bunchOfTreeNodeDatabase : NzTreeNodeOptions[][];
  indexOfForm : number;
  myForm: FormGroup;
  isRoleDuplicate = false;
  disableButtonSubmit = false;

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
    private utilService : UtilService
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

  }

  ngOnInit() {
    this.myForm = this.fb.group({
      createName: ['', [Validators.required, Validators.maxLength(256), Validators.pattern('^[a-zA-Z0-9_-]{1,256}$')]],
      bunchOfRole: this.fb.array([]),
    });
    this.add();
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
      this.bunchOfTreeNodePrivileges.splice(i, 1)
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

  onChangeRoleName() {
    if(this.roleName != '' && this.myForm.valid) {
      this.disableButtonSubmit = true
    } else {
      this.disableButtonSubmit = false
    }
  }

  cal(event: string) {
    console.log(this.myForm.controls);
  }

  onChangeDatabase(event : string[], index : number) {
    console.log('on change database with index', event, index)
    if(event.length == 0) {

      console.log('event == 0 ', this.bunchOfRole.at(index).get('privileges'))
      //  this.bunchOfRole.at(index).get('privileges')
    } else {
      event.forEach( item => {
        if(event.includes('@allCollection')) {
            this.bunchOfTreeNodePrivileges[index].forEach( i => {
              if (!this.bunchOfRole.at(index).get('privileges').value.includes(i.key)) {
                // item.disabled = true
                // item.isLeaf = true
              }
            })
          }
      })
    }


  }

  onChangePrivileges(event : Event[], index: number) {
    console.log(event)
    if(event.length != 0) {
      this.bunchOfRole.at(index).get('database').enable()
      if (this.bunchOfRole.at(index).get('privileges').value[0].includes('Diagnostic Actions')) {
        this.bunchOfTreeNodeDatabase[index].forEach((item: any) => {
          item.isLeaf = true
          item.expanded = true
        });
      } else if (this.bunchOfRole.at(index).get('privileges').value[0].includes('Custom Role')) {
        this.bunchOfRole.at(index).get('database').disable()
      }
      this.bunchOfTreeNodePrivileges[index].forEach((item: any) => {
        if (!this.bunchOfRole.at(index).get('privileges').value[0].includes(item.key)) {
          item.disabled = true
          item.isLeaf = true
        }
      });
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
    }

    // test
    // this.bunchOfRole.at(index).get('database').enable()
    // if (this.bunchOfRole.at(index).get('privileges').value[0].includes('Diagnostic Actions')) {
    //   this.bunchOfTreeNodeDatabase[index].forEach((item: any) => {
    //     item.isLeaf = true
    //     item.expanded = true
    //   });
    // } else if (this.bunchOfRole.at(index).get('privileges').value[0].includes('Custom Role')) {
    //   this.bunchOfRole.at(index).get('database').disable()
    // } else if(this.bunchOfRole.at(index).get('privileges').value[0].includes('Collection Actions')) {
    //   this.bunchOfTreeNodePrivileges[index].forEach((item: any) => {
    //     if (!this.bunchOfRole.at(index).get('privileges').value[0].includes(item.key)) {
    //       item.disabled = true
    //       item.isLeaf = true
    //     }
    //   });
    // } else {
    //   this.bunchOfTreeNodeDatabase[index].forEach((item: any) => {
    //     item.disabled = false
    //     item.isLeaf = false
    //     item.expanded = false
    //   });

    //   this.bunchOfTreeNodePrivileges[index].forEach((item : any) => {
    //     item.disabled = false
    //     item.isLeaf = false
    //   });
    // }

    this.bunchOfTreeNodeDatabase[index] = [...this.bunchOfTreeNodeDatabase[index]]
    this.bunchOfTreeNodePrivileges[index] = [...this.bunchOfTreeNodePrivileges[index]]
  }


  hasDuplicate(arr: string[]): boolean {
    return new Set(arr).size !== arr.length;
  }

  createRole() {
    const arrRoleDuplicateCheck : string[] = []
    this.loadingSrv.open({type:'spin',text:'Loading...'});
    const req: requestRoleBody = {
      service_order_code: this.serviceCode,
      createRole: this.myForm.get('createName').value,
      roles: [],
      privileges: [],
    };
    req.createRole = this.myForm.get('createName').value;

    for (let i = 0; i < this.bunchOfRole.length; i++) {
      let listPri : string[] = [];
      const listCustom : customRolesDetail[] = []

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
        } else if(this.bunchOfRole.at(i).get('privileges').value[j].includes('Custom Role '+i)) {
            const c : customRolesDetail = {
              role : this.bunchOfRole.at(i).get('privileges').value[j].replace(('Custom Role '+i+' '), ''),
              db : 'admin'
            }
            listCustom.push(c)
        }
      }
      req.roles = listCustom

      // database
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
        arrRoleDuplicateCheck.push(JSON.stringify(dbtemp))
        req.privileges.push(pritmp);
      }
    }

    console.log("req", req)
    console.log("role duplicate: ", arrRoleDuplicateCheck)
    if(this.hasDuplicate(arrRoleDuplicateCheck)) {
      this.isRoleDuplicate = true;
      this.loadingSrv.close();
    } else {
      // add role
      this.roleService.addNewRole(req)
      .subscribe((r: any) => {
        if (r && r.code == 200) {
          this.utilService.showNotification(NotiStatusEnum.SUCCESS, r.message, "Thông báo");
          this.drawerRef.close();
          setTimeout(() => {
            this.roleService.notifyRefreshUserList();
          }, 1000);
        } else
          this.utilService.showNotification(NotiStatusEnum.ERROR,r.message,"Thông báo")
          this.loadingSrv.close();
        })
    }

  }

  submit() {
    console.log('click submit');
  }

  closeDrawer() {
    this.drawerRef.close();
  }
}
