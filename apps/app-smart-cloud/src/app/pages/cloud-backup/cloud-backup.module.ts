import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import {
  NguCarousel,
  NguCarouselDefDirective,
  NguTileComponent,
} from '@ngu/carousel';
import { TrimDirective } from '../file-storage/TrimDirective';
import { CommonModule } from '@angular/common';
import { CloudBackupInfoComponent } from './info/cloud-backup-info.component';
import { CloudBackupCreateComponent } from './create/cloud-backup-create.component';
import { CloudBackupRoutingModule } from './cloud-backup-routing.module';
import { CloudBackupComponent } from './cloud-backup.component';
import { AccessRuleListComponent } from './access-rule/access-rule-list.component';
import { CreateAccessRulePopupComponent } from './access-rule/create/create-access-rule.component';
import { EditAccessRuleComponent } from './access-rule/edit/edit-access-rule.component';
import { DeleteAccessRuleComponent } from './access-rule/delete/delete-access-rule.component';
import { DeleteCloudBackupComponent } from './info/delete/delete-cloud-backup.component';
import { CloudBackupExtendComponent } from './extend/cloud-backup-extend.component';
import { CloudBackupResizeComponent } from './resize/cloud-backup-resize.component';
import { CloudBackupCreateVpcComponent } from './create-vpc/cloud-backup-create-vpc.component';

@NgModule({
  declarations: [
    CloudBackupInfoComponent,
    CloudBackupCreateComponent,
    CloudBackupCreateVpcComponent,
    CloudBackupComponent,
    AccessRuleListComponent,
    CreateAccessRulePopupComponent,
    EditAccessRuleComponent,
    DeleteAccessRuleComponent,
    DeleteCloudBackupComponent,
    CloudBackupExtendComponent,
    CloudBackupResizeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NguCarousel,
    NguCarouselDefDirective,
    NguTileComponent,
    CloudBackupRoutingModule,
    TrimDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CloudBackupModule {}
