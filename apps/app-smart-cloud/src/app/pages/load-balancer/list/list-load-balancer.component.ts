import { Component, Inject, OnInit } from '@angular/core';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';
import { getCurrentRegionAndProject } from '@shared';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Router } from '@angular/router';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { FormSearchListBalancer, LoadBalancerModel } from '../../../shared/models/load-balancer.model';
import { LoadBalancerService } from '../../../shared/services/load-balancer.service';

@Component({
  selector: 'one-portal-list-load-balancer',
  templateUrl: './list-load-balancer.component.html',
  styleUrls: ['./list-load-balancer.component.less'],
})
export class ListLoadBalancerComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  typeVPC: number;
  customerId: number;
  isBegin: boolean = false;
  value: string;
  isLoading: boolean = false;
  response: BaseResponse<LoadBalancerModel[]>;
  pageSize: number = 10;
  pageIndex: number = 1;
  loadBalancerStatus: Map<String, string>;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private router: Router,
              private loadBalancerService: LoadBalancerService) {
    this.loadBalancerStatus = new Map<String, string>();
    this.loadBalancerStatus.set('KHOITAO', 'Đang hoạt động');
    this.loadBalancerStatus.set('HUY', 'Chậm gia hạn');
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.search(true)
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVPC = project?.type;
    this.search(true)
  }

  onInputChange(value) {
    this.value = value
    this.search(false)
  }

  onPageSizeChange(value) {
    this.pageSize = value
    this.search(false)
  }

  onPageIndexChange(value) {
    this.pageIndex = value
    this.search(false)
  }

  navigateToCreate(typeVpc) {
    if(typeVpc === 1) {
      this.router.navigate(['/app-smart-cloud/load-balancer/create/vpc'])
    }
    if(typeVpc === 0) {
      this.router.navigate(['/app-smart-cloud/load-balancer/create'])
    }
  }

  search(isBegin) {
    this.isLoading = true
    let formSearch = new FormSearchListBalancer()
    formSearch.vpcId = this.project
    formSearch.regionId = this.region
    formSearch.name = this.value
    formSearch.pageSize = this.pageSize
    formSearch.currentPage = this.pageIndex

    this.loadBalancerService.search(formSearch).subscribe(data => {
      this.isLoading = false
      this.response = data

      if (isBegin) {
        this.isBegin = this.response.records.length < 1 || this.response.records === null ? true : false;
      }
    }, error => {
      this.isLoading = false
      this.response = null
    })
  }

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    console.log('project', this.project);
    this.customerId = this.tokenService.get()?.userId;
  }
}
