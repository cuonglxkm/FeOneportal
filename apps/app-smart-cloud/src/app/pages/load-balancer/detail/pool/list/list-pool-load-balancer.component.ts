import { Component, Input, OnInit } from '@angular/core';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';

@Component({
  selector: 'one-portal-list-pool-load-balancer',
  templateUrl: './list-pool-load-balancer.component.html',
  styleUrls: ['./list-pool-load-balancer.component.less'],
})
export class ListPoolLoadBalancerComponent implements OnInit{
  @Input() idLB: number
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false

  constructor(private loadBalancerService: LoadBalancerService) {
  }

  ngOnInit() {
  }
}
