import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { SecurityGroupService } from '../../../shared/services/security-group.service';
import { SecurityGroup, SecurityGroupSearchCondition } from '../../../shared/models/security-group';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Instance, InstancesModel } from '../../instances/instances.model';
import SecurityGroupRule from '../../../shared/models/security-group-rule';
import { InstancesService } from '../../instances/instances.service';
import Pagination from '../../../shared/models/pagination';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { ProjectSelectDropdownComponent } from 'src/app/shared/components/project-select-dropdown/project-select-dropdown.component';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { PolicyService } from 'src/app/shared/services/policy.service';

@Component({
  selector: 'one-portal-list-security-group',
  templateUrl: './list-security-group.component.html',
  styleUrls: ['./list-security-group.component.less']
})
export class ListSecurityGroupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  pageIndex: number = 1;
  pageSize: number = 5;

  isBegin: boolean = false;
  isLoadingSG: boolean = false;

  listSG: SecurityGroup[] = [];
  listInbound: SecurityGroupRule[] = [];
  listOutbound: SecurityGroupRule[] = [];

  selectedSG: SecurityGroup;

  isLoadingVm: boolean = false;

  listInstances: InstancesModel[];
  collection: Pagination<Instance>;
  isCreateSG: boolean = false;
  @ViewChild('projectCombobox') projectCombobox: ProjectSelectDropdownComponent;
  constructor(private securityGroupService: SecurityGroupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private instanceService: InstancesService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private notification: NzNotificationService,
              private policyService: PolicyService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    if(this.projectCombobox){
      this.projectCombobox.loadProjects(true, region.regionId);
    }
    this.getListSG(true);
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;
    this.getListSG(true);
    this.getInstances();
    this.listInbound = [];
    this.listOutbound = [];
    this.isCreateSG = this.policyService.hasPermission("securitygroup:List") &&
      this.policyService.hasPermission("securitygroup:Create");
  }

  onSecurityGroupChange(value) {
    this.selectedSG = value
    this.listInbound = this.selectedSG?.rulesInfo.filter(value => value.direction === 'ingress');
    this.listOutbound = this.selectedSG?.rulesInfo.filter(value => value.direction === 'egress');
    this.getInstances()
  }

  getListSG(isBegin) {
    this.isLoadingSG = true;
    let conditionSearch = new SecurityGroupSearchCondition();
    conditionSearch.userId = this.tokenService.get()?.userId;
    conditionSearch.projectId = this.project;
    conditionSearch.regionId = this.region;

    console.log('condition log', conditionSearch);
    this.securityGroupService.search(conditionSearch).subscribe(data => {
      this.isLoadingSG = false;
      this.listSG = data;

      this.listSG.forEach(item => {
        if(item.name.includes('default')) {
          this.selectedSG = item
        }
      })

      if (isBegin) {
        this.isBegin = this.listSG.length < 1 || this.listSG === null ? true : false;
      }
    }, error => {
      this.isLoadingSG = false;
      this.listSG = null;
      if(error.status == 403){
        this.notification.error(
          error.statusText,
          this.i18n.fanyi('app.non.permission')
        );
      }
    });
  }

  handleOKCreateSG() {
    this.getListSG(false);
  }

  handleOKDeleteSG() {
    this.getListSG(false);
  }

  handleAttachSG() {
    this.getListSG(false)
  }

  handleDetachSG() {
    this.getListSG(false)
  }

  getInstances() {
    this.isLoadingVm = true;
    this.instanceService.search(this.pageIndex, this.pageSize, this.region,
      this.project, '', '', true, this.tokenService.get()?.userId).subscribe(data => {
      this.isLoadingVm = false;
      this.listInstances = data?.records

      this.listInstances = this.listInstances?.filter(item => ['ACTIVE'].includes(item?.taskState))
      console.log('data filter', this.listInstances)
    }, error => {
      this.isLoadingVm = false;
      this.listInstances = null;
    });
  }

  onPageSizeChange(event: any) {
    this.pageSize = event;
    this.getInstances();
  }

  onPageIndexChange(event: any) {
    this.pageIndex = event;
    this.getInstances();
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;


    this.getInstances()
  }
}
