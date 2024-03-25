import { Component, Input, OnInit } from '@angular/core';
import { KafkaService } from '../../../services/kafka.service';
import { filter, map } from 'rxjs/operators';
import { ClipboardService } from 'ngx-clipboard';
import { InfoConnection } from '../../../core/models/info-connection.model';
import { BrokerConfig } from '../../../core/models/broker-config.model';
import { AppConstants } from '../../../core/constants/app-constant';
import {NzNotificationService} from "ng-zorro-antd/notification";
import { camelizeKeys } from 'humps';
import { KafkaDetail } from 'src/app/core/models/kafka-infor.model';

@Component({
  selector: 'one-portal-summary-service',
  templateUrl: './summary-service.component.html',
  styleUrls: ['./summary-service.component.css'],
})
export class SummaryServiceComponent implements OnInit {
  @Input() serviceOrderCode: string;
  @Input() itemDetail: KafkaDetail;

  infoConnection: InfoConnection;
  brokerConfigs: BrokerConfig[];

  constructor(
    private kafkaService: KafkaService,
    private clipboardService: ClipboardService,
    private notification: NzNotificationService
  ) {}

  handleCopy() {
    const bs =
      AppConstants.BOOSTRAP_SERVER +
      AppConstants.EQUAL_SIGN +
      this.infoConnection.bootstrapServer;
    const sm =
      AppConstants.SASL_MECHANISM +
      AppConstants.EQUAL_SIGN +
      this.infoConnection.saslMechanism;
    const sp =
      AppConstants.SECURITY_PROTOCOL +
      AppConstants.EQUAL_SIGN +
      this.infoConnection.securityProtocol;
    const sjc =
      AppConstants.SASL_JAAS_CONFIG +
      AppConstants.EQUAL_SIGN +
      this.infoConnection.saslJaasConfig;

    const res = bs + '\n' + sm + '\n' + sp + '\n' + sjc;
    this.clipboardService.copy(res);

    this.notification.success('Thông báo', 'Đã copy', {
      nzDuration: 2000
    });
  }

  ngOnInit(): void {
    this.getInfoConnection();
    this.getBrokerConfigOfService();
  }

  getInfoConnection() {
    this.kafkaService
      .getInfoConnection(this.serviceOrderCode)
      .pipe(
        filter((r) => r && r.code == 200),
        map((r) => r.data)
      )
      .subscribe((data) => {
        this.infoConnection = camelizeKeys(data) as InfoConnection;
      });
  }

  getBrokerConfigOfService() {
    this.kafkaService
      .getBrokerConfigOfService(this.serviceOrderCode)
      .pipe(
        filter((r) => r && r.code == 200),
        map((r) => r.data)
      )
      .subscribe((data) => {
        this.brokerConfigs = camelizeKeys(data) as BrokerConfig[];
      });
  }
}
