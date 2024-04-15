import { Component, Inject, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ActivatedRoute, Router } from '@angular/router';
import { NonNullableFormBuilder } from '@angular/forms';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { RegionModel } from '../../../../../shared/models/region.model';
import { ProjectModel } from '../../../../../shared/models/project.model';

@Component({
  selector: 'one-portal-detail-l7-policy',
  templateUrl: './detail-l7-policy.component.html',
  styleUrls: ['./detail-l7-policy.component.less'],
})
export class DetailL7PolicyComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idListener: string
  idLoadBalancer: number


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

  ngOnInit() {
    this.idLoadBalancer = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('idLoadBalancer'));
    this.idListener = this.activatedRoute.snapshot.paramMap.get('idListener');

    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
  }

}
