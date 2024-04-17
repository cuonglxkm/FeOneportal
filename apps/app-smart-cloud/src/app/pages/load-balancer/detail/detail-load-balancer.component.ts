import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RegionModel } from '../../../shared/models/region.model';
import { ProjectModel } from '../../../shared/models/project.model';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { LoadBalancerService } from '../../../shared/services/load-balancer.service';
import { LoadBalancerModel } from '../../../shared/models/load-balancer.model';

@Component({
  selector: 'one-portal-detail-load-balancer',
  templateUrl: './detail-load-balancer.component.html',
  styleUrls: ['./detail-load-balancer.component.less'],
})
export class DetailLoadBalancerComponent implements OnInit{  
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  idLoadBalancer: number
  loadBalancer: LoadBalancerModel = new LoadBalancerModel()

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private loadBalancerService: LoadBalancerService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/load-balancer/list'])
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel){
    this.router.navigate(['/app-smart-cloud/load-balancer/list'])
  }

  getLoadBalancerById() {
    this.loadBalancerService.getLoadBalancerById(this.idLoadBalancer, true).subscribe(data => {
      this.loadBalancer = data
    })
  }

  checkCreate: boolean = false;
  handleCreatePoolOk() {
    this.checkCreate = !this.checkCreate
  }

  ngOnInit() {
    this.idLoadBalancer = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));

    let regionAndProject = getCurrentRegionAndProject()
    this.region = regionAndProject.regionId
    this.project = regionAndProject.projectId
    this.getLoadBalancerById()
  }
}
