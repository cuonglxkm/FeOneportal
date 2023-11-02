import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';

import { AntTreeTableComponentToken } from '@shared/components/tree-table/tree-table.component';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzTableSize } from 'ng-zorro-antd/table';

import { AntTableComponentToken } from '../ant-table/ant-table.component';
import { TableHeader } from '@app/core/models/interfaces/table';

interface TableSizeItem {
  sizeName: string;
  selected: boolean;
  value: NzTableSize;
}

@Component({
  selector: 'app-card-table-wrap',
  templateUrl: './card-table-wrap.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardTableWrapComponent implements OnInit, AfterContentInit {
  @Input() tableTitle: string | TemplateRef<NzSafeAny> | undefined;
  @Input() btnTpl: TemplateRef<NzSafeAny> | undefined;
  @Input() isNormalTable = true; // If you only need the card-table-wrap style, set it to false here
  @Output() readonly reload = new EventEmitter<NzSafeAny>();
  @ContentChild(AntTableComponentToken) antTableComponent!: AntTableComponentToken;
  @ContentChild(AntTreeTableComponentToken) antTreeTableComponent!: AntTreeTableComponentToken;
  tableConfigVisible = false;
  tableSizeOptions: TableSizeItem[] = [
    { sizeName: 'default', selected: true, value: 'default' },
    { sizeName: 'middle', selected: false, value: 'middle' },
    { sizeName: 'small', selected: false, value: 'small' }
  ];
  tableHeaders: TableHeader[] = [];
  currentTableComponent!: AntTableComponentToken | AntTreeTableComponentToken;
  allTableFieldChecked = false; // set all selected columns
  allTableFieldIndeterminate = false; // Set the half-selected state of all selected columns inside
  copyHeader: TableHeader[] = []; // cache default configuration

  constructor() { }

  // Whether to show the checkbox
  changeTableCheckBoxShow(e: boolean): void {
    this.currentTableComponent.tableConfig.showCheckbox = e;
    this.tableChangeDectction();
  }

  // large, medium and small form density
  tableSizeMenuClick(item: TableSizeItem): void {
    this.tableSizeOptions.forEach(tableSizeItem => (tableSizeItem.selected = false));
    item.selected = true;
    this.currentTableComponent.tableSize = item.value;
  }

  // Whether the tableCheckbox is all selected in the configuration
  changeAllTableTableConfigShow(e: boolean): void {
    if (e) {
      this.allTableFieldChecked = e;
      this.allTableFieldIndeterminate = false;
    }
    this.tableHeaders.forEach(item => (item.show = e));
    this.tableChangeDectction();
  }

  // Set fixed left or right
  changeTableConfigShow(): void {
    const tempArray = [...this.tableHeaders];
    const fixedLeftArray: TableHeader[] = [];
    const fixedRightArray: TableHeader[] = [];
    const noFixedArray: TableHeader[] = [];
    tempArray.forEach(item => {
      if (item.fixed) {
        if (item.fixedDir === 'left') {
          fixedLeftArray.push(item);
        } else {
          fixedRightArray.push(item);
        }
      } else {
        noFixedArray.push(item);
      }
    });
    this.currentTableComponent.tableConfig.headers = [...fixedLeftArray, ...noFixedArray, ...fixedRightArray];
    this.tableChangeDectction();
  }

  dropTableConfig(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.tableHeaders, event.previousIndex, event.currentIndex);
    this.changeTableConfigShow();
  }

  fixedTableHead(dir: 'right' | 'left', item: TableHeader): void {
    item.fixed = !(item.fixed && item.fixedDir === dir);
    item.fixedDir = dir;
    this.changeTableConfigShow();
  }

  reloadClick(): void {
    this.reload.emit();
  }

  // A certain column check changes
  changeSignalCheck(e: boolean, item: TableHeader): void {
    item.show = e;
    this.judgeAllChecked();
    this.tableChangeDectction();
  }

  // enable sublist change detection
  tableChangeDectction(): void {
    this.currentTableComponent.tableChangeDectction();
  }

  // Judgment column shows the state of the checkbox
  judgeAllChecked(): void {
    this.allTableFieldChecked = this.tableHeaders.every(item => item.show === true);
    const allUnChecked = this.tableHeaders.every(item => !item.show);
    this.allTableFieldIndeterminate = !this.allTableFieldChecked && !allUnChecked;
  }

  // reset
  reset(): void {
    this.tableHeaders = [];
    this.copyHeader.forEach(item => {
      this.tableHeaders.push({ ...item });
    });
    this.currentTableComponent.tableConfig.headers = [...this.tableHeaders];
    this.tableChangeDectction();
  }

  ngOnInit(): void { }

  ngAfterContentInit(): void {
    this.currentTableComponent = this.antTableComponent || this.antTreeTableComponent;

    if (this.isNormalTable) {
      this.tableHeaders = [...this.currentTableComponent.tableConfig.headers];
      this.tableHeaders.forEach(item => {
        if (item.show === undefined) {
          item.show = true;
        }
      });
      this.copyHeader.length = 0;
      this.tableHeaders.forEach(item => {
        this.copyHeader.push({ ...item });
      });
      this.judgeAllChecked();
    }
  }
}
