import { Component, Input, OnInit } from '@angular/core';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { Pool } from '../../../../../shared/models/load-balancer.model';

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
  poolList: Pool[] = []

  constructor(private loadBalancerService: LoadBalancerService) {
  }

  getListPool() {
    this.isLoading = true
    this.loadBalancerService.getListPoolInLB(this.idLB).subscribe(data => {
      this.poolList = data

      this.isLoading = false
    }, error => {
      this.isLoading = false
      this.poolList = null
    })
  }

  handleEditOk() {
    this.getListPool()
  }

  handleDeleteOk() {
    this.getListPool()
  }
  ngOnInit() {
    this.getListPool()
  }
}
