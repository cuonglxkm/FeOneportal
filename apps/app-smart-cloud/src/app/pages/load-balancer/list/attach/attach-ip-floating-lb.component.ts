import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { IpFloatingService } from '../../../../shared/services/ip-floating.service';
import { FormSearchIpFloating, IpFloating } from '../../../../shared/models/ip-floating.model';
import { debounceTime } from 'rxjs';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { finalize } from 'rxjs/operators';
import { LoadBalancerService } from '../../../../shared/services/load-balancer.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { isCheckDisabled } from 'ng-zorro-antd/core/tree';
import { IPBySubnet, LoadBalancerModel } from '../../../../shared/models/load-balancer.model';
import { Router } from '@angular/router';

@Component({
  selector: 'one-portal-attach-ip-floating-lb',
  templateUrl: './attach-ip-floating-lb.component.html',
  styleUrls: ['./attach-ip-floating-lb.component.less']
})
export class AttachIpFloatingLbComponent implements OnInit {
  @Input() region: number;
  @Input() project: number;
  // @Input() idLb: number
  // @Input() vipPortIp: string
  @Input() IsFloatingIP: boolean;
  // @Input() ipFloatingAddress: string
  @Input() data: LoadBalancerModel;
  @Output() onOk = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  isVisible: boolean = false;
  isLoading: boolean = false;
  disableAttach = true;
  ipId: number;
  subnetName = 'okok';
  response: IPBySubnet[];
  subnetId: string;

  constructor(private ipService: IpFloatingService,
              private loadBalancerService: LoadBalancerService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private router: Router,
              private notification: NzNotificationService) {
  }

  ngOnInit() {
    this.subnetName = this.data.subnetName + '(' + this.data.ipAddress + ')';
    this.subnetId = this.data.subnetId
    this.isLoadingIpFloating();
  }

  showModal() {
    this.isVisible = true;
  }

  handleCancel() {
    this.isVisible = false;
    this.isLoading = false;
    this.onCancel.emit();
  }

  handleOk() {
    this.isLoading = true;
    this.loadBalancerService.attachOrDetachIpFloating(this.ipId, this.data.id, this.region, this.project, this.data.vipPortId).pipe(finalize(() => {
      this.isLoading = false;
      this.isVisible = false;
      this.onCancel.emit();
    }))
      .pipe(finalize(()=> {this.onOk.emit();}))
      .subscribe(
      data => {
        this.notification.success(this.i18n.fanyi('app.status.success'), 'detach success');
      }, error => {
        this.notification.error(this.i18n.fanyi('app.status.fail'), 'detach fail');
      }
    );
  }


  private isLoadingIpFloating() {
    // this.isLoading = true;
    // let formSearchIpFloating: FormSearchIpFloating = new FormSearchIpFloating();
    // formSearchIpFloating.projectId = this.project;
    // formSearchIpFloating.regionId = this.region;
    // formSearchIpFloating.ipAddress = '';
    // formSearchIpFloating.pageSize = 99999;
    // formSearchIpFloating.currentPage = 1;
    // formSearchIpFloating.customerId = this.tokenService.get()?.userId;
    // this.ipService.getListIpFloating(formSearchIpFloating)
    //   .pipe(debounceTime(500))
    //   .subscribe(data => {
    //     this.isLoading = false;
    //     console.log('data', data);
    //     this.response = data.records;
    //   }, error => {
    //     this.isLoading = false;
    //     this.response = null;
    //   });

    this.loadBalancerService.getIPBySubnet(this.subnetId, this.project, this.region)
      .pipe(debounceTime(500))
      .subscribe(data => {
        this.isLoading = false;
        this.response = data;
      }, error => {
        this.isLoading = false;
        this.response = null;
      });
  }

  checkdisabled() {
    if (this.ipId == undefined || this.ipId == null) {
      this.disableAttach = true;
    } else {
      this.disableAttach = false;
    }
  }
}

