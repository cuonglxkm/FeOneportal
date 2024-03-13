import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';

interface Database {
  db : string,
  collection : string[]
}


@Component({
  selector: 'one-portal-custom-role',
  templateUrl: './custom-role.component.html',
  styleUrls: ['./custom-role.component.css'],
})
export class CustomRoleComponent implements OnInit{
  roleName: string;
  listOfCollectionActions: string[];
  listOfDiagnosticsAction: string[];
  samplePrivileges: NzTreeNodeOptions[];
  sampleDatabase : Database[]; 
  sampleDatabaseTreeSlect  : NzTreeNodeOptions[];
  value: string[];

  get bunchOfRole(): any {
    return this.myForm.controls['bunchOfRole'];
  }

  myForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private drawerRef: NzDrawerRef<string>) {
    this.roleName = '';
    this.samplePrivileges = [];

    this.sampleDatabaseTreeSlect = [];
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
    
    this.sampleDatabase = [
      {
        db : 'test1',
        collection : [
          'coll1', 'coll2', 'coll3'
        ]
      },
      {
        db : 'test2',
        collection : [
          'abc', 'def'
        ]
      }
    ]

    this.listOfDiagnosticsAction = ['listCollections'];
    this.value = [];
    this.convertPrivilegesDataToTreeSelect();
    this.convertDatabaseToTreeSelect();
    this.myForm = this.fb.group({
      bunchOfRole: this.fb.array([]),
    });

  }

  ngOnInit() {
    this.add(); 
    console.log('Oninit')
  }

  add() {
    const lessonForm = this.fb.group({
      privileges: ['', Validators.required],
      database: ['', Validators.required],
    });
    this.bunchOfRole.push(lessonForm);
  }

  delete(i: number) {
    if(this.bunchOfRole.length != 1) {
      this.bunchOfRole.removeAt(i);
    }
  }

  convertDatabaseToTreeSelect() {
    for(let i = 0; i < this.sampleDatabase.length; i++) {
      const listchild : NzTreeNodeOptions[] = [];
      for( let j = 0; j < this.sampleDatabase[i].collection.length; j++) {
        const children : NzTreeNodeOptions = {
          title : this.sampleDatabase[i].collection[j],
          value : this.sampleDatabase[i].collection[j],
          key : this.sampleDatabase[i].collection[j],
          isLeaf : true
        }
      
        listchild.push(children);
      }

      const parent : NzTreeNodeOptions = {
        title : this.sampleDatabase[i].db,
        value : this.sampleDatabase[i].db,
        key : this.sampleDatabase[i].db,
        children : listchild
        
      }

      this.sampleDatabaseTreeSlect.push(parent);
    }

    console.log('sample database : ', this.sampleDatabaseTreeSlect)
  }

  convertPrivilegesDataToTreeSelect() {
    // add collection actions
    let listOfChildren: NzTreeNodeOptions[] = [];
    this.listOfCollectionActions.forEach((item) => {
      const chilren: NzTreeNodeOptions = {
        title: item,
        value: item,
        key: item,
        isLeaf: true,
      };
      listOfChildren.push(chilren);
    });
    const data1: NzTreeNodeOptions = {
      title: 'Collection Actions',
      value: 'Collection Actions',
      key: 'Collection Actions',
      children: listOfChildren,
    };
    this.samplePrivileges.push(data1);

    // add data diagnostics Action
    listOfChildren = [];
    this.listOfDiagnosticsAction.forEach((item) => {
      const chilren: NzTreeNodeOptions = {
        title: item,
        value: item,
        key: item,
        isLeaf: true,
      };
      listOfChildren.push(chilren);
    });
    const data2: NzTreeNodeOptions = {
      title: 'Diagnostic Actions',
      value: 'Diagnostic Actions',
      key: 'Diagnostic Actions',
      children: listOfChildren,
    };
    this.samplePrivileges.push(data2);

  }

  onChangePrivileges(index : number) {
    console.log('values : ', this.bunchOfRole.at(index).get('privileges').value )
    
  }

  createRole() {
    console.log('click create role')
    for(let i = 0; i < this.bunchOfRole.length; i++ ) {
        console.log(this.bunchOfRole.at(i).get('privileges').value);
        console.log(this.bunchOfRole.at(i).get('database').value);
    }
  }

  submit() {
    console.log('click submit')
  }

  closeDrawer() {
    this.drawerRef.close()
  }
}
