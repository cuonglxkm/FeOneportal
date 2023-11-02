import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AntTableConfig, SortFile } from '@app/core/models/interfaces/table';

import { SearchCommonVO } from '@app/core/models/interfaces/types';
import { PageHeaderType } from '@app/core/models/interfaces/page';
import { fnFlattenTreeDataByDataList } from '@utils/treeTableTools';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

interface SearchParam {
  ruleName: number;
  desc: string;
}

@Component({
  selector: 'app-tree-list',
  templateUrl: './tree-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeListComponent implements OnInit {
  @ViewChild('highLightTpl', { static: true }) highLightTpl!: TemplateRef<NzSafeAny>;
  @ViewChild('operationTpl', { static: true }) operationTpl!: TemplateRef<NzSafeAny>;
  searchParam: Partial<SearchParam> = {};

  isCollapse = true;
  tableConfig!: AntTableConfig;
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Tree Table (demonstrating default values, delete or view options, ability to print the ID of the selected row)',
    // desc: 'The form page is used to collect or verify information from users, and basic forms are common in form scenarios with fewer data items',
    breadcrumb: ['Home', 'List Page', 'Tree Table']
  };
  checkedCashArray: any[] = [];
  dataList: NzSafeAny[] = [];

  constructor(private fb: FormBuilder, private modalSrv: NzModalService, public message: NzMessageService, private router: Router, private cdr: ChangeDetectorRef) {}

  reloadTable(): void {
    this.message.info('Already refreshed');
    this.getDataList();
  }

  // trigger table change detection
  tableChangeDectction(): void {
    // Changing the reference triggers change detection.
    this.dataList = [...this.dataList];
    this.cdr.detectChanges();
  }

  tableLoading(isLoading: boolean): void {
    this.tableConfig.loading = isLoading;
    this.tableChangeDectction();
  }

  getDataList(e?: NzTableQueryParams): void {
    this.tableConfig.loading = true;
    const params: SearchCommonVO<NzSafeAny> = {
      pageSize: this.tableConfig.pageSize!,
      pageNum: e?.pageIndex! || this.tableConfig.pageIndex!
    };
    this.dataList = [];
    setTimeout(() => {
      this.dataList = [
        {
          id: `1`,
          name: 'John Brown sr.',
          sex: 'Male',
          age: 60,
          address: 'New York No. 1 Lake Park',
          children: [
            {
              id: `1-1`,
              name: 'John Brown',
              age: 42,
              sex: 'Male',
              address: 'New York No. 2 Lake Park'
            },
            {
              id: `1-2`,
              name: 'John Brown jr.',
              age: 30,
              sex: 'Male',
              address: 'New York No. 3 Lake Park',
              children: [
                {
                  id: `1-2-1`,
                  name: 'Jimmy Brown',
                  sex: 'Male',
                  age: 16,
                  address: 'New York No. 3 Lake Park'
                }
              ]
            },
            {
              id: `1-3`,
              name: 'Jim Green sr.',
              age: 72,
              sex: 'Male',
              address: 'London No. 1 Lake Park',
              children: [
                {
                  id: `1-3-1`,
                  name: 'Jim Green',
                  sex: 'Male',
                  age: 42,
                  address: 'London No. 2 Lake Park',
                  children: [
                    {
                      id: `1-3-1-1`,
                      name: 'Jim Green jr.',
                      sex: 'Male',
                      age: 25,
                      address: 'London No. 3 Lake Park'
                    },
                    {
                      id: `1-3-1-2`,
                      name: 'Jimmy Green sr.',
                      sex: 'Male',
                      age: 18,
                      address: 'London No. 4 Lake Park'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: `2`,
          name: 'Joe Black',
          sex: 'Male',
          age: 32,
          address: 'Sidney No. 1 Lake Park'
        }
      ];
      this.tableConfig.total = 13;
      this.tableConfig.pageIndex = 1;
      const cashFromHttp = [
        {
          id: `1`,
          name: 'John Brown sr.',
          sex: 'Male',
          age: 60,
          address: 'New York No. 1 Lake Park',
          children: [
            {
              id: `1-2`,
              name: 'John Brown jr.',
              age: 30,
              sex: 'Male',
              address: 'New York No. 3 Lake Park',
              children: [
                {
                  id: `1-2-1`,
                  name: 'Jimmy Brown',
                  sex: 'Male',
                  age: 16,
                  address: 'New York No. 3 Lake Park'
                }
              ]
            },
            {
              id: `1-3`,
              name: 'Jim Green sr.',
              age: 72,
              sex: 'Male',
              address: 'London No. 1 Lake Park',
              children: [
                {
                  id: `1-3-1`,
                  name: 'Jim Green',
                  sex: 'Male',
                  age: 42,
                  address: 'London No. 2 Lake Park',
                  children: [
                    {
                      id: `1-3-1-1`,
                      name: 'Jim Green jr.',
                      sex: 'Male',
                      age: 25,
                      address: 'London No. 3 Lake Park'
                    },
                    {
                      id: `1-3-1-2`,
                      name: 'Jimmy Green sr.',
                      sex: 'Male',
                      age: 18,
                      address: 'London No. 4 Lake Park'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];
      this.checkedCashArray = fnFlattenTreeDataByDataList(cashFromHttp);
      // this.checkedCashArray = [...this.checkedCashArray];
      this.tableLoading(false);
    });

    /*-----The actual business requests the HTTP interface as follows.------*/
    // this.tableConfig.loading = true;
    // const params: SearchCommonVO<any> = {
    //   pageSize: this.tableConfig.pageSize!,
    //   pageNum: e?.pageIndex || this.tableConfig.pageIndex!,
    //   filters: this.searchParam
    // };
    // this.dataService.getFireSysList(params).pipe(finalize(() => {
    //   this.tableLoading(false);
    // })).subscribe((data => {
    //   const {list, total, pageNum} = data;
    //   this.dataList = [...list];
    //   this.tableConfig.total = total!;
    //   this.tableConfig.pageIndex = pageNum!;
    //   this.tableLoading(false);
    //   this.checkedCashArray = [...this.checkedCashArray];
    // }));
  }

  /*Expand*/
  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  /*Check*/
  check(id: string, children: any[], parent: any[]): void {
    this.message.success(id);
    console.log(children);
    console.log(parent);
  }

  /*Reset*/
  resetForm(): void {
    this.searchParam = {};
    this.getDataList();
  }

  add(): void {
    // this.modalService.show({nzTitle: 'New'}).subscribe((res) => {
    //   if (!res || res.status === ModalBtnStatus.Cancel) {
    //     return;
    //   }
    //   this.tableLoading(true);
    //   this.addEditData(res.modalValue, 'addFireSys');
    // }, error => this.tableLoading(false));
  }

  del(id: number): void {
    this.modalSrv.confirm({
      nzTitle: 'Are you sure you want to delete?',
      nzContent: 'Cannot be restored after deletion',
      nzOnOk: () => {
        this.tableLoading(true);
        this.message.info(`ID array (supports pagination and saving):${JSON.stringify(id)}`);
        this.getDataList();
        this.checkedCashArray.splice(
          this.checkedCashArray.findIndex(item => item.id === id),
          1
        );
        this.tableLoading(false);
        /* The comments are simulating an API call */
        // this.dataService.delFireSys([id]).subscribe(() => {
        //   if (this.dataList.length === 1) {
        //     this.tableConfig.pageIndex--;
        //   }
        //   this.getDataList();
        //   this.checkedCashArray.splice(this.checkedCashArray.findIndex(item => item.id === id), 1);
        // }, error => this.tableLoading(false));
      }
    });
  }

  allDel(): void {
    if (this.checkedCashArray.length > 0) {
      this.modalSrv.confirm({
        nzTitle: 'Are you sure you want to delete?',
        nzContent: 'Cannot be restored after deletion',
        nzOnOk: () => {
          const tempArrays: number[] = [];
          this.checkedCashArray.forEach(item => {
            tempArrays.push(item.id);
          });
          this.tableLoading(true);
          this.message.info(`Array (supports pagination and saving):${JSON.stringify(tempArrays)}`);
          this.getDataList();
          this.checkedCashArray = [];
          this.tableLoading(false);
          // The comments are simulating the API call
          // this.dataService.delFireSys(tempArrays).subscribe(() => {
          //   if (this.dataList.length === 1) {
          //     this.tableConfig.pageIndex--;
          //   }
          //   this.getDataList();
          //   this.checkedCashArray = [];
          // }, error => this.tableLoading(false));
        }
      });
    } else {
      this.message.error('Please check the data');
      return;
    }
  }

  // Modification
  edit(id: number): void {
    // this.dataService.getFireSysDetail(id).subscribe(res => {
    //   this.modalService.show({nzTitle: 'Edit'}, res).subscribe(({modalValue, status}) => {
    //     if (status === ModalBtnStatus.Cancel) {
    //       return;
    //     }
    //     modalValue.id = id;
    //     this.tableLoading(true);
    //     this.addEditData(modalValue, 'editFireSys');
    //   }, error => this.tableLoading(false));
    // });
  }

  // addEditData(param: FireSysObj, methodName: 'editFireSys' | 'addFireSys'): void {
  //   this.dataService[methodName](param).subscribe(() => {
  //     this.getDataList();
  //   });
  // }

  changeSort(e: SortFile): void {
    this.message.info(`Sorting field:${e.fileName},Sort by:${e.sortDir}`);
  }

  // Trigger when the leftmost checkbox is selected
  selectedChecked(e: any): void {
    this.checkedCashArray = [...e];
    console.log(this.checkedCashArray);
  }

  // Modify a few items on a page
  changePageSize(e: number): void {
    this.tableConfig.pageSize = e;
  }

  private initTable(): void {
    /*
     * Note that one column needs to be left without width set here, so that the list can adapt to its width
     *
     * */
    this.tableConfig = {
      headers: [
        {
          title: 'Name',
          width: 230,
          field: 'name',
          showSort: true,
          tdClassList: ['operate-text']
        },
        {
          title: 'Gender',
          field: 'sex',
          width: 230,
          tdTemplate: this.highLightTpl
        },
        {
          title: 'Age',
          field: 'age',
          width: 230,
          showSort: true
        },
        {
          title: 'Address',
          field: 'address'
        },
        {
          title: 'Action',
          tdTemplate: this.operationTpl,
          width: 130,
          fixed: true,
          fixedDir: 'right'
        }
      ],
      total: 0,
      showCheckbox: true,
      loading: false,
      pageSize: 10,
      pageIndex: 1
    };
  }

  ngOnInit(): void {
    this.initTable();
  }
}
