import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'one-portal-tree-folder',
  templateUrl: './tree-folder.component.html',
  styleUrls: ['./tree-folder.component.less'],
})
export class TreeFolderComponent {
  @Input() data: any[];
  @Input() dataCheck: any[];
  @Output() folderChange = new EventEmitter();

  getChildren(id: number, bucketName: any): any[] {
    if (id != undefined) {
      const lstCopy = [...this.dataCheck];
      const result =  lstCopy.filter(item => item.parentId === id);
      return result;
    } else  {
      let index = this.data.findIndex(item => item.bucketName === bucketName);
      if(index >= 0) {
        let result = [];
        const listChild = this.data[index].bucketTreeData;
        for (let check of listChild) {
          let indexCheck = listChild.findIndex(checkItem => checkItem.id === check.parentId);
          if (indexCheck === -1) {
            result.push(check);
          }
        }
        return result;
      }
    }
  }

  getDataCheck(bucketName: any) {
    if (bucketName != undefined) {
      let index = this.data.findIndex(item => item.bucketName === bucketName);
      if(index >= 0) {
        const listChild = this.data[index].bucketTreeData;
        return listChild;
      }
    } else {
      return this.dataCheck;
    }
  }

  toFolder(item: any) {
    this.folderChange.emit(item);
  }

  getDataFromChild(item: any) {
    this.folderChange.emit(item);
  }
}
