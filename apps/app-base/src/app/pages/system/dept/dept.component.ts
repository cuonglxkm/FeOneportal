import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ActionCode } from '@app/config/actionCode';
import { OptionsInterface, SearchCommonVO } from '@app/core/models/interfaces/types';
import { DeptService } from '@services/system/dept.service';
import { Dept } from '@app/core/models/interfaces/department';
import { PageHeaderType } from '@app/core/models/interfaces/page';
import { TreeNodeInterface } from '@app/core/models/interfaces/tree';
import { MapKeyType, MapPipe, MapSet } from '@shared/pipes/map.pipe';
import { fnFlatDataHasParentToTree, fnFlattenTreeDataByDataList } from '@utils/treeTableTools';
import { ModalBtnStatus } from '@widget/base-modal';
import { DeptManageModalService } from '@widget/biz-widget/system/dept-manage-modal/dept-manage-modal.service';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { AntTableConfig } from '@app/core/models/interfaces/table';

interface SearchParam {
  departmentName: string;
  state: boolean;
}

@Component({
  selector: 'app-dept',
  templateUrl: './dept.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeptComponent implements OnInit {
  @ViewChild('operationTpl', { static: true }) operationTpl!: TemplateRef<NzSafeAny>;
  @ViewChild('state', { static: true }) state!: TemplateRef<NzSafeAny>;
  ActionCode = ActionCode;
  searchParam: Partial<SearchParam> = {};

  tableConfig!: AntTableConfig;
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Department',
    breadcrumb: ['Home', 'System', 'Department']
  };
  dataList: TreeNodeInterface[] = [];
  stateOptions: OptionsInterface[] = [];

  constructor(
    private fb: FormBuilder,
    private deptModalService: DeptManageModalService,
    private dataService: DeptService,
    private modalSrv: NzModalService,
    public message: NzMessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

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
    const params: SearchCommonVO<any> = {
      pageSize: 0,
      pageNum: 0,
      filters: this.searchParam
    };
    this.dataService
      .getDepts(params)
      .pipe(
        finalize(() => {
          this.tableLoading(false);
        })
      )
      .subscribe(deptList => {
        const target = fnFlatDataHasParentToTree(deptList.list);
        this.dataList = fnFlattenTreeDataByDataList(target);
        this.tableLoading(false);
      });
  }

  /*Check*/
  check(id: string, children: any[], parent: any[]): void {
    this.message.success(id);
  }

  /*Reset*/
  resetForm(): void {
    this.searchParam = {};
    this.getDataList();
  }

  add(fatherId: number): void {
    this.deptModalService.show({ nzTitle: 'New' }).subscribe(
      res => {
        if (!res || res.status === ModalBtnStatus.Cancel) {
          return;
        }
        const param = { ...res.modalValue };
        param.fatherId = fatherId;
        this.tableLoading(true);
        this.addEditData(param, 'addDepts');
      },
      error => this.tableLoading(false)
    );
  }

  addEditData(param: Dept, methodName: 'editDepts' | 'addDepts'): void {
    this.dataService[methodName](param)
      .pipe(
        finalize(() => {
          this.tableLoading(false);
        })
      )
      .subscribe(() => {
        this.getDataList();
      });
  }

  del(id: number): void {
    const ids: number[] = [id];
    this.modalSrv.confirm({
      nzTitle: 'Are you sure you want to delete?',
      nzContent: 'Cannot be restored after deletion',
      nzOnOk: () => {
        this.tableLoading(true);
        this.dataService.delDepts(ids).subscribe(
          () => {
            if (this.dataList.length === 1) {
              this.tableConfig.pageIndex--;
            }
            this.getDataList();
          },
          error => this.tableLoading(false)
        );
      }
    });
  }

  // Modification
  edit(id: number, fatherId: number): void {
    this.dataService.getDeptsDetail(id).subscribe(res => {
      this.deptModalService.show({ nzTitle: 'Edit' }, res).subscribe(
        ({ modalValue, status }) => {
          if (status === ModalBtnStatus.Cancel) {
            return;
          }
          modalValue.id = id;
          modalValue.fatherId = fatherId;
          this.tableLoading(true);
          this.addEditData(modalValue, 'editDepts');
        },
        error => this.tableLoading(false)
      );
    });
  }

  // Modify a few items on a page
  changePageSize(e: number): void {
    this.tableConfig.pageSize = e;
  }

  private initTable(): void {
    this.tableConfig = {
      headers: [
        {
          title: 'Department Name',
          width: 230,
          field: 'departmentName'
        },
        {
          title: 'Status',
          field: 'state',
          tdTemplate: this.state,
          width: 100
        },
        {
          title: 'Sort',
          field: 'orderNum',
          width: 100
        },
        {
          title: 'Created',
          field: 'createTime',
          pipe: 'date:yyyy-MM-dd HH:mm',
          width: 180
        },
        {
          title: 'Action',
          tdTemplate: this.operationTpl,
          width: 180,
          fixed: false,
          fixedDir: 'right'
        }
      ],
      total: 0,
      showCheckbox: false,
      loading: false,
      pageSize: 10,
      pageIndex: 1
    };
  }

  ngOnInit(): void {
    this.initTable();
    this.stateOptions = [...MapPipe.transformMapToArray(MapSet.available, MapKeyType.Boolean)];
  }
}
