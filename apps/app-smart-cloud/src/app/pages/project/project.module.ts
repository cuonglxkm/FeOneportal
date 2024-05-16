import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { ProjectUpdateComponent } from './project-update/project-update.component';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectExtendComponent } from './project-extend/project-extend.component';
import {NguCarousel, NguCarouselDefDirective, NguTileComponent} from "@ngu/carousel";

@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectDetailComponent,
    ProjectDetailComponent,
    ProjectCreateComponent,
    ProjectUpdateComponent,
    ProjectExtendComponent,
  ],
    imports: [
        ProjectRoutingModule,
        SharedModule,
        NgJsonEditorModule,
        NgxJsonViewerModule,
        NguCarousel,
        NguCarouselDefDirective,
        NguTileComponent,
    ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProjectModule {}
