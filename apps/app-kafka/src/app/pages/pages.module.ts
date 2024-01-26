import { NgModule } from "@angular/core";
import { DetailComponent } from "./detail/detail.component";
import { PagesRoutingModule } from "./pages-routing.module";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [
    DetailComponent,
  ],
  imports: [
    PagesRoutingModule,
    SharedModule
  ],
})
export class PagesModule {}
