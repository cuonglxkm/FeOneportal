import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { Pool } from '../../../../../shared/models/load-balancer.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'one-portal-list-pool-load-balancer',
  templateUrl: './list-pool-load-balancer.component.html',
  styleUrls: ['./list-pool-load-balancer.component.less'],
})
export class ListPoolLoadBalancerComponent implements OnInit, OnChanges {
  @Input() idLB: number;
  @Input() checkCreate: boolean;

  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;
  poolList: Pool[] = [];

  constructor(
    private loadBalancerService: LoadBalancerService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    console.log("goi lai list pool")
    if (changes.checkCreate) {
      this.getListPool();
    }
  }

  getListPool() {
    this.isLoading = true;
    this.loadBalancerService.getListPoolInLB(this.idLB).subscribe(
      (data) => {
        this.poolList = data;

        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.poolList = null;
      }
    );
  }

  detaiPool(id: string) {
    this.router.navigate([
      '/app-smart-cloud/load-balancer/pool-detail/' + id,
      { idLB: this.idLB },
    ]);
  }

  handleEditOk() {
    this.getListPool();
  }

  handleDeleteOk() {
    this.getListPool();
  }
  ngOnInit() {
    this.getListPool();
  }
}
