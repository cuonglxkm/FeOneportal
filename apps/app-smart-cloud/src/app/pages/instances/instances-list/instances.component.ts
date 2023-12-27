import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
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
import { finalize } from 'rxjs/operators';
import { InstancesService } from '../instances.service';
import { AntTableConfig } from 'src/app/core/models/interfaces/table';
import { PageHeaderType } from 'src/app/core/models/interfaces/page';
import { Role } from 'src/app/core/models/interfaces/role';
import { InstancesModel } from '../instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';

class SearchParam {
  status: string = '';
  name: string = '';
}

@Component({
  selector: 'one-portal-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.less'],
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
  emptyList: InstancesModel[] = [];
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

  listVLAN: [{ id: ''; text: 'Chọn VLAN' }];
  listSubnet: [{ id: ''; text: 'Chọn Subnet' }];
  listIPAddress: [{ id: ''; text: 'Chọn địa chỉ IP' }];
  listIPAddressOnVLAN: [{ id: ''; text: 'Chọn địa chỉ IP' }];

  selectedOptionAction: string;
  actionData: InstancesModel;

  region: number;
  projectId: number;
  activeCreate: boolean = false;
  isSearch: boolean = false;
  isVisibleGanVLAN: boolean = false;
  isVisibleGoKhoiVLAN: boolean = false;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public message: NzMessageService,
    private viewContainerRef: ViewContainerRef // private bsModalRef: BsModalRef
  ) {}

  showModal(cs: string, data: any): void {
    this.actionData = data;
    this.selectedOptionAction = '';
    switch (parseInt(cs, 10)) {
      case 1:
        this.navigateToCreateBackup(this.actionData.id);
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        this.navigateToEdit(this.actionData.id);
        break;
      case 5:
        this.isVisibleGanVLAN = true;
        break;
      case 6:
        this.isVisibleGoKhoiVLAN = true;
        break;
      case 7:
        this.restartInstance();
        break;
      case 8:
        this.shutdownInstance();
        break;
      default:
    }
  }

  changeFilterStatus(e: any): void {
    this.searchParam.status = e;
  }
  changeName(e: any): void {
    this.searchParam.name = e;
  }

  selectedChecked(e: any): void {
    // @ts-ignore
    this.checkedCashArray = [...e];
  }

  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.activeCreate = false;
    this.isSearch = false;
    this.loading = true;
    this.region = region.regionId;
    console.log(this.tokenService.get()?.userId);
  }

  onProjectChange(project: ProjectModel) {
    this.activeCreate = false;
    this.isSearch = false;
    this.loading = true;
    this.projectId = project.id;
    this.getDataList();
  }

  resetForm(): void {
    this.searchParam = {};
    this.getDataList();
  }

  getDataList(reset = false) {
    if (reset) {
      this.pageIndex = 1;
    }
    if (
      this.searchParam.name != undefined ||
      this.searchParam.status != undefined
    ) {
      this.isSearch = true;
      this.cdr.detectChanges();
    }

    if (this.region != undefined && this.region != null) {
      this.loading = true;
      this.dataService
        .search(
          this.pageIndex,
          this.pageSize,
          this.region,
          this.projectId,
          this.searchParam.name,
          this.searchParam.status,
          true,
          this.tokenService.get()?.userId
        )
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe(
          (data) => {
            // Update your component properties with the received data
            if (data != null && data.records && data.records.length > 0) {
              this.activeCreate = false;
              this.isSearch = true;
              this.dataList = data.records; // Assuming 'records' property contains your data
              this.tableConfig.total = data.totalCount;
              this.total = data.totalCount;
              this.tableConfig.pageIndex = this.pageIndex;
              this.tableLoading(false);
              this.checkedCashArray = [...this.checkedCashArray];
            } else {
              this.activeCreate = true;
            }
            this.cdr.detectChanges();
          },
          (error) => {
            this.activeCreate = true;
          }
        );
    }
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

  ngOnInit() {
    this.searchParam.status = '';
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
  getStatus(value: string): string {
    const foundItem = this.filterStatus.find((item) => item.value === value);

    if (foundItem) {
      return foundItem.text;
    } else {
      return value;
    }
  }

  handleCancelGanVLAN(): void {
    this.actionData = null;
    this.isVisibleGanVLAN = false;
  }

  handleOkGanVLAN(): void {
    this.message.success('Gắn VLAN thành công');
    //this.actionData = null;
    this.isVisibleGanVLAN = false;
    // var body = {};
    // this.dataService.postAction(this.actionData.id, body).subscribe(
    //   (data: any) => {
    //     console.log(data);
    //     if (data == true) {
    //       this.message.success('Gắn VLAN thành công');
    //     } else {
    //       this.message.error('Gắn VLAN không thành công');
    //     }
    //   },
    //   () => {
    //     this.message.error('Gắn VLAN không thành công');
    //   }
    // );
  }

  handleCancelGoKhoiVLAN(): void {
    this.actionData = null;
    this.isVisibleGoKhoiVLAN = false;
  }

  handleOkGoKhoiVLAN(): void {
    this.message.success('Gỡ khỏi VLAN thành công');
    this.isVisibleGoKhoiVLAN = false;
  }

  isExpand = false;
  clickIPAddress(): void {
    this.isExpand = !this.isExpand;
  }

  shutdownInstance(): void {
    this.modalSrv.create({
      nzTitle: 'Tắt máy ảo',
      nzContent: 'Quý khách chắn chắn muốn thực hiện tắt máy ảo?',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        var body = {
          command: 'shutdown',
          id: this.actionData.id,
        };
        this.dataService.postAction(this.actionData.id, body).subscribe(
          (data: any) => {
            if (data == true) {
              this.message.success('Tắt máy ảo thành công');
            } else {
              this.message.error('Tắt máy ảo không thành công');
            }
          },
          () => {
            this.message.error('Tắt máy ảo không thành công');
          }
        );
      },
    });
  }
  restartInstance(): void {
    this.modalSrv.create({
      nzTitle: 'Khởi động lại máy ảo',
      nzContent: 'Quý khách chắc chắn muốn thực hiện khởi động lại máy ảo?',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        var body = {
          command: 'restart',
          id: this.actionData.id,
        };
        this.dataService.postAction(this.actionData.id, body).subscribe(
          (data: any) => {
            console.log(data);
            if (data == true) {
              this.message.success('Khởi động lại máy ảo thành công');
            } else {
              this.message.error('Khởi động lại máy ảo không thành công');
            }
          },
          () => {
            this.message.error('Khởi động lại máy ảo không thành công');
          }
        );
      },
    });
  }
  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/instances/instances-create']);
  }
  navigateToEdit(id: number) {
    this.router.navigate(['/app-smart-cloud/instances/instances-edit/' + id]);
  }
  navigateToDetail(id: number) {
    this.router.navigate(['/app-smart-cloud/instances/instances-detail/' + id]);
  }

  navigateToCreateBackup(id: number) {
    console.log('data ', id);
    // this.dataService.setSelectedObjectId(id)
    this.router.navigate([
      '/app-smart-cloud/instance/' + id + '/create-backup-vm',
    ]);
  }
}
