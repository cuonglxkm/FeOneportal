import { IconDefinition } from '@ant-design/icons-angular';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RemoteEntryComponent } from './entry.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { remoteRoutes } from './entry.routes';
import { MngtDatabaseComponent } from '../pages/detail/mngt-database/mngt-database.component';
import { OverviewComponent } from '../pages/detail/overview/overview.component';
import { PagesComponent } from '../pages/detail/pages.component';
import { UserRoleComponent } from '../pages/detail/user-role/user-role.component';
import { UserComponent } from '../pages/detail/user-role/user/user.component';
import { RoleComponent } from '../pages/detail/user-role/role/role.component';
import { SHARED_ZORRO_MODULES } from '../shared/shared-zorro.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CustomRoleComponent } from '../pages/detail/user-role/role/custom-role/custom-role.component';
import { LoggingComponent } from '../pages/detail/logging/logging.component';
import { UpdateRoleComponent } from '../pages/detail/user-role/role/update-role/update-role.component';
import { ListMongodbrepComponent } from '../pages/list-service/list-mongodbrep.component';
import { UserFormComponent } from '../pages/detail/user-role/user/user-form/user-form.component';
import { BackupComponent } from '../pages/detail/backup/backup.component';
import { BackupHistoryComponent } from '../pages/detail/backup/backup-history/backup-history.component';
import { Status2ColorBackupPipe } from '../pipes/status2color-backup-state.pipe';
import { BackupListComponent } from '../pages/detail/backup/backup-list/backup-list.component';
import { BackupListHeaderComponent } from '../pages/detail/backup/backup-list/backup-list-header/backup-list-header.component';
import { BackupPlanComponent } from '../pages/detail/backup/backup-plan/backup-plan.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { BottombarComponent } from '../shared/components/bottombar/bottombar.component';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { UserRoles } from '../pipes/UserRoles.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { PageHeaderModule } from '@delon/abc/page-header';
import { Status2ColorPipe } from '../pipes/status2color.pipe';
import { NzIconModule } from 'ng-zorro-antd/icon';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { CreateClusterComponent } from '../pages/detail/create-cluster/create-cluster.component';
import { LoadingModule } from '@delon/abc/loading';
import { NguCarousel, NguCarouselDefDirective, NguCarouselNextDirective, NguCarouselPrevDirective, NguItemComponent, NguTileComponent } from '@ngu/carousel';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { CustomCurrencyPipe } from '../pipes/custom-currency.pipe';
import { SharedModule } from '../shared/shared.module';
import { UpgradeClusterComponent } from '../pages/detail/upgrade-cluster/upgrade-cluster.component';
import { EditMongodbrepComponent } from '../pages/list-service/edit-mongodbrep/edit-mongodbrep.component';
const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key])
@NgModule({
  declarations: [
    NxWelcomeComponent,
    RemoteEntryComponent,
    MngtDatabaseComponent,
    OverviewComponent,
    PagesComponent,
    UserRoleComponent,
    UserComponent,
    RoleComponent,
    CustomRoleComponent,
    LoggingComponent,
    UpdateRoleComponent,
    ListMongodbrepComponent,
    UserFormComponent,
    BackupComponent,
    BackupHistoryComponent,
    Status2ColorBackupPipe,
    BackupListComponent,
    BackupListHeaderComponent,
    BackupPlanComponent,
    BottombarComponent,
    UserRoles,
    Status2ColorPipe,
    CreateClusterComponent,
    UpgradeClusterComponent,
    EditMongodbrepComponent,
    CustomCurrencyPipe
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(remoteRoutes),
    NgApexchartsModule,
    NzDrawerModule,
    NzDescriptionsModule,
    ReactiveFormsModule,
    NzPageHeaderModule,
    PageHeaderModule,
    NzIconModule.forChild(icons),
    NguCarousel,
    NguCarouselDefDirective,
    NguCarouselNextDirective,
    NguCarouselPrevDirective,
    NguItemComponent,
    NguTileComponent,
    LoadingModule,
    NzNotificationModule,
    SharedModule
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RemoteEntryModule {}
