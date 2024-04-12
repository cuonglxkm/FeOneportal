import { Component, Inject, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';
import { RegionModel } from '../../../../shared/models/region.model';
import { ProjectModel } from '../../../../shared/models/project.model';
import { FormExtendLoadBalancer, LoadBalancerModel } from '../../../../shared/models/load-balancer.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'one-portal-extend-load-balancer-normal',
  templateUrl: './extend-load-balancer-normal.component.html',
  styleUrls: ['./extend-load-balancer-normal.component.less'],
})
export class ExtendLoadBalancerNormalComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  loadBalancerId: number;
  loadBalancer: LoadBalancerModel = new LoadBalancerModel();

  validateForm: FormGroup<{
    time: FormControl<number>
  }> = this.fb.group({
    time: [1, [Validators.required, Validators.pattern(/^[0-9]*$/)]]
  });

  formExtendLoadBalancer: FormExtendLoadBalancer = new FormExtendLoadBalancer();
  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private loadBalancerService: LoadBalancerService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private fb: NonNullableFormBuilder) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/load-balancer/list']);
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel) {
    this.router.navigate(['/app-smart-cloud/load-balancer/list']);
  }

  onTimeChange(value) {

  }


  loadBalancerInit() {
    this.formExtendLoadBalancer.regionId = this.region
    this.formExtendLoadBalancer.serviceName = this.loadBalancer.name
    this.formExtendLoadBalancer.customerId = this.loadBalancer.customerId
    this.formExtendLoadBalancer.projectId = this.project
    this.formExtendLoadBalancer.vpcId = this.project
    this.formExtendLoadBalancer.typeName = "SharedKernel.IntegrationEvents.Orders.Specifications.LoadBalancerExtendSpecification,SharedKernel.IntegrationEvents, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null"
    this.formExtendLoadBalancer.serviceType = 15
    this.formExtendLoadBalancer.actionType = 3
    this.formExtendLoadBalancer.serviceInstanceId = 0
    this.formExtendLoadBalancer.actorEmail = this.tokenService.get()?.email
    this.formExtendLoadBalancer.userEmail = this.tokenService.get()?.email
  }

  getTotalAmount() {

  }


  getLoadBalancer() {
    this.loadBalancerService.getLoadBalancerById(this.loadBalancerId, true).subscribe(data => {
      this.loadBalancer = data
    })
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.loadBalancerId = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getLoadBalancer();
  }
}
