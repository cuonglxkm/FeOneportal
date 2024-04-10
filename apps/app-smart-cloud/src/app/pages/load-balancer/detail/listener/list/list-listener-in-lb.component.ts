import { Component, Input, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { m_LBSDNListener } from '../../../../../shared/models/load-balancer.model';

@Component({
  selector: 'one-portal-list-listener-in-lb',
  templateUrl: './list-listener-in-lb.component.html',
  styleUrls: ['./list-listener-in-lb.component.less'],
})
export class ListListenerInLbComponent implements OnInit{
  @Input() idLB: number

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  listListeners: m_LBSDNListener[] = []

  isLoading: boolean = false

  constructor(private loadBalancerService: LoadBalancerService) {
  }

  getListListenerInLB() {
    this.isLoading = true
    this.loadBalancerService.getListenerInLB(this.idLB).subscribe(data => {
      this.isLoading = false
      this.listListeners = data
    })
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.getListListenerInLB()
  }

}
