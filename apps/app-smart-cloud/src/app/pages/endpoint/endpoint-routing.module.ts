import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import { EndpointListComponent } from "./list/endpoint-list.component";
import { EndpointCreateComponent } from "./create/endpoint-create.component";

const routes: Routes = [
  {
    path: '',
    component: EndpointListComponent,
  },
  {
    path: 'create',
    component: EndpointCreateComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EndpointRoutingModule {}
