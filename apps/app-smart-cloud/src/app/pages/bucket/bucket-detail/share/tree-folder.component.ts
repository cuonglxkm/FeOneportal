import {Component, Input} from '@angular/core';

@Component({
  selector: 'one-portal-tree-folder',
  templateUrl: './tree-folder.component.html',
  styleUrls: ['./tree-folder.component.less'],
})
export class TreeFolderComponent {
  @Input() data: any[];
}
