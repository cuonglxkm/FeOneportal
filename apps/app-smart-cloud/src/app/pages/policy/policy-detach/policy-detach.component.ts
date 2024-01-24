import {Component, OnInit} from '@angular/core';
import {ProjectModel} from "../../../shared/models/project.model";
import {RegionModel} from "../../../shared/models/region.model";
import {NzSelectOptionInterface} from "ng-zorro-antd/select";
import {ActivatedRoute} from "@angular/router";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {NzNotificationService} from "ng-zorro-antd/notification";
import {PopupDetachPolicyComponent} from "../popup-policy/popup-detach-policy.component";
import {PolicyService} from "../../../shared/services/policy.service";
import {NzTableQueryParams} from "ng-zorro-antd/table";
import {AttachOrDetachRequest} from "../policy.model";

@Component({
  selector: 'one-portal-policy-detach',
  templateUrl: './policy-detach.component.html',
  styleUrls: ['./policy-detach.component.less'],
})
export class PolicyDetachComponent implements OnInit {

  region = JSON.parse(localStorage.getItem('region')).regionId;

  project = JSON.parse(localStorage.getItem('projectId'));

  typeSearch: number;

  entitiesNameSearch: string;

  optionsEntities: NzSelectOptionInterface[] = [
    {label: 'Tất cả các loại', value: null},
    {label: 'Users', value: 1},
    {label: 'Users Groups', value: 2},

  ];

  policyName: string;
  checked = false;
  indeterminate = false;
  listOfData: any;
  listOfCurrentPageData: any;
  setOfCheckedId = new Set<string>();
  isLoadingEntities: boolean;

  totalData: number;
  currentPage: number = 1;
  pageSize: number = 5;


  searchEntities() {
    this.doGetAttachedEntities(this.policyName, this.entitiesNameSearch, this.typeSearch, this.pageSize, this.currentPage);
  }


  updateCheckedSet(name: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(name);
    } else {
      this.setOfCheckedId.delete(name);
    }
  }

  onCurrentPageDataChange(listOfCurrentPageData: any): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData.every(({name}) => this.setOfCheckedId.has(name));
    this.indeterminate = listOfEnabledData.some(({name}) => this.setOfCheckedId.has(name)) && !this.checked;
  }

  onItemChecked(name: string, checked: boolean): void {
    this.updateCheckedSet(name, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .forEach(({name}) => this.updateCheckedSet(name, checked));
    this.refreshCheckedStatus();
  }

  detachPolicy() {
    const requestData = this.listOfData.filter(data => this.setOfCheckedId.has(data.name));

    const modal: NzModalRef = this.modalService.create({
      nzTitle: 'Detach Policy',
      nzContent: PopupDetachPolicyComponent,
      nzFooter: [
        {
          label: 'Hủy',
          type: 'default',
          onClick: () => modal.destroy()
        },
        {
          label: 'Đồng ý',
          type: 'primary',
          onClick: () => {
            this.doDetachPolicy(requestData, this.policyName);
            modal.destroy()
          }
        }
      ]
    });

  }

  private doDetachPolicy(requestData: any, policyName: string) {

    let request = new AttachOrDetachRequest();
    request.policyName = policyName;
    request.action = 'detach'
    request.items = requestData;
    console.log(request);
    this.policiService.attachOrDetach(request).subscribe(data => {
        this.notification.success('Thành công', 'Gỡ Policy thành công');
        this.searchEntities();
      },
      error => {
        this.notification.error('Có lỗi xảy ra', 'Gỡ Policy thất bại');
      }
    )


  }

  goBack() {

  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
  }

  ngOnInit(): void {
    const url = this.activatedRoute.snapshot.url;
    this.policyName = url[url.length - 1].path;
    this.doGetAttachedEntities(this.policyName, null, null, 5, 1);
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const {pageSize, pageIndex} = params;
    this.pageSize = pageSize;
    this.currentPage = pageIndex;
    this.searchEntities();
  }

  private doGetAttachedEntities(policyName: string, entityName: string, type: number, pageSize: number, currentPage: number) {
    this.isLoadingEntities = true;
    this.policiService.getAttachedEntities(policyName, entityName, type, pageSize, currentPage).subscribe(
      data => {
        this.totalData = data.totalCount;
        this.listOfData = data.records;
        this.isLoadingEntities = false;
      },
      error => {
        this.notification.error('Có lỗi xảy ra', 'Lấy danh sách Attached Entities thất bại');
        this.isLoadingEntities = false;
      }
    )
  }

  constructor(
    private policiService: PolicyService,
    private activatedRoute: ActivatedRoute,
    private modalService: NzModalService,
    private notification: NzNotificationService,) {
  }

}
