import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AntTableConfig, SortFile } from '@app/core/models/interfaces/table';

import { SearchCommonVO } from '@app/core/models/interfaces/types';
import { PageHeaderType } from '@app/core/models/interfaces/page';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

interface SearchParam {
  ruleName: number;
  desc: string;
}

@Component({
  selector: 'app-search-table',
  templateUrl: './search-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchTableComponent implements OnInit {
  searchParam: Partial<SearchParam> = {};
  @ViewChild('highLightTpl', { static: true }) highLightTpl!: TemplateRef<NzSafeAny>;
  @ViewChild('operationTpl', { static: true }) operationTpl!: TemplateRef<NzSafeAny>;
  isCollapse = true;
  tableConfig!: AntTableConfig;
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Search Table',
    breadcrumb: ['Home', 'List Page', 'Search Table']
  };
  checkedCashArray: NzSafeAny[] = [
    {
      id: '1',
      noShow: 'The default is not to display.',
      longText: 'The text is super long, super long text, super long text, super long text, super long text, super long.',
      newline: 'No ellipsis, no ellipsis, no ellipsis, no ellipsis, no ellipsis, no ellipsis, no ellipsis, no ellipsis.',
      addStyle: 'Add style',
      name: 'Custom template',
      obj: { a: { b: 'The clicked value 1.' } }
    },
    {
      id: '2',
      noShow: 'The default is not to display.',
      longText: 'This text is extremely long.',
      newline: 'string',
      name: 'Custom template',
      addStyle: 'Add style',
      obj: { a: { b: 'The clicked value 1.' } }
    }
  ]; // Needs to be modified to the corresponding data type for the business.
  dataList: NzSafeAny[] = []; // Needs to be modified to the corresponding data type for the business.

  constructor(private fb: FormBuilder, private modalSrv: NzModalService, public message: NzMessageService, private router: Router, private cdr: ChangeDetectorRef) {}

  // Trigger when the leftmost checkbox is selected
  selectedChecked(e: any): void {
    this.checkedCashArray = [...e];
  }

  // Refresh page
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
          id: '1',
          noShow: 'The default is not to display.',
          longText: 'The text is super long, super long text, super long text, super long text, super long text, super long.',
          newline: 'No ellipsis, no ellipsis, no ellipsis, no ellipsis, no ellipsis, no ellipsis, no ellipsis, no ellipsis.',
          addStyle: 'Add style',
          name: 'Custom template',
          obj: { a: { b: 'The clicked value 1.' } }
        },
        {
          id: '2',
          noShow: 'The default is not to display.',
          longText: 'This text is extremely long.',
          newline: 'string',
          name: 'Custom template',
          addStyle: 'Add style',
          obj: { a: { b: 'The clicked value 1.' } }
        },
        {
          id: '3',
          noShow: 'The default is not to display.',
          longText: 'string',
          newline: 'string',
          name: 'Custom template',
          addStyle: 'Add style',
          obj: { a: { b: 'The clicked value 1.' } }
        },
        {
          id: '4',
          noShow: 'The default is not to display.',
          longText: 'string',
          newline: 'string',
          name: 'Custom template',
          addStyle: 'Add style',
          obj: { a: { b: 'The clicked value 1.' } }
        },
        {
          id: '5',
          noShow: 'The default is not to display.',
          longText: 'string',
          newline: 'string',
          name: 'Custom template',
          addStyle: 'Add style',
          obj: { a: { b: 'The clicked value 1.' } }
        },
        {
          id: '6',
          noShow: 'The default is not to display.',
          longText: 'string',
          newline: 'string',
          name: 'Custom template',
          addStyle: 'Add style',
          obj: { a: { b: 'The clicked value 1.' } }
        }
      ];
      this.tableConfig.total = 13;
      this.tableConfig.pageIndex = 1;
      this.checkedCashArray = [...this.checkedCashArray];
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

  /*Reset*/
  resetForm(): void {
    this.searchParam = {};
    this.getDataList();
  }

  /*Expand*/
  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  /*Check*/
  check(name: string): void {
    // "skipLocationChange" set to true to prevent adding the new state to the history when navigating.
    this.router.navigate(['admin/page-demo/list/search-table/search-table-detail', name, 123]);
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

  del(id: number): void {
    this.modalSrv.confirm({
      nzTitle: 'Are you sure you want to delete?',
      nzContent: 'Cannot be restored after deletion',
      nzOnOk: () => {
        this.tableLoading(true);
        /* The comments are simulating an API call */
        // this.dataService.delFireSys([id]).subscribe(() => {
        //   if (this.dataList.length === 1) {
        //     this.tableConfig.pageIndex--;
        //   }
        //   this.getDataList();
        //   this.checkedCashArray.splice(this.checkedCashArray.findIndex(item => item.id === id), 1);
        // }, error => this.tableLoading(false));

        setTimeout(() => {
          this.message.info(`ID array (supports pagination and saving):${JSON.stringify(id)}`);
          this.getDataList();
          this.checkedCashArray.splice(
            this.checkedCashArray.findIndex(item => item.id === id),
            1
          );
          this.tableLoading(false);
        }, 3000);
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
          // The comments are simulating the API call
          // this.dataService.delFireSys(tempArrays).subscribe(() => {
          //   if (this.dataList.length === 1) {
          //     this.tableConfig.pageIndex--;
          //   }
          //   this.getDataList();
          //   this.checkedCashArray = [];
          // }, error => this.tableLoading(false));
          setTimeout(() => {
            this.message.info(`ID array (supports pagination and saving):${JSON.stringify(tempArrays)}`);
            this.getDataList();
            this.checkedCashArray = [];
            this.tableLoading(false);
          }, 1000);
        }
      });
    } else {
      this.message.error('Please check the data');
      return;
    }
  }

  changeSort(e: SortFile): void {
    this.message.info(`Sorting field:${e.fileName},Sort by:${e.sortDir}`);
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
          title: 'This is not shown by default.',
          width: 130,
          field: 'noShow',
          show: false
        },
        {
          title: 'The text is very long.',
          width: 130,
          field: 'longText',
          showSort: true
        },
        {
          title: 'Line break',
          width: 100,
          field: 'newline',
          notNeedEllipsis: true,
          showSort: true,
          tdClassList: ['text-wrap']
        },
        {
          title: 'Add style',
          width: 100,
          field: 'addStyle',
          tdClassList: ['operate-text']
        },
        {
          title: 'Custom template',
          field: 'name',
          tdTemplate: this.highLightTpl,
          width: 140
        },
        {
          title: 'Access object properties using dot notation (obj.a.b).',
          field: 'obj.a.b'
        },
        {
          title: 'Action',
          tdTemplate: this.operationTpl,
          width: 120,
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
