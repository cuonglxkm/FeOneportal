import { NgModule } from '@angular/core';
import { G2BarModule } from '@delon/chart/bar';
import { G2CustomModule } from '@delon/chart/custom';
import { G2MiniAreaModule } from '@delon/chart/mini-area';
import { G2MiniBarModule } from '@delon/chart/mini-bar';
import { G2TimelineModule } from '@delon/chart/timeline';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from '../shared/shared.module';
import { CredentialsComponent } from './detail/credentials/credentials.component';
import { DashboardComponent } from './detail/dashboard/dashboard.component';
import { DetailComponent } from './detail/detail.component';
import { SummaryServiceComponent } from './detail/summary-service/summary-service.component';
import { PagesRoutingModule } from './pages-routing.module';

import { CreateCredentialComponent } from './detail/credentials/credential-action/credential-action.component';
import { AclConsumerGroupComponent } from './detail/mngt-acl/acl-consumer-group/acl-consumer-group.component';
import { AclTopicComponent } from './detail/mngt-acl/acl-topic/acl-topic.component';
import { MngtAclComponent } from './detail/mngt-acl/mngt-acl.component';
import { AccessLogComponent } from './detail/access-log/access-log.component';

import { TopicMngtComponent } from './detail/topic-mngt/topic-mngt.component';
import { CreateTopicComponent } from './detail/topic-mngt/create-topic/create-topic.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { MessageTopicComponent } from './detail/topic-mngt/message-topic/message-topic.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
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
    NzNotificationModule
  ],
})
export class PagesModule {}
