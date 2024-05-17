import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BaseResponse } from '../../../../../../../../libs/common-utils/src';
import { Port } from '../../../../shared/models/vlan.model';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { VlanService } from '../../../../shared/services/vlan.service';
import { debounceTime, Subscription } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-detail-port',
  templateUrl: './detail-port.component.html',
  styleUrls: ['./detail-port.component.less']
})
export class DetailPortComponent implements OnInit, OnDestroy, OnChanges {
  @Input() region: number;
  @Input() project: number;
  @Input() idNetwork: number;

  valuePort: string;
  networkName: string;

  isLoading: boolean = false;

  responsePort: BaseResponse<Port[]>;

  pageSize: number = 10;
  pageNumber: number = 1;

  networkCloudId: string;

  private subscription: Subscription;

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private vlanService: VlanService,
              private notification: NzNotificationService) {
    this.subscription = this.vlanService.reloadObservable.subscribe(reload => {
      if (reload) {
        setTimeout(() => {
          this.getVlanByNetworkId();
          this.getPortByNetwork(this.networkCloudId);
        }, 500);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('here');
    if (changes.checkDelete && changes.checkDelete.currentValue !== changes.checkDelete.previousValue) {
      setTimeout(() => {
        this.getPortByNetwork(this.networkCloudId);
        this.getVlanByNetworkId();
      }, 2000);
    }
  }

  onPageSizeChangePort(value) {
    this.pageSize = value;
    this.getPortByNetwork(this.networkCloudId);
  }

  onPageIndexChangePort(value) {
    this.pageNumber = value;
    this.getPortByNetwork(this.networkCloudId);
  }

  onInputChangePort(value) {
    this.valuePort = value;
  }

  getPortByNetwork(networkCloudId) {
    this.isLoading = true;
    this.vlanService.getPortByNetwork(networkCloudId, this.region, this.pageSize, this.pageNumber, this.valuePort)
      .pipe(debounceTime(500))
      .subscribe(data => {
        console.log('port', data);
        this.responsePort = data;
        this.isLoading = false;
      }, error => {
        this.responsePort = null;
        this.isLoading = false;
        this.notification.error(error.statusText, 'Lấy dữ liệu thất bại')
      });
  }

  handleOkAttach() {
    setTimeout(() => {
      this.getVlanByNetworkId();
    }, 1000);
  }

  handleOkDetach() {
    setTimeout(() => {
      this.getVlanByNetworkId();
    }, 1000);

  }

  handleOkDeletePort() {
    setTimeout(() => {
      this.getVlanByNetworkId();
    }, 1500);

  }

  handleOkCreatePort() {
    setTimeout(() => {
      this.getVlanByNetworkId();
    }, 1000);
  }

  getVlanByNetworkId() {
    this.vlanService.getVlanByNetworkId(this.idNetwork)
      .pipe(debounceTime(1500))
      .subscribe(data => {
        this.networkName = data.name;
        this.networkCloudId = data.cloudId;
        this.getPortByNetwork(data.cloudId);
      });
  }

  ngOnInit() {
    setTimeout(() => {
      this.getPortByNetwork(this.networkCloudId);
      this.getVlanByNetworkId();
    }, 2000);
  }
}
