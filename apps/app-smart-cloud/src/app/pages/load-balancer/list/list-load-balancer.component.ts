import { Component, Inject, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Router } from '@angular/router';
import { BaseResponse, ProjectModel, RegionModel } from '../../../../../../../libs/common-utils/src';
import { FormSearchListBalancer, LoadBalancerModel } from '../../../shared/models/load-balancer.model';
import { LoadBalancerService } from '../../../shared/services/load-balancer.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { debounceTime, Subject } from 'rxjs';
import { TimeCommon } from '../../../shared/utils/common';

@Component({
  selector: 'one-portal-list-load-balancer',
  templateUrl: './list-load-balancer.component.html',
  styleUrls: ['./list-load-balancer.component.less'],
})
export class ListLoadBalancerComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
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
              private loadBalancerService: LoadBalancerService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    this.loadBalancerStatus = new Map<String, string>();
    this.loadBalancerStatus.set('KHOITAO', this.i18n.fanyi('app.status.running'));
    this.loadBalancerStatus.set('HUY', this.i18n.fanyi('app.status.low-renew'));
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.search(true)
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
    this.typeVPC = project?.type;
    this.search(true)
  }

  // onInputChange(value) {
  //   this.value = value
  //   this.search(false)
  // }

  onPageSizeChange(value) {
    this.pageSize = value
    this.search(false)
  }

  onPageIndexChange(value) {
    this.pageIndex = value
    this.search(false)
  }

  navigateToCreate(typeVpc) {
    console.log(typeVpc)
    let hasRoleSI = localStorage.getItem('role').includes('SI')
    if(typeVpc === 1 || hasRoleSI) {
      this.router.navigate(['/app-smart-cloud/load-balancer/create/vpc'])
    }
    if(typeVpc !== 1) {
      this.router.navigate(['/app-smart-cloud/load-balancer/create'])
    }
  }

  handleUpdateNoVpcOk() {
    this.search(false)
  }

  navigateToUpdateVpc(id) {
    this.router.navigate(['/app-smart-cloud/load-balancer/update/vpc/'+id])
  }

  navigateToExtend(id) {
    this.router.navigate(['/app-smart-cloud/load-balancer/extend/normal/'+id])
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

  handleDeleteOk() {
    this.search(true)
  }

  navigateToCreateListener(idLb: number) {
    this.router.navigate(['/app-smart-cloud/load-balancer/' + idLb + '/listener/create'])
  }

  searchDelay = new Subject<boolean>();
  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;
    if(!this.region || !this.project) {
      this.isLoading = true
    }
    console.log('project', this.project);
    this.customerId = this.tokenService.get()?.userId;

    this.searchDelay.pipe(debounceTime(TimeCommon.timeOutSearch)).subscribe(() => {
      this.search(false);
    });
  }
}
