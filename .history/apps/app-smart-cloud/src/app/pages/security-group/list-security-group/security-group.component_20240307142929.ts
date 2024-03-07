import {Component, Inject, OnInit} from '@angular/core';
import {
  ExecuteAttachOrDetach,
  SecurityGroup,
  SecurityGroupSearchCondition
} from "../../../shared/models/security-group";
import {SecurityGroupService} from "../../../shared/services/security-group.service";
import SecurityGroupRule from "../../../shared/models/security-group-rule";
import {RegionModel} from "../../../shared/models/region.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {ActivatedRoute} from '@angular/router';
import {ProjectModel} from "../../../shared/models/project.model";
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {Instance, InstanceFormSearch} from "../../instances/instances.model";
import {InstanceService} from "../../../shared/services/instance.service";
import Pagination from "../../../shared/models/pagination";

@Component({
  selector: 'one-portal-security-group',
  templateUrl: './security-group.component.html',
  styleUrls: ['./security-group.component.less'],
})
export class SecurityGroupComponent implements OnInit {

  conditionSearch: SecurityGroupSearchCondition = new SecurityGroupSearchCondition();

  options: SecurityGroup[] = [];

  selectedValue: SecurityGroup;

  listInbound: SecurityGroupRule[] = []

  listOutbound: SecurityGroupRule[] = []

  listInstance: Instance[] = []

  condition: InstanceFormSearch = new InstanceFormSearch()

  region = JSON.parse(localStorage.getItem('region')).regionId;

  project = JSON.parse(localStorage.getItem('projectId'));

  pageSize: number = 5
  pageNumber: number = 1

  isVisibleAttach = false
  attachOrDetachForm: ExecuteAttachOrDetach = new ExecuteAttachOrDetach()
  isLoadingAttach = false

  isVisibleDetach = false

  instanceId: number

  collection: Pagination<Instance>

  isLoading = false

  isBegin: boolean = false

  constructor(private securityGroupService: SecurityGroupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private route: ActivatedRoute,
              private notification: NzNotificationService,
              private instanceService: InstanceService) {
  }

  onSecurityGroupChange(): void {
    // this.getListInbound();
    this.listInbound = this.selectedValue.rulesInfo.filter(value => value.direction === 'ingress')
    this.listOutbound = this.selectedValue.rulesInfo.filter(value => value.direction === 'egress')
    this.getInstances()
  }

  handleOk(): void {
    this.selectedValue = undefined
    this.listInbound = []
    this.listOutbound = []
    this.listInstance = []
    this.getSecurityGroup();
  }

  handleOkCreate() {
    this.getSecurityGroup();
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId
    // this.conditionSearch.regionId = this.region;
  }


  projectChanged(project: ProjectModel) {
    this.project = project?.id
    // this.conditionSearch.projectId = project?.id;
    this.selectedValue = undefined
    this.listInbound = []
    this.listOutbound = []
    this.listInstance = []
    this.getSecurityGroup();
    this.getInstances()
  }

  checkNullObject(object: any): Boolean {
    if (object == null || object == undefined) {
      return true;
    }

    return false;
  }

  getSecurityGroup(isCheckBegin: boolean) {
    this.isLoading = true
    this.conditionSearch.regionId = this.region
    this.conditionSearch.projectId = this.project
    if (this.conditionSearch.regionId
      && this.conditionSearch.userId
      && this.conditionSearch.projectId) {
      this.securityGroupService.search(this.conditionSearch)
        .subscribe((data) => {
          this.isLoading = false
          this.options = data;
          if (isCheckBegin) {
            this.isBegin = this.checkNullObject(this.listOfData) || this.listOfData.length < 1 ? true : false;
          }
        }, error => {
          this.isLoading = false
          this.options = null;
        })
    }
  }

