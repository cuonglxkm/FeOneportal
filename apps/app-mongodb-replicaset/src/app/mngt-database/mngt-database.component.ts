import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

interface Database {
  name : string
  collection : Collection[]
}

interface Collection {
  name : string,
  size : number,
  document : number
}

@Component({
  selector: 'one-portal-mngt-database',
  templateUrl: './mngt-database.component.html',
  styleUrls: ['./mngt-database.component.css'],
})
export class MngtDatabaseComponent implements OnInit{
  listOfCollection : Collection[];
  sampleData : Database[] | any;
  currentDatabase : string;
  inputValue : string;
  isShowCreateDB : boolean;
  isShowCreateColl : boolean;
  isShowDelDB : boolean | undefined;
  selectedOptionDatabase = null;
  selectedOptionColl = null;
  
  storageSize : string;
  totalDocument : string;
  indexSize : string;

  // validateFormAddDatabase : FormGroup;
  constructor() {
    this.sampleData = [
      {
        name : "db1",
        collection : [
          {
            name : 'coll1',
            size : 12,
            document : 10
          },
          {
            name : 'coll2-1',
            size : 12,
            document : 10
          },
          {
            name : 'coll3-1',
            size : 12,
            document : 10
          },
        ]
      },
      {
        name : "db2",
        collection : [
          {
            name : 'coll1-2',
            size : 12,
            document : 10
          },
          {
            name : 'coll2-2',
            size : 12,
            document : 10
          },
          {
            name : 'coll3-2',
            size : 12,
            document : 10
          },
        ]
      },
      {
        name : "db3",
        collection : [
          {
            name : 'coll1-3',
            size : 12,
            document : 10
          },
          {
            name : 'coll2-3',
            size : 12,
            document : 10
          },
          {
            name : 'coll3-3',
            size : 12,
            document : 10
          },
        ]
      }
    ]
    this.isShowCreateDB = false
    this.isShowCreateColl = false
    this.listOfCollection = []
    this.inputValue = ""
    this.currentDatabase = ""
    this.storageSize = ''
    this.totalDocument = ''
    this.indexSize = ''

  }
  arrayTemp : Database[] | undefined
  ngOnInit() {
    this.arrayTemp = this.sampleData
  }

  
  onChangeSearch(event: string) {
    if(event.trim() == '') {
      this.sampleData = this.arrayTemp
    }
    this.sampleData = this.sampleData.filter((item: { name: string | string[]; }) => item.name?.includes(event))
  }


  showCreateDB(): void{
    this.isShowCreateDB = true
  }

  hideCreateDB() {
    this.isShowCreateDB = false
  }

  showCreateCollection() {
    this.isShowCreateColl = true
  }

  hideCreateColl() {
    this.isShowCreateColl = false
  }

  showDelDB() {
    this.isShowDelDB = true
  }

  hideDelDB() {
    this.isShowDelDB = false
  }

  changeInput(db : any) {
    this.currentDatabase = db.name
    for(let i = 0; i < this.sampleData.length; i++) {
      if(db.name == this.sampleData[i].name) {
        this.listOfCollection = this.sampleData[i].collection
      }
    }
  }

  submitFormAdddatabase() {
    // console.log('submit', this.validateFormAddDatabase);
  }
}
