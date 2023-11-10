import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
// import { ActionCode } from '@app/config/actionCode';
// import { MessageService } from '@core/services/common/message.service';
// import { SearchCommonVO } from '@app/core/models/interfaces/types';
// import { Role } from '@app/core/models/interfaces/role';
// import { PageHeaderType } from '@app/core/models/interfaces/page';
// import { ModalBtnStatus } from '@widget/base-modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { finalize } from 'rxjs/operators';
import { VMService } from '../instances.service';
import { AntTableConfig } from 'src/app/core/models/interfaces/table';
import { PageHeaderType } from 'src/app/core/models/interfaces/page';
import { Role } from 'src/app/core/models/interfaces/role';
import { SearchCommonVO } from 'src/app/core/models/interfaces/types';
import { InstancesModel } from '../instances.model';
import { async } from 'rxjs';
import { da } from 'date-fns/locale';

class SearchParam {
  status: string = '';
  name: string = '';
}

@Component({
  selector: 'one-portal-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstancesComponent implements OnInit {
  @ViewChild('operationTpl', { static: true }) operationTpl!: TemplateRef<any>;
  searchParam: Partial<SearchParam> = {};
  tableConfig!: AntTableConfig;
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Danh sách máy ảo',
    breadcrumb: ['Home', 'Dịch vụ', 'VM'],
  };
  dataList: InstancesModel[] = [];
  checkedCashArray = [];

  pageIndex = 1;
  pageSize = 10;
  total = 1;
  loading = true;
  sortValue: string | null = null;
  sortKey: string | null = null;
  filterGender = [
    { text: 'male', value: 'male' },
    { text: 'female', value: 'female' },
  ];
  searchGenderList: string[] = [];
  filterStatus = [
    { text: 'Tất cả trạng thái', value: '' },
    { text: 'Khởi tạo', value: 'KHOITAO' },
    { text: 'Hủy', value: 'HUY' },
    { text: 'Tạm ngưng', value: 'TAMNGUNG' },
  ];

  selectedOptionAction: string;
  isVisible01 = false;
  isVisible02 = false; //
  isVisible03 = false; //
  isVisible04 = false; //
  isVisible05 = false; //
  isVisible06 = false; //
  isVisible07 = false; // Khởi động lại máy ảo
  isVisible08 = false; // Tắt máy ảo
  actionData: InstancesModel;

  region: number = 3;

  activeCreate: boolean = false;

  constructor(
    private dataService: VMService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public message: NzMessageService
  ) {}

  showModal(cs: string, data: any): void {
    this.actionData = data;
    this.selectedOptionAction = '';
    switch (parseInt(cs, 10)) {
      case 1:
        this.isVisible01 = true;
        break;
      case 2:
        this.isVisible02 = true;
        break;
      case 7:
        this.isVisible07 = true;
        break;
      case 8:
        this.isVisible08 = true;
        break;
      default:
        this.isVisible01 = false;
        this.isVisible02 = false;
    }
  }

  handleOk(cs: number): void {
    this.selectedOptionAction = '';
    switch (cs) {
      case 1:
        this.isVisible01 = false;
        break;
      case 2:
        this.isVisible02 = false;
        break;
      case 7: // Khởi động lại máy ảo
        this.isVisible07 = false;
        var body = {
          command: 'restart',
          id: this.actionData.id,
        };
        this.dataService
          .postAction(this.actionData.id, body)
          .subscribe((data: any) => {
            console.log(data);
            if (data == true) {
              this.message.success('Khởi động lại máy ảo thành công');
            } else {
              this.message.error('Khởi động lại máy ảo không thành công');
            }
          });
        break;
      case 8: // Tắt máy ảo
        this.isVisible08 = false;
        var body = {
          command: 'shutdown',
          id: this.actionData.id,
        };
        this.dataService
          .postAction(this.actionData.id, body)
          .subscribe((data: any) => {
            if (data == true) {
              this.message.success('Tắt máy ảo thành công');
            } else {
              this.message.error('Tắt máy ảo không thành công');
            }
          });
        break;
      default:
        this.isVisible01 = false;
        this.isVisible02 = false;
    }
  }

  handleCancel(): void {
    this.actionData = null;
    this.isVisible01 = false;
    this.isVisible02 = false; //
    this.isVisible03 = false; //
    this.isVisible04 = false; //
    this.isVisible05 = false; //
    this.isVisible06 = false; //
    this.isVisible07 = false; // Khởi động lại máy ảo
    this.isVisible08 = false;
  }

  changeFilterStatus(e: any): void {
    this.searchParam.status = e;
  }

  selectedChecked(e: any): void {
    // @ts-ignore
    this.checkedCashArray = [...e];
  }

  resetForm(): void {
    this.searchParam = {};
    this.getDataList();
  }

  getDataList(e?: NzTableQueryParams) {
    this.loading = true;

    // this.tableConfig.loading = true;
    // const params: SearchCommonVO<any> = {
    //   pageSize: this.tableConfig.pageSize | 10,
    //   pageNum: e?.pageIndex || this.tableConfig.pageIndex |1,
    //   filters: this.searchParam
    // };
    // this.dataService
    //   .getUsers2(1, 10, this.sortKey!, this.sortValue!, this.searchGenderList)
    //   .subscribe((data: any) => {
    //     this.loading = false;
    //     this.dataList = data.results;
    //     this.tableConfig.total = 20;
    //     this.tableConfig.pageIndex = 1;
    //     this.tableLoading(false);
    //     this.checkedCashArray = [...this.checkedCashArray];
    //   });
    this.dataService
      .search(
        this.pageIndex,
        this.pageSize,
        this.region,
        this.searchParam.name,
        this.searchParam.status
      )
      .subscribe({
        next: (data: any) => {
          // Update your component properties with the received data
          this.loading = false;
          this.dataList = data.records; // Assuming 'records' property contains your data
          this.tableConfig.total = data.totalCount;
          this.total = data.totalCount;
          this.tableConfig.pageIndex = this.pageIndex;
          this.tableLoading(false);
          this.checkedCashArray = [...this.checkedCashArray];
        },
        error: (error) => {
          // Handle the error, e.g., display an error message to the user
        },
        complete: () => {
          console.log('Completed'); // This is called when the observable completes
        },
      });
  }

  // Setting permissions
  setRole(id: number): void {
    this.router.navigate(['/admin/system/role-manager/set-role'], {
      queryParams: { id: id },
    });
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

  add(): void {
    // this.modalService.show({ nzTitle: 'New' }).subscribe(
    //   res => {
    //     if (!res || res.status === ModalBtnStatus.Cancel) {
    //       return;
    //     }
    //     const param = { ...res.modalValue };
    //     this.tableLoading(true);
    //     this.addEditData(param, 'addRoles');
    //   },
    //   error => this.tableLoading(false)
    // );
  }

  reloadTable(): void {
    this.message.info('Refresh successfully');
    this.getDataList();
  }

  // Modification
  edit(id: number): void {}

  addEditData(param: Role, methodName: 'editRoles' | 'addRoles'): void {}

  del(id: number[]): void {
    // const ids: string[] = [id];
    this.modalSrv.confirm({
      nzTitle: 'Are you sure you want to delete?',
      nzContent: 'Cannot be restored after deletion',
      nzOnOk: () => {
        this.tableLoading(true);
      },
    });
  }
  // Modify a few items on a page

  changePageSize(e: number): void {
    this.tableConfig.pageSize = e;
  }

  ngOnInit(): void {
    // this.dataService
    // .getUsers2(1,10, this.sortKey!, this.sortValue!, this.searchGenderList)
    // .subscribe((data: any) => {
    //   this.tableLoading(false);
    //   this.tableConfig.total = 20;
    //   this.tableConfig.pageIndex = 1;
    //   this.tableLoading(false);
    //   this.checkedCashArray = [...this.checkedCashArray];
    // });
    this.getDataList();
    this.initTable();
  }
  // ngAfterViewInit(): void {
  //   // This method is called after the component's view has been initialized.
  //   // You can perform tasks related to the view here.
  //   if (this.dataList.length>0) {
  //     this.activeCreate = false;
  //   }else{
  //     this.activeCreate = true;
  //   }
  //   this.cdr.detectChanges();
  // }

  private initTable(): void {
    this.tableConfig = {
      showCheckbox: false,
      headers: [
        {
          title: 'Tên máy ảo',
          field: 'gender',
          // width: 100
        },
        {
          title: 'Note',
          // width: 100,
          field: 'cell',
        },
        {
          title: 'Action',
          tdTemplate: this.operationTpl,
          width: 100,
          fixed: true,
        },
      ],
      total: 0,
      loading: true,
      pageSize: 10,
      pageIndex: 1,
    };
  }

  navigateToCreate() {
    this.router.navigate(['/pages/vm/instances-create']);
  }
}
