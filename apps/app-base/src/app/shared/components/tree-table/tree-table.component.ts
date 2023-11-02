import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { AntTableConfig, SortFile, TableHeader } from '@app/core/models/interfaces/table';
import { TreeNodeInterface } from '@app/core/models/interfaces/tree';

import { fnGetFlattenTreeDataByMap, fnTreeDataToMap } from '@utils/treeTableTools';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzTableQueryParams, NzTableSize } from 'ng-zorro-antd/table';

export abstract class AntTreeTableComponentToken {
  tableSize!: NzTableSize;
  tableConfig!: AntTableConfig;

  abstract tableChangeDectction(): void;
}

@Component({
  selector: 'app-tree-table',
  templateUrl: './tree-table.component.html',
  styleUrls: ['./tree-table.component.less'],
  providers: [{ provide: AntTreeTableComponentToken, useExisting: TreeTableComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableComponent implements OnInit, OnChanges {
  _dataList!: TreeNodeInterface[];
  allChecked: boolean = false;
  indeterminate = false;
  // The cached checked box data array passed in from the business component is equivalent to the cached tableData
  @Input() cashArray: NzSafeAny[] = [];
  checkedCashArrayFromComment: NzSafeAny[] = [];
  @Output() readonly sortFn: EventEmitter<SortFile> = new EventEmitter<SortFile>();
  @Output() readonly changePageNum = new EventEmitter<NzTableQueryParams>();
  @Output() readonly changePageSize = new EventEmitter<number>();
  mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = {};
  @Input() tableConfig!: AntTableConfig;
  @Output() readonly selectedChange: EventEmitter<NzSafeAny[]> = new EventEmitter<NzSafeAny[]>();
  cashExpandIdArray: Array<number | string> = []; // Cache the id of the expanded node

  @Input()
  set tableData(value: TreeNodeInterface[]) {
    this._dataList = value;
    // Obtain treeData in the form of map according to dataList, each key corresponds to a group (that is, a subset) of data
    this.mapOfExpandedData = fnTreeDataToMap(this._dataList);
    const beFilterId: Array<string | number> = []; // The id array of the child set of expanded data to be deleted
    Object.values(this.mapOfExpandedData).forEach(menuArray => {
      menuArray.forEach(menuItem => {
        if (this.cashExpandIdArray.includes(menuItem.id)) {
          menuItem.expand = true;
          // Let the current node subset be cached, and then delete it later, otherwise the data of the subset will be redundant to the level where expand is true
          if (menuItem.children && menuItem.children.length > 0) {
            menuItem.children.forEach(item => {
              beFilterId.push(item.id);
            });
          }
        }
      });
    });
    beFilterId.forEach(item => {
      delete this.mapOfExpandedData[item];
    });
  }

  get tableData(): NzSafeAny[] {
    return this._dataList;
  }

  _tableSize: NzTableSize = 'default';
  set tableSize(value: NzTableSize) {
    this._tableSize = value;
    this.tableChangeDectction();
  }

  get tableSize(): NzTableSize {
    return this._tableSize;
  }

  constructor(private cdr: ChangeDetectorRef) {}

  tableChangeDectction(): void {
    // Changing the reference triggers change detection.
    this._dataList = [...this._dataList];
    this.cdr.markForCheck();
  }

  // header dragging
  onResize(nzResizeEvent: NzResizeEvent, col: string): void {
    this.tableConfig.headers = this.tableConfig.headers.map(e =>
      e.title === col
        ? {
            ...e,
            width: +`${nzResizeEvent.width}`
          }
        : e
    ) as TableHeader[];
  }

  // click to sort
  changeSort(tableHeader: TableHeader): void {
    this.tableConfig.headers.forEach(item => {
      if (item.field !== tableHeader.field) {
        item.sortDir = undefined;
      }
    });
    const sortDicArray: [undefined, 'asc', 'desc'] = [undefined, 'asc', 'desc'];
    const index = sortDicArray.findIndex(item => item === tableHeader.sortDir);
    tableHeader.sortDir = index === sortDicArray.length - 1 ? sortDicArray[0] : sortDicArray[index + 1];
    this.sortFn.emit({ fileName: tableHeader.field!, sortDir: tableHeader.sortDir });
  }

  // pagination page number change
  onQueryParamsChange(tableQueryParams: NzTableQueryParams): void {
    this.changePageNum.emit(tableQueryParams);
  }

  // Modify the page number of several items on a page
  onPageSizeChange($event: NzSafeAny): void {
    this.changePageSize.emit($event);
  }

  changecashExpandIdArray(id: number | string, expand: boolean): void {
    const index = this.cashExpandIdArray.indexOf(id);
    if (expand) {
      if (index === -1) {
        this.cashExpandIdArray.push(id);
      }
    } else {
      if (index !== -1) {
        this.cashExpandIdArray.splice(index, 1);
      }
    }
  }

  collapse(array: TreeNodeInterface[], data: TreeNodeInterface, $event: boolean): void {
    this.changecashExpandIdArray(data.id, $event);
    if (!$event) {
      if (data.children) {
        data.children.forEach(d => {
          const target = array.find(a => a.id === d.id)!;
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  // Set whether it is selected or not, and process the cached value
  setIsCheckFn(dataItem: NzSafeAny, isChecked: boolean): void {
    dataItem['_checked'] = isChecked;
    const index = this.checkedCashArrayFromComment.findIndex(cashItem => cashItem.id === dataItem.id);
    if (isChecked) {
      if (index === -1) {
        this.checkedCashArrayFromComment.push(dataItem);
      }
    } else {
      if (index !== -1) {
        this.checkedCashArrayFromComment.splice(index, 1);
      }
    }
  }

  // select all
  onAllChecked(isChecked: boolean): void {
    fnGetFlattenTreeDataByMap(this.mapOfExpandedData).forEach(row => {
      this.setIsCheckFn(row, isChecked);
    });
    this.selectedChange.emit(this.checkedCashArrayFromComment);
    this.refreshStatus();
  }

  // radio
  public checkRowSingle(isChecked: boolean, selectIndex: number, row: TreeNodeInterface): void {
    this.setIsCheckFn(row, isChecked);
    this.selectedChange.emit(this.checkedCashArrayFromComment);
    this.refreshStatus();
  }

  // Refresh checkbox state
  refreshStatus(): void {
    // Get the flattened treeData
    const dataTempArray: TreeNodeInterface[] = fnGetFlattenTreeDataByMap(this.mapOfExpandedData);

    const allChecked =
      dataTempArray.length > 0 &&
      dataTempArray.every(item => {
        return item['_checked'] === true;
      });
    const allUnChecked = dataTempArray.length > 0 && dataTempArray.every(item => item['_checked'] !== true);
    this.allChecked = allChecked;
    this.indeterminate = !allChecked && !allUnChecked;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cashArray'] && !changes['cashArray'].firstChange) {
      this.checkedCashArrayFromComment = [...changes['cashArray'].currentValue];
      fnGetFlattenTreeDataByMap(this.mapOfExpandedData).forEach(row => {
        // Determine whether the value exists in the cache, and if so, set it to true
        const index = this.checkedCashArrayFromComment.findIndex(item => item.id === row.id);
        this.setIsCheckFn(row, index !== -1);
      });
      this.refreshStatus();
    }
  }

  ngOnInit(): void {}
}
