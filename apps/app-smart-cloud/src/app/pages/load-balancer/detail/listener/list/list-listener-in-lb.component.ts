import { Component, Inject, Input, OnInit } from '@angular/core';
import { getCurrentRegionAndProject } from '@shared';
import { LoadBalancerService } from '../../../../../shared/services/load-balancer.service';
import { m_LBSDNListener } from '../../../../../shared/models/load-balancer.model';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { ListenerService } from '../../../../../shared/services/listener.service';
import { da } from 'date-fns/locale';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

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
  isVisibleDelete = false;
  pageSize: number = 5
  loading = false;
  pageIndex: number = 1
  disableDelete= true;
  constructor(private loadBalancerService: LoadBalancerService,
              private listenerService: ListenerService,
              public notification: NzNotificationService,
              private router: Router,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    this.listenerStatus = new Map<String, string>();
    this.listenerStatus.set('KHOITAO', this.i18n.fanyi('app.status.running'));
    this.listenerStatus.set('ERROR', this.i18n.fanyi('app.status.suspend'));
  }

  currentPageData: any
  modalStyle = {
    'padding': '20px',
    'border-radius': '10px',
    'width': '600px'
  };
  itemDelete: any;
  nameDelete = '';

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

  confirmNameDelete(event: any) {
    this.nameDelete = '';
    if (event == this.itemDelete.name) {
      this.disableDelete = false;
    } else {
      this.disableDelete = true;
    }
  }

  openDelete() {
    this.loading = true;
    this.listenerService.deleteListner(this.itemDelete.listenerId,this.idLB)
      .pipe(finalize(() => {
        this.loading = false;
        this.isVisibleDelete = false;
        this.router.navigate(['/app-smart-cloud/load-balancer/detail/' + this.idLB]);
      }))
      .subscribe(
      data => {
        this.notification.success(this.i18n.fanyi('app.status.success'), this.i18n.fanyi('app.notification.delete.listener.success'))
      },
      error => {
        this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi('app.notification.delete.listener.fail'))
      }
    )
  }

  activeModalDelete(data: any) {
    this.itemDelete = data;
    this.isVisibleDelete = true
  }
}
