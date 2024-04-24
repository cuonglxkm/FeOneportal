import { NgModule } from '@angular/core';
import { G2BarModule } from '@delon/chart/bar';
import { G2CustomModule } from '@delon/chart/custom';
import { G2MiniAreaModule } from '@delon/chart/mini-area';
import { G2MiniBarModule } from '@delon/chart/mini-bar';
import { G2TimelineModule } from '@delon/chart/timeline';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from '../shared/shared.module';
import { AccessLogComponent } from './detail/access-log/access-log.component';
import { CreateCredentialComponent } from './detail/credentials/credential-action/credential-action.component';
import { CredentialsComponent } from './detail/credentials/credentials.component';
import { DashboardComponent } from './detail/dashboard/dashboard.component';
import { DetailComponent } from './detail/detail.component';
import { AclConsumerGroupComponent } from './detail/mngt-acl/acl-consumer-group/acl-consumer-group.component';
import { AclTopicComponent } from './detail/mngt-acl/acl-topic/acl-topic.component';
import { MngtAclComponent } from './detail/mngt-acl/mngt-acl.component';
import { SummaryServiceComponent } from './detail/summary-service/summary-service.component';
import { PagesRoutingModule } from './pages-routing.module';

import {
  NguCarousel,
  NguCarouselDefDirective,
  NguCarouselNextDirective,
  NguCarouselPrevDirective,
  NguItemComponent,
  NguTileComponent,
} from '@ngu/carousel';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Status2ColorPipe } from '../pipes/status2color.pipe';
import { TruncateLabelPipe } from '../pipes/truncate-label.pipe';
import { CreateKafkaComponent } from './create-kafka/create-kafka.component';
import { ConsumerGroupComponent } from './detail/consumer-group/consumer-group.component';
import { MonitoringFilterComponent } from './detail/monitoring-service/monitoring-filter/monitoring-filter.component';
import { MonitoringServiceComponent } from './detail/monitoring-service/monitoring-service.component';
import { CreateTopicComponent } from './detail/topic-mngt/create-topic/create-topic.component';
import { LoadTopicComponent } from './detail/topic-mngt/load-topic/load-topic.component';
import { MessageTopicComponent } from './detail/topic-mngt/message-topic/message-topic.component';
import { TopicMngtComponent } from './detail/topic-mngt/topic-mngt.component';
import { ListKafkaComponent } from './list-kafka/list-kafka.component';
import { NzImageModule } from 'ng-zorro-antd/image';
import { CustomCurrencyPipe } from '../pipes/custom-currency.pipe';
import { EditKafkaComponent } from './edit-kafka/edit-kafka.component';
import { UpgradeKafkaComponent } from './upgrade-kafka/upgrade-kafka.component';
import { ExtendKafkaComponent } from './extend-kafka/extend-kafka.component';
@NgModule({
  declarations: [
    DetailComponent,
    DashboardComponent,
    SummaryServiceComponent,
    CredentialsComponent,
    MngtAclComponent,
    AclTopicComponent,
    AclConsumerGroupComponent,
    CreateCredentialComponent,
    TopicMngtComponent,
    CreateTopicComponent,
    MessageTopicComponent,
    AccessLogComponent,
    ConsumerGroupComponent,
    MonitoringServiceComponent,
    MonitoringFilterComponent,
    TruncateLabelPipe,
    LoadTopicComponent,
    ListKafkaComponent,
    Status2ColorPipe,
    CreateKafkaComponent,
    CustomCurrencyPipe,
    EditKafkaComponent,
    UpgradeKafkaComponent,
    ExtendKafkaComponent,
  ],
  imports: [
    PagesRoutingModule,
    SharedModule,
    G2MiniBarModule,
    G2CustomModule,
    G2BarModule,
    G2TimelineModule,
    G2MiniAreaModule,
    NgApexchartsModule,
    NzIconModule,
    NzDescriptionsModule,
    NzSelectModule,
    NzNotificationModule,
    NgJsonEditorModule,
    NzCardModule,
    NzCarouselModule,
    NguCarousel,
    NguCarouselDefDirective,
    NguCarouselNextDirective,
    NguCarouselPrevDirective,
    NguItemComponent,
    NguTileComponent,
    NzImageModule,
  ],
})
export class PagesModule {}
