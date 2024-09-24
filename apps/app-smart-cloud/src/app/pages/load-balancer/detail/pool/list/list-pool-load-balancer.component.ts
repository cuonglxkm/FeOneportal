import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { Pool } from '../../../../../shared/models/load-balancer.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'one-portal-list-pool-load-balancer',
  templateUrl: './list-pool-load-balancer.component.html',
  styleUrls: ['./list-pool-load-balancer.component.less'],
})
export class ListPoolLoadBalancerComponent implements OnInit, OnChanges {
  @Input() idLB: number;
  @Input() checkCreate: boolean;

  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  isLoading: boolean = false;
  poolList: Pool[] = [];

  pageSize: number = 5;
  pageIndex: number = 1;

  currentPageData: any;

  constructor(
    private loadBalancerService: LoadBalancerService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    console.log('goi lai list pool');
    if (changes.checkCreate) {
      this.getListPool();
    }
  }

  onPageSizeChange(value) {
    this.pageSize = value;
    this.getListPool();
  }

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListPool();
  }

  getListPool() {
    this.isLoading = true;
    this.loadBalancerService.getListPoolInLB(this.idLB).subscribe({
      next: (data) => {
        const startIndex = (this.pageIndex - 1) * this.pageSize;
        const endIndex = this.pageIndex * this.pageSize;
        this.poolList = data;
        console.log(" this.poolList 123", this.poolList)
        this.currentPageData = this.poolList.slice(startIndex, endIndex);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.poolList = null;
      },
    });
  }

  detailPool(id: string) {
    this.router.navigate([
      '/app-smart-cloud/load-balancer/pool-detail/' + id,
      { idLB: this.idLB },
    ]);
  }

  handleEditOk() {
    this.getListPool();
  }

  handleDeleteOk() {
    setTimeout(() => {
      this.getListPool();
    }, 1500);
  }
  ngOnInit() {
    this.getListPool();
  }
}
