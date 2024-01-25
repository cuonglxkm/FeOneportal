import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
// import { SHARED_ZORRO_MODULES } from "../shared/shared-zorro.module";
import { DetailComponent } from "./detail/detail.component";
import { NzBreadCrumbModule } from "ng-zorro-antd/breadcrumb";
import { NzPageHeaderModule } from "ng-zorro-antd/page-header";
import { CommonModule } from "@angular/common";
import { PagesRoutingModule } from "./pages-routing.module";
import { PageHeaderModule } from '@delon/abc/page-header';
import { NzTabsModule } from "ng-zorro-antd/tabs";

@NgModule({
  declarations: [
    DetailComponent,
  ],
  imports: [
    PagesRoutingModule,
    NzBreadCrumbModule,
    NzPageHeaderModule,
    PageHeaderModule,
    NzTabsModule,
    CommonModule
  ],
})
export class PagesModule {}
