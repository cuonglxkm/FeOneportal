import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getCurrentRegionAndProject } from '@shared';
import { LoadBalancerService } from '../../../shared/services/load-balancer.service';
import { LoadBalancerModel } from '../../../shared/models/load-balancer.model';
import { RegionModel, ProjectModel } from '../../../../../../../libs/common-utils/src';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { CatalogService } from '../../../shared/services/catalog.service';
import { OfferDetail } from '../../../shared/models/catalog.model';

@Component({
  selector: 'one-portal-detail-load-balancer',
  templateUrl: './detail-load-balancer.component.html',
  styleUrls: ['./detail-load-balancer.component.less'],
})
export class DetailLoadBalancerComponent implements OnInit{
  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  idLoadBalancer: number
  loadBalancer: LoadBalancerModel = new LoadBalancerModel()
  dataOffer: OfferDetail;

  constructor(@Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private loadBalancerService: LoadBalancerService,
              private catalogService: CatalogService,
              private notification: NzNotificationService) {
  }

  regionChanged(region: RegionModel) {
    this.region = region.regionId;
    this.router.navigate(['/app-smart-cloud/load-balancer/list'])
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChanged(project: ProjectModel) {
    this.project = project?.id;
  }

  userChanged(project: ProjectModel){
    this.router.navigate(['/app-smart-cloud/load-balancer/list'])
  }

  getLoadBalancerById() {
    this.loadBalancerService.getLoadBalancerById(this.idLoadBalancer, true).subscribe(data => {
      this.loadBalancer = data;
      this.catalogService.getDetailOffer(data.offerId).subscribe(
        dataOfer => {
          this.dataOffer = dataOfer
        }
      )
    }, error => {
      if(error.status == '404') {
        this.notification.error(
          '',
          this.i18n.fanyi('app.notification.load.balancer.not.exist')
        );
        this.router.navigate(['/app-smart-cloud/load-balancer/list'])
      }
      this.notification.error('', error.error.detail)
      this.router.navigate(['/app-smart-cloud/load-balancer/list'])
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

  loadToCreateListener() {
    this.router.navigate(['/app-smart-cloud/load-balancer/' + this.idLoadBalancer + '/listener/create'])
  }
}
