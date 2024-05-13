import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'one-portal-tree-folder',
  templateUrl: './tree-folder.component.html',
  styleUrls: ['./tree-folder.component.less'],
})
export class TreeFolderComponent {
  @Input() treeFolder: any[];
  @Input() dataCheck: any[];
  @Output() folderChange = new EventEmitter();

  folderActive: any

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log(this.treeFolder);
    console.log(this.dataCheck);
    
  }
//   getChildren(id: number, bucketName: any): any[] {
//     if (id != undefined) {
//       const lstCopy = [...this.dataCheck];
//       const result =  lstCopy.filter(item => item.parentId === id);
//       return result;
//     } else  {
//       let index = this.data.findIndex(item => item.bucketName === bucketName);
//       if(index >= 0) {
//         let result = [];
//         const listChild = this.data[index].bucketTreeData;
//         for (let check of listChild) {
//           let indexCheck = listChild.findIndex(checkItem => checkItem.id === check.parentId);
//           if (indexCheck === -1) {
//             result.push(check);
//           }
//         }
//         return result;  
//       }
//     }
//   }

//   private dataCheckCache = new Map<any, any>();

//   getDataCheck(bucketName: any) {
//       if (this.dataCheckCache.has(bucketName)) {
//           return this.dataCheckCache.get(bucketName);
//       }
  
//       let result;
//       if (bucketName !== undefined) {
//           const index = this.data.findIndex(item => item.bucketName === bucketName);
//           if (index >= 0) {
//               result = this.data[index].bucketTreeData;
//           }
//       } else {
//           result = this.dataCheck;
//       }
  
//       this.dataCheckCache.set(bucketName, result);
  
//       return result;
//   }

//   toFolder(item: any) {
//     console.log(item);
    
//     this.folderActive = item
//     this.folderChange.emit(item);
//   }

//   isActive(item: any): boolean {
//     return this.folderActive === item
// }
// getDataFromChild(item: any) {
//   console.log(item);
//   // Emit only when the final selection is made
//   if (item.bucketName !== undefined) {
//     this.folderChange.emit(item);
//   }
// }
}