  getInstances() {
    this.isLoading = true
    this.instanceService.search(this.pageNumber, this.pageSize, this.region,
      this.project, '', '', true, this.tokenService.get()?.userId)
      .subscribe(data => {
        this.isLoading = false
        this.collection = data
        this.listInstance = data.records
        // console.log('data', this.listInstance)
      }, error => {
        this.isLoading = false
        this.collection = null
        this.notification.error('Thất bại', 'Lấy thông tin máy ảo thất bại')
      })
  }

  // onQueryParamsInstanceChange(params: NzTableQueryParams) {
  //     const {pageSize, pageIndex} = params
  //     this.pageSize = pageSize;
  //     this.pageNumber = pageIndex
  //     this.getInstances()
  // }

  onPageSizeChange(event: any) {
    this.pageSize = event
    this.getInstances();
  }

  onPageIndexChange(event: any) {
    this.pageNumber = event;
    this.getInstances();
  }


  ngOnInit() {
    this.conditionSearch.projectId = this.project
    this.conditionSearch.userId = this.tokenService.get()?.userId
    this.conditionSearch.regionId = this.region
    this.route.queryParams.subscribe(params => {
      this.conditionSearch.regionId = params['regionId'];
      this.conditionSearch.securityGroupId = params['securityGroupId'];
      if (this.conditionSearch.regionId
        && this.conditionSearch.securityGroupId
        && this.conditionSearch.projectId) {
        this.securityGroupService.search(this.conditionSearch)
          .subscribe((data) => {
            if (data) {
              const index = data.findIndex(v => v.id === this.conditionSearch.securityGroupId) || 0
              this.selectedValue = data[index]
              this.listInbound = data[index].rulesInfo.filter(value => value.direction === 'ingress')
              this.listOutbound = data[index].rulesInfo.filter(value => value.direction === 'egress')
            }
            this.options = data;
          }, error => {
            this.notification.error('Thất bại', `Lấy dữ liệu thất bại`);
          })

      }

      this.getInstances()

    });
  }

  //attach
  showModalAttach(instanceId): void {
    this.instanceId = instanceId
    this.isVisibleAttach = true;
  }

  handleOkAttach(): void {
    // console.log('id', this.instanceId)
    this.isVisibleAttach = false;

    this.attachOrDetachForm.securityGroupId = this.selectedValue.id
    this.attachOrDetachForm.instanceId = this.instanceId
    this.attachOrDetachForm.action = 'attach'
    this.attachOrDetachForm.userId = this.tokenService.get()?.userId
    this.attachOrDetachForm.regionId = this.region
    this.attachOrDetachForm.projectId = this.project
    this.isLoadingAttach = true
    this.securityGroupService.attachOrDetach(this.attachOrDetachForm).subscribe(data => {
      this.isLoadingAttach = false
      this.notification.success('Thành công', 'Gán Security Group vào máy ảo thành công')
      this.getInstances()
    }, error => {
      this.notification.error('Thất bại', 'Gán Security Group vào máy ảo thất bại')
    })
  }

  handleCancelAttach(): void {
    this.isVisibleAttach = false;
  }

  //detach
  showModalDetach(instanceId: number): void {
    // this.instanceId = instanceId
    this.isVisibleDetach = true;
  }

  handleOkDetach(): void {
    this.isVisibleDetach = false;
    this.attachOrDetachForm.securityGroupId = this.selectedValue.id
    this.attachOrDetachForm.instanceId = this.instanceId
    this.attachOrDetachForm.action = 'detach'
    this.attachOrDetachForm.userId = this.tokenService.get()?.userId
    this.attachOrDetachForm.regionId = this.region
    this.attachOrDetachForm.projectId = this.project
    this.securityGroupService.attachOrDetach(this.attachOrDetachForm).subscribe(data => {
      this.notification.success('Thành công', 'Gỡ Security Group ra khỏi máy ảo thành công')
      this.getInstances()
    }, error => {
      this.notification.error('Thất bại', 'Gỡ Security Group ra khỏi máy ảo thất bại')
    })
  }

  handleCancelDetach(): void {
    this.isVisibleDetach = false;
  }

}
