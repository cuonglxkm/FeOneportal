import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { InstancesService } from '../instances.service';
import { PageHeaderType } from 'src/app/core/models/interfaces/page';
import { InstancesModel } from '../instances.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from 'src/app/shared/models/region.model';
import { ProjectModel } from 'src/app/shared/models/project.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';

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
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Danh sách máy ảo',
    breadcrumb: ['Home', 'Dịch vụ', 'VM'],
  };
  dataList: InstancesModel[] = [];
  emptyList: InstancesModel[] = [];

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
    { text: 'Đang khởi tạo', value: 'DANGKHOITAO' },
    { text: 'Khởi tạo', value: 'KHOITAO' },
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
  isVisibleGanVLAN: boolean = false;
  isVisibleGoKhoiVLAN: boolean = false;

  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private dataService: InstancesService,
    private modalSrv: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService
  ) {}

  selectedChecked(e: any): void {
    // @ts-ignore
    this.checkedCashArray = [...e];
  }

  onRegionChange(region: RegionModel) {
    // Handle the region change event
    this.activeCreate = false;
    this.loading = true;
    this.region = region.regionId;
    console.log(this.tokenService.get()?.userId);
  }

  onProjectChange(project: ProjectModel) {
    this.activeCreate = false;
    this.loading = true;
    this.projectId = project.id;
    this.getDataList();
  }

  doSearch() {
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
        .subscribe({
          next: (next) => {
            this.dataList = next.records; // Assuming 'records' property contains your data
            this.total = next.totalCount;
          },
          error: (error) => {
            this.notification.error(
              '',
              'Lấy danh sách máy ảo không thành công'
            );
          },
        });
    }
  }

  getDataList() {
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
        .subscribe({
          next: (data) => {
            // Update your component properties with the received data
            if (data != null && data.records && data.records.length > 0) {
              this.activeCreate = false;
              this.dataList = data.records; // Assuming 'records' property contains your data
              this.total = data.totalCount;
            } else {
              this.activeCreate = true;
            }
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.activeCreate = true;
            this.notification.error(
              '',
              'Lấy danh sách máy ảo không thành công'
            );
          },
        });
    }
  }

  reloadTable() {
    this.dataList = [];
    this.getDataList();
  }

  ngOnInit() {
    this.searchParam.status = '';
    this.getDataList();
  }

  getStatus(value: string): string {
    const foundItem = this.filterStatus.find((item) => item.value === value);

    if (foundItem) {
      return foundItem.text;
    } else {
      return value;
    }
  }

  showHandleGanVLAN() {
    this.isVisibleGanVLAN = true;
  }

  handleCancelGanVLAN(): void {
    this.actionData = null;
    this.isVisibleGanVLAN = false;
  }

  handleOkGanVLAN(): void {
    this.notification.success('', 'Gắn VLAN thành công');
    //this.actionData = null;
    this.isVisibleGanVLAN = false;
    // var body = {};
    // this.dataService.postAction(this.actionData.id, body).subscribe(
    //   (data: any) => {
    //     console.log(data);
    //     if (data == true) {
    //       this.notification.success('', 'Gắn VLAN thành công');
    //     } else {
    //       this.notification.error('', 'Gắn VLAN không thành công');
    //     }
    //   },
    //   () => {
    //     this.notification.error('', 'Gắn VLAN không thành công');
    //   }
    // );
  }

  showHandleGoKhoiVLAN() {
    this.isVisibleGoKhoiVLAN = true;
  }

  handleCancelGoKhoiVLAN(): void {
    this.actionData = null;
    this.isVisibleGoKhoiVLAN = false;
  }

  handleOkGoKhoiVLAN(): void {
    this.notification.success('', 'Gỡ khỏi VLAN thành công');
    this.isVisibleGoKhoiVLAN = false;
  }

  isExpand = false;
  clickIPAddress(): void {
    this.isExpand = !this.isExpand;
  }

  shutdownInstance(id: number): void {
    this.modalSrv.create({
      nzTitle: 'Tắt máy ảo',
      nzContent: 'Quý khách chắn chắn muốn thực hiện tắt máy ảo?',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        var body = {
          command: 'shutdown',
          id: id,
        };
        this.dataService.postAction(body).subscribe({
          next: (data: any) => {
            if (data == 'Thao tác thành công') {
              this.notification.success('', 'Tắt máy ảo thành công');
              this.reloadTable();
            } else {
              this.notification.error('', 'Tắt máy ảo không thành công');
            }
          },
          error: (e) => {
            this.notification.error('', 'Tắt máy ảo không thành công');
          },
        });
      },
    });
  }
  startInstance(id: number): void {
    this.modalSrv.create({
      nzTitle: 'Bật máy ảo',
      nzContent: 'Quý khách chắn chắn muốn thực hiện bật máy ảo?',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        var body = {
          command: 'start',
          id: id,
        };
        this.dataService.postAction(body).subscribe({
          next: (data: any) => {
            if (data == 'Thao tác thành công') {
              this.notification.success('', 'Bật máy ảo thành công');
              this.reloadTable();
            } else {
              this.notification.error('', 'Bật máy ảo không thành công');
            }
          },
          error: (e) => {
            this.notification.error('', 'Bật máy ảo không thành công');
          },
        });
      },
    });
  }
  restartInstance(id: number): void {
    this.modalSrv.create({
      nzTitle: 'Khởi động lại máy ảo',
      nzContent: 'Quý khách chắc chắn muốn thực hiện khởi động lại máy ảo?',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        var body = {
          command: 'restart',
          id: id,
        };
        this.dataService.postAction(body).subscribe({
          next: (data) => {
            if (data == 'Thao tác thành công') {
              this.notification.success('', 'Khởi động lại máy ảo thành công');
              this.reloadTable();
            } else {
              ('Khởi động lại máy ảo không thành công');
            }
          },
          error: (e) => {
            this.notification.error(
              '',
              'Khởi động lại máy ảo không thành công'
            );
          },
        });
      },
    });
  }
  rescueInstance(id: number): void {
    this.modalSrv.create({
      nzTitle: 'RESCUE máy ảo',
      nzContent: 'Quý khách chắn chắn muốn thực hiện RESCUE máy ảo?',
      nzOkText: 'Đồng ý',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        var body = {
          command: 'rescue',
          id: id,
        };
        this.dataService.postAction(body).subscribe({
          next: (data) => {
            if (data == 'Thao tác thành công') {
              this.notification.success('', 'RESCUE máy ảo thành công');
              this.reloadTable();
            } else {
              this.notification.error('', 'RESCUE máy ảo không thành công');
            }
          },
          error: (e) => {
            this.notification.error('', 'RESCUE máy ảo không thành công');
          },
        });
      },
    });
  }

  navigateToCreate() {
    this.router.navigate(['/app-smart-cloud/instances/instances-create']);
  }
  navigateToEdit(id: number) {
    this.router.navigate(['/app-smart-cloud/instances/instances-edit/' + id]);
  }

  navigateToCreateBackup(id: number) {
    console.log('data ', id);
    // this.dataService.setSelectedObjectId(id)
    this.router.navigate([
      '/app-smart-cloud/instance/' + id + '/create-backup-vm',
    ]);
  }
}
