import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import PairInfo, {
  AllowAddressPair,
  AllowAddressPairCreateOrDeleteForm,
  AllowAddressPairSearchForm
} from 'src/app/shared/models/allow-address-pair';
import {RegionModel} from "../../../shared/models/region.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {AllowAddressPairService} from "../../../shared/services/allow-address-pair.service";
import {ActivatedRoute} from "@angular/router";
import {ProjectModel} from "../../../shared/models/project.model";
import {NzNotificationService} from "ng-zorro-antd/notification";
import Pagination from "../../../shared/models/pagination";
import {NzTableQueryParams} from "ng-zorro-antd/table";


@Component({
  selector: 'list-allow-address-pair',
  templateUrl: './list-allow-address-pair.component.html',
  styleUrls: ['./list-allow-address-pair.component.less'],
})
export class ListAllowAddressPairComponent implements OnInit {
  @Input() portId: string

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private allowAddressPairService: AllowAddressPairService,
              private notification: NzNotificationService,
              private route: ActivatedRoute) {
  }

  isVisibleCreate = false;
  userId: number

  region = JSON.parse(localStorage.getItem('region')).regionId;

  project = JSON.parse(localStorage.getItem('projectId'));

  validateForm: FormGroup<{
    ipAddress: FormControl<string | null>;
  }>;

  value?: string;

  formSearch: AllowAddressPairSearchForm = new AllowAddressPairSearchForm();

  isVisibleDelete = false;
  isConfirmLoading = false;

  formDeleteOrCreate: AllowAddressPairCreateOrDeleteForm = new AllowAddressPairCreateOrDeleteForm();

  isLoading: boolean = false;

  collection: Pagination<AllowAddressPair> = {
    previousPage: 0,
    totalCount: 0,
    records: [],
    currentPage: 1,
    pageSize: 10

  };

  pageSize: number = 5
  pageNumber: number = 1

  size: number = 0

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    if (this.region != undefined) {
      this.project = project?.id;
    }
    this.formSearch = this.getParam();
    this.getAllowAddressPair(this.formSearch);
  }

  getParam(): AllowAddressPairSearchForm {
    this.formSearch.vpcId = this.project;
    this.formSearch.region = this.region;
    this.formSearch.portId = "08e91567-db66-4034-be81-608dceeb9a5f";
    this.formSearch.pageSize = 5;
    this.formSearch.currentPage = 1;
    if (this.value === undefined) {
      this.formSearch.search = null;
    } else {
      this.formSearch.search = this.value;
    }
    return this.formSearch;
  }

  showModalDelete(): void {
    this.isVisibleDelete = true;
  }

  handleCancelDelete(): void {
    this.isVisibleDelete = false;
  }

  handleOkDelete(pairInfo: PairInfo): void {
    this.isConfirmLoading = true;
    this.formDeleteOrCreate.portId = "08e91567-db66-4034-be81-608dceeb9a5f";
    this.formDeleteOrCreate.pairInfos = [pairInfo];

    this.formDeleteOrCreate.isDelete = true;
    this.formDeleteOrCreate.region = this.region;
    this.formDeleteOrCreate.vpcId = this.project;
    this.formDeleteOrCreate.customerId = this.tokenService.get()?.userId;

    this.isVisibleDelete = false;
``
    this.isLoading = true;
    this.allowAddressPairService.createOrDelete(this.formDeleteOrCreate).subscribe(
      () => {
        this.isLoading = false;
        this.notification.success('Thành công', `Xóa Allow Address Pair thành công`);
        this.getAllowAddressPair(this.formSearch)
      }, () => {
        this.isLoading = false;
        this.notification.error('Thất bại', 'Xóa Allow Address Pair thất bại');
      }
    )

  }

  showModalCreate() {
    if(this.size >= 10 ){
      this.isVisibleCreate = false
      this.notification.warning('','Không thể thêm mới quá 10 Allow Address Pair')
    } else {
      this.isVisibleCreate = true;
    }

  }

  handleCloseCreate() {
    this.isVisibleCreate = false;
  }

  handleOkCreate() {
    this.isVisibleCreate = false
    this.getAllowAddressPair(this.formSearch)
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params
    this.formSearch.pageSize = pageSize;
    this.formSearch.currentPage = pageIndex
    this.getAllowAddressPair(this.formSearch);
  }

  getAllowAddressPair(formSearch: AllowAddressPairSearchForm) {
    this.isLoading = true;
    this.allowAddressPairService.search(formSearch)
      .subscribe((data) => {
        this.isLoading = false;
        this.collection = data
        this.size = this.collection.totalCount
      });
  }

  ngOnInit(): void {
    this.userId = this.tokenService.get()?.userId
    this.formSearch.customerId = this.userId
    this.route.queryParams.subscribe(queryParams => {
      const value = queryParams['param'];
      this.portId = value;
    });
  }

  search() {
    this.formSearch = this.getParam();
    this.getAllowAddressPair(this.formSearch);
  }

  onInputChange(value: string) {
    this.value = value;
  }
}
