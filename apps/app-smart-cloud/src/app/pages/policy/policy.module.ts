import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core";
import {PolicyListComponent} from "./policy-list/policy-list.component";
import {PolicyRoutingModule} from "./policy-routing.module";

@NgModule({
  declarations: [
    PolicyListComponent,
  ],
  imports: [PolicyRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PolicyModule {}
