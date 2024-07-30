import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-ssl-cert-detail',
  templateUrl: './ssl-cert-detail.component.html',
  styleUrls: ['./ssl-cert-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SslCertDetailComponent implements OnInit {

  isLoading: boolean = false
  pageSize: number = 10;
  pageIndex: number = 1;
  response: BaseResponse<any>

  constructor(){}

  onPageIndexChange(value) {
    this.pageIndex = value;
    this.getListDomains();
  }

  ngOnInit(){
    this.getListDomains()
  }

  getListDomains(){
    this.response = {
      currentPage: 1,
      pageSize: 10,
      totalCount: 100,
      previousPage: 0,
      records: [
        {
          id: 1,
          name: 'smartcloud.vn',
          status: 'Deploying successfully',
          usage: 'Internationally HTTPS Transmission (Default)',
        },
        {
          id: 2,
          name: 'smartcloud.vn',
          status: 'Deploying successfully',
          usage: 'Internationally HTTPS Transmission (Default)',
        }
      ]
    }
  }
}
