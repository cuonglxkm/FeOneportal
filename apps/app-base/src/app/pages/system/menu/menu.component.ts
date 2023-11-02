import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ActionCode } from '@app/config/actionCode';
import { MenuAdmin, OptionsInterface, SearchCommonVO } from '@app/core/models/interfaces/types';
import { MenuListObj } from '@app/core/models/interfaces/menu';
import { PageHeaderType } from '@app/core/models/interfaces/page';
import { TreeNodeInterface } from '@app/core/models/interfaces/tree';
import { MapKeyType, MapPipe, MapSet } from '@shared/pipes/map.pipe';
import { fnFlatDataHasParentToTree, fnFlattenTreeDataByDataList } from '@utils/treeTableTools';
import { ModalBtnStatus } from '@widget/base-modal';
import { MenuModalService } from '@widget/biz-widget/system/menu-modal/menu-modal.service';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ModalButtonOptions, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { AntTableConfig } from '@app/core/models/interfaces/table';
import { MenuService } from '@core/services/firebase/menu.service';

interface SearchParam {
  menuName: number;
  visible: boolean;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {
  @ViewChild('zorroIconTpl', { static: true }) zorroIconTpl!: TemplateRef<NzSafeAny>;
  @ViewChild('aliIconTpl', { static: true }) aliIconTpl!: TemplateRef<NzSafeAny>;
  @ViewChild('operationTpl', { static: true }) operationTpl!: TemplateRef<NzSafeAny>;
  @ViewChild('visibleTpl', { static: true }) visibleTpl!: TemplateRef<NzSafeAny>;
  @ViewChild('newLinkFlag', { static: true }) newLinkFlag!: TemplateRef<NzSafeAny>;

  ActionCode = ActionCode;
  searchParam: Partial<SearchParam> = {};

  tableConfig!: AntTableConfig;
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Menu',
    breadcrumb: ['Home', 'System', 'Menu']
  };
  dataList: TreeNodeInterface[] = [];
  visibleOptions: OptionsInterface[] = [];

  constructor(
    private fb: FormBuilder,
    private menuModalService: MenuModalService,
    private dataService: MenuService,
    private modalSrv: NzModalService,
    public message: NzMessageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
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
    this.tableConfig.loading = true;
    const params: SearchCommonVO<any> = {
      pageSize: 10,
      pageNum: 1,
      filters: this.searchParam
    };

    this.dataService.getMenuList0()
      .pipe(
        finalize(() => {
          this.tableLoading(false);
        })
      )
      .subscribe(menuList => {
        const target = fnFlatDataHasParentToTree(menuList, 'fatherId');
        this.dataList = fnFlattenTreeDataByDataList(target);
        this.tableLoading(false);
      });
  }

  /*Reset*/
  resetForm(): void {
    this.searchParam = {};
    this.getDataList();
  }

  add(fatherId: string): void {
    this.menuModalService.show({ nzTitle: 'New' }).subscribe(
      res => {
        if (!res || res.status === ModalBtnStatus.Cancel) {
          return;
        }
        const param = { ...res.modalValue };
        param.fatherId = fatherId;
        this.tableLoading(true);
        this.addEditData(param, 'addMenus');
      },
      error => {
        this.message.error('Create unsuccess!');
        this.tableLoading(false)
      }
    );
  }

  // modification
  edit(id: string, fatherId: number): void {
    this.dataService.getMenuDetail(id).subscribe(res => {
      this.menuModalService.show({ nzTitle: 'Edit' }, res).subscribe(
        ({ modalValue, status }) => {
          if (status === ModalBtnStatus.Cancel) {
            return;
          }
          modalValue.id = id;
          modalValue.fatherId = fatherId;
          this.tableLoading(true);
          this.addEditData(modalValue, 'editMenus');
        },
        error => {
          this.message.error('Update unsuccess!');
          this.tableLoading(false)
        }
      );
    });
  }

  addEditData(param: MenuAdmin, methodName: 'editMenus' | 'addMenus'): void {
    this.dataService[methodName](param)
      .pipe(
        finalize(() => {
          this.tableLoading(false);
        })
      )
      .subscribe(
        () => {
          if (methodName === 'addMenus') this.message.success('Created success!');
          else this.message.success('Updated success!');

          this.getDataList();
        }
      );
  }

  del(id: string): void {
    this.modalSrv.confirm({
      nzTitle: 'Are you sure you want to delete?',
      nzContent: 'Cannot be restored after deletion',
      nzOnOk: () => {
        this.tableLoading(true);
        this.dataService.delMenus(id).subscribe(
          () => {
            this.message.success('Deleted success!');
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


  detail(id: string): void {
    this.dataService.getMenuDetail(id).subscribe(res => {
      this.menuModalService.show({
        nzTitle: 'Detail',
        nzFooter: [
          {
            label: 'Close',
            type: 'primary',
            show: true,
            onClick: this.cancelCallback.bind(this)
          },
          {
            label: 'Cancel',
            type: 'default',
            show: false,
          }
        ],
      }, res).subscribe(
        ({ modalValue, status }) => {
          if (status === ModalBtnStatus.Cancel) {
            return;
          }
        },
      );
    });
  }

  // Modify a few items on a page
  changePageSize(e: number): void {
    this.tableConfig.pageSize = e;
  }

  private cancelCallback(modalButtonOptions: ModalButtonOptions): void {
    return modalButtonOptions['modalRef'].destroy({ status: ModalBtnStatus.Cancel, value: null });
  }

  private initTable(): void {
    this.tableConfig = {
      headers: [
        {
          title: 'Menu Name',
          width: 230,
          field: 'menuName'
        },
        {
          title: 'zorro icon',
          field: 'icon',
          width: 100,
          tdTemplate: this.zorroIconTpl
        },
        {
          title: 'Ali icon',
          field: 'alIcon',
          width: 100,
          tdTemplate: this.aliIconTpl
        },
        {
          title: 'Permission code',
          field: 'code',
          width: 300
        },
        {
          title: 'Routing address',
          field: 'path',
          width: 300
        },
        {
          title: 'Sort',
          field: 'orderNum',
          width: 80
        },
        {
          title: 'Status',
          field: 'status',
          pipe: 'available',
          width: 100
        },
        {
          title: 'Display',
          field: 'visible',
          pipe: 'isOrNot',
          tdTemplate: this.visibleTpl,
          width: 100
        },
        {
          title: 'External link',
          field: 'newLinkFlag',
          pipe: 'isOrNot',
          tdTemplate: this.newLinkFlag,
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
          width: 100,
          fixed: true,
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
    this.visibleOptions = [...MapPipe.transformMapToArray(MapSet.visible, MapKeyType.Boolean)];
  }
}
