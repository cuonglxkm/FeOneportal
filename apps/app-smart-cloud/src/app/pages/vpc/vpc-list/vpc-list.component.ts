import {Component, Inject} from '@angular/core';
import {RegionModel} from "../../../shared/models/region.model";
import {IpPublicModel} from "../../../shared/models/ip-public.model";
import {VpcModel} from "../../../shared/models/vpc.model";
import {finalize} from "rxjs/operators";
import {IpPublicService} from "../../../shared/services/ip-public.service";
import {Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {InstancesService} from "../../instances/instances.service";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {VpcService} from "../../../shared/services/vpc.service";
import {getCurrentRegionAndProject} from "@shared";

@Component({
  selector: 'one-portal-vpc-list',
  templateUrl: './vpc-list.component.html',
  styleUrls: ['./vpc-list.component.less'],
})
export class VpcListComponent {
  regionId = JSON.parse(localStorage.getItem('region')).regionId;
  isBegin: Boolean = false;
  size = 10;
  index: number = 1;
  total: number = 0;
  loading = false;
  isVisibleDelete = false;

  listOfData: VpcModel[] = [];

  searchKey = '';
  selectedStatus = '';
  statusData = [
    {name: 'Tất cả trạng thái', value: ''},
    {name: 'Khởi tạo', value: '0'},
    {name: 'Đang sử dụng', value: '2'}];

  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '600px',
  };

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private vpcService: VpcService,
              private notification: NzNotificationService,) {

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
    this.size = event
    this.getData(false);
  }

  onPageIndexChange(event: any) {
    this.index = event;
    this.getData(false);
  }

  edit(id: number) {

  }

  delete(id: number) {
    this.isVisibleDelete = true;
  }

  handleCancel() {
    this.isVisibleDelete = false;
  }

  openIpDelete() {

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
}
