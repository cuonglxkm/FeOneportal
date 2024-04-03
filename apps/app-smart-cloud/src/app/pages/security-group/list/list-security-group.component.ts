import { Component, Inject, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { SecurityGroupService } from '../../../shared/services/security-group.service';
import { SecurityGroup, SecurityGroupSearchCondition } from '../../../shared/models/security-group';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';
import { Instance, InstancesModel } from '../../instances/instances.model';
import SecurityGroupRule from '../../../shared/models/security-group-rule';
import { InstancesService } from '../../instances/instances.service';
import Pagination from '../../../shared/models/pagination';

@Component({
  selector: 'one-portal-list-security-group',
  templateUrl: './list-security-group.component.html',
  styleUrls: ['./list-security-group.component.less']
})
export class ListSecurityGroupComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
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

  constructor(private securityGroupService: SecurityGroupService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private instanceService: InstancesService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.getListSG(true);
  }

  projectChanged(project: ProjectModel) {
    this.project = project.id;
    this.getListSG(true);
  }

  onSecurityGroupChange() {
    this.listInbound = this.selectedSG.rulesInfo.filter(value => value.direction === 'ingress');
    this.listOutbound = this.selectedSG.rulesInfo.filter(value => value.direction === 'egress');
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

      data.forEach(item => {
        if(item.name.includes("default")) {
          this.selectedSG = item
        }
      })

      if (isBegin) {
        this.isBegin = this.listSG.length < 1 || this.listSG === null ? true : false;
      }
    }, error => {
      this.isLoadingSG = false;
      this.listSG = null;
    });
  }

  handleOKCreateSG() {
    this.getListSG(false);
  }

  handleOKDeleteSG() {
    this.getListSG(false);
  }

  getInstances() {
    this.isLoadingVm = true;
    this.instanceService.search(this.pageIndex, this.pageSize, this.region,
      this.project, '', 'KHOITAO', true, this.tokenService.get()?.userId).subscribe(data => {
      this.isLoadingVm = false;
      console.log('data', data.records)
      data.records?.forEach(item => {
        console.log("bool", item.taskState?.includes("ACTIVE"))
        if (item.taskState?.includes("ACTIVE")) {
          if(this.listInstances == undefined || this.listInstances == null) {
            this.listInstances = [item]
          } else {
            this.listInstances?.push(item)
          }
        }
      });

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
