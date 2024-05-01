import { Component, Input, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { m_LBSDNListener } from '../../../../../shared/models/load-balancer.model';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'one-portal-list-listener-in-lb',
  templateUrl: './list-listener-in-lb.component.html',
  styleUrls: ['./list-listener-in-lb.component.less'],
})
export class ListListenerInLbComponent implements OnInit{
  @Input() idLB: number

  region = JSON.parse(localStorage.getItem('regionId'));
  project = JSON.parse(localStorage.getItem('projectId'));

  listListeners: m_LBSDNListener[] = []

  isLoading: boolean = false
  listenerStatus: Map<String, string>;

  pageSize: number = 5
  pageIndex: number = 1
  constructor(private loadBalancerService: LoadBalancerService) {
    this.listenerStatus = new Map<String, string>();
    this.listenerStatus.set('KHOITAO', 'Đang hoạt động');
    this.listenerStatus.set('ERROR', 'Tạm dừng');
  }

  currentPageData: any

  onPageSizeChange(value) {
    this.pageSize = value
    this.getListListenerInLB()
  }

  onPageIndexChange(value) {
    this.pageIndex = value
    this.getListListenerInLB()
  }

  getListListenerInLB() {
    this.isLoading = true
    this.loadBalancerService.getListenerInLB(this.idLB).subscribe(data => {
      this.isLoading = false
      this.listListeners = data
      const startIndex = (this.pageIndex - 1) * this.pageSize;
      const endIndex = this.pageIndex * this.pageSize;

      this.currentPageData = this.listListeners.slice(startIndex, endIndex);

    }, error => {
      this.isLoading = false
      this.listListeners = null
    })
  }

  ngOnInit() {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.getListListenerInLB()
  }

}
