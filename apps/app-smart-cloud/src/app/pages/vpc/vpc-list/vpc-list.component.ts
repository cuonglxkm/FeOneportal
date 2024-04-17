import { Component, Inject } from '@angular/core';
import { RegionModel } from '../../../shared/models/region.model';
import { IpPublicModel } from '../../../shared/models/ip-public.model';
import { VpcModel } from '../../../shared/models/vpc.model';
import { finalize } from 'rxjs/operators';
import { IpPublicService } from '../../../shared/services/ip-public.service';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { InstancesService } from '../../instances/instances.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VpcService } from '../../../shared/services/vpc.service';
import { getCurrentRegionAndProject } from '@shared';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'one-portal-vpc-list',
  templateUrl: './vpc-list.component.html',
  styleUrls: ['./vpc-list.component.less']
})
export class VpcListComponent {
  regionId = JSON.parse(localStorage.getItem('region')).regionId;
  isBegin: Boolean = false;
  size = 10;
  index: number = 1;
  total: number = 0;
  loading = false;
  isVisibleDelete = false;
  isVisibleDeleteVPC = false;

  listOfData: VpcModel[] = [];

  searchKey = '';
  selectedStatus = '';
  statusData = [
    { name: 'Tất cả trạng thái', value: '' },
    { name: 'ENABLE', value: 'ENABLE' },
    { name: 'DISABLE', value: 'DISABLE' },
    { name: 'DELETED', value: 'DELETED' }];

  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '600px'
  };
  nameDelete: any = '';
  itemDelete: any;
  disableDelete = true;
  isVisibleEditNormal= false;
  form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)] }),
    description: new FormControl(''),
  });

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private vpcService: VpcService,
              private notification: NzNotificationService) {

  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.regionId = regionAndProject.regionId;
    this.getData(true);
  }

  onRegionChange(region: RegionModel) {
    this.regionId = region.regionId;
    this.getData(true);
  }

  getData(isCheckBegin: boolean): void {
    this.loading = true;
    this.vpcService.getData(this.searchKey, this.selectedStatus, this.tokenService.get()?.userId, this.regionId, this.size, this.index)
      .pipe(finalize(() => this.loading = false))
      .subscribe(baseResponse => {
        this.listOfData = baseResponse.records;
        this.total = baseResponse.totalCount;
        if (isCheckBegin) {
          this.isBegin = this.listOfData === null || this.listOfData.length < 1 ? true : false;
        }
      });
  }

  onPageSizeChange(event: any) {
    this.size = event;
    this.getData(false);
  }

  onPageIndexChange(event: any) {
    this.index = event;
    this.getData(false);
  }

  edit(item: any) {
    if (item.type == 'VPC') {
      this.router.navigate(['/app-smart-cloud/vpc/update/' + item.id]);
    } else {
      this.isVisibleEditNormal = true;
    }
  }

  delete(itemDelete: any) {
    this.itemDelete = itemDelete;
    if(itemDelete.type == 'VPC') {
      this.isVisibleDeleteVPC = true;
    } else {
      this.isVisibleDelete = true;
    }

  }

  handleCancel() {
    this.nameDelete = '';
    this.isVisibleDelete = false;
    this.isVisibleDeleteVPC = false;
    this.isVisibleEditNormal = false;
    this.disableDelete = true;
  }

  openIpDelete() {
    this.vpcService.delete(this.itemDelete.cloudIdentityId)
      .pipe(finalize(() => {
        this.getData(true);
        this.isVisibleDelete = false;
        this.isVisibleDeleteVPC = false;
        this.disableDelete = true;
      }))
      .subscribe(
        {
          next: post => {
            this.notification.success('Thành công', 'Xóa thành công VPC');
          },
          error: e => {
            this.notification.error('Thất bại', 'Xóa thất bại VPC');
          }
        }
      );
  }

  search(inputSearch: any) {
    if (inputSearch !== null) {
      this.searchKey = inputSearch;
    }
    this.getData(false);
  }

  createVpc() {
    this.router.navigate(['/app-smart-cloud/vpc/create']);
  }

  viewDetail(id: number) {
    this.router.navigate(['/app-smart-cloud/vpc/detail/' + id]);
  }

  confirmNameDelete(event: any) {
    this.nameDelete = '';
    if (event == this.itemDelete.displayName) {
      this.disableDelete = false;
    } else {
      this.disableDelete = true;
    }
  }

  redirectTo() {

  }

  updateVpc() {

  }
}
