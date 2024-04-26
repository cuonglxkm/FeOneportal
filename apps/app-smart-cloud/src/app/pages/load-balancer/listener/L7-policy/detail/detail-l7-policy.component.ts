import { Component, Inject, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ActivatedRoute, Router } from '@angular/router';
import { NonNullableFormBuilder } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { L7Policy, L7Rule } from '../../../../../shared/models/load-balancer.model';
import { RegionModel, ProjectModel } from '../../../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-detail-l7-policy',
  templateUrl: './detail-l7-policy.component.html',
  styleUrls: ['./detail-l7-policy.component.less'],
})
export class DetailL7PolicyComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idListener: string;
  idLoadBalancer: number;
  idL7Policy: string;

  l7Policy: L7Policy = new L7Policy();

  isLoading: boolean = false

  l7RuleList: L7Rule[] = []
  isLoadingL7Rule: boolean = false

  pageSize: number = 5
  pageIndex: number = 1

  currentPageData: any


  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private fb: NonNullableFormBuilder,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private loadBalancerService: LoadBalancerService,
              private notification: NzNotificationService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    // this.router.navigate(['/app-smart-cloud/load-balancer/list'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel){
    this.project = project?.id;
    // this.router.navigate(['/app-smart-cloud/load-balancer/list'])
  }

  onPageSizeChange(value) {
    this.pageSize = value
    this.getL7RuleList()
  }

  onPageIndexChange(value) {
    this.pageIndex = value
    this.getL7RuleList()
  }

  getL7PolicyDetail() {
    this.isLoading = true
    this.loadBalancerService.getDetailL7Policy(this.idL7Policy, this.region, this.project).subscribe(data => {
      this.l7Policy = data
      this.isLoading = false
    })
  }

  getL7RuleList() {
    this.isLoadingL7Rule = true
    this.loadBalancerService.getListL7Rule(this.region, this.project, this.idL7Policy).subscribe(data => {
      this.isLoadingL7Rule = false
      this.l7RuleList = data
      const startIndex = (this.pageIndex - 1) * this.pageSize;
      const endIndex = this.pageIndex * this.pageSize;

      this.currentPageData = this.l7RuleList.slice(startIndex, endIndex);
    }, error => {
      this.isLoadingL7Rule = false
      this.l7RuleList = null
    })
  }

  handleCreateL7Rule() {
    this.getL7RuleList()
  }

  handleDeleteL7Rule() {
    setTimeout(() => {this.getL7RuleList()}, 2500)
    this.getL7RuleList()
  }
  ngOnInit() {
    this.idLoadBalancer = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('idLoadBalancer'));
    this.idListener = this.activatedRoute.snapshot.paramMap.get('idListener');
    this.idL7Policy = this.activatedRoute.snapshot.paramMap.get('idL7');

    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId

    this.getL7PolicyDetail()
    this.getL7RuleList()
  }

}
