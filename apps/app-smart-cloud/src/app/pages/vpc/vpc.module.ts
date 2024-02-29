import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { VpcListComponent } from './vpc-list/vpc-list.component';
import { VpcDetailComponent } from './vpc-detail/vpc-detail.component';
import { VpcCreateComponent } from './vpc-create/vpc-create.component';
import { VpcUpdateComponent } from './vpc-update/vpc-update.component';
import { VpcRoutingModule } from './vpc-routing.module';
import { VpcExtendComponent } from './vpc-extend/vpc-extend.component';
import {NguCarousel, NguCarouselDefDirective, NguTileComponent} from "@ngu/carousel";

@NgModule({
  declarations: [
    VpcListComponent,
    VpcDetailComponent,
    VpcDetailComponent,
    VpcCreateComponent,
    VpcUpdateComponent,
    VpcExtendComponent,
  ],
    imports: [
        VpcRoutingModule,
        SharedModule,
        NgJsonEditorModule,
        NgxJsonViewerModule,
        NguCarousel,
        NguCarouselDefDirective,
        NguTileComponent,
    ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VpcModule {}
