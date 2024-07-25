import {RouterModule, Routes} from "@angular/router";
import {NgModule, inject} from "@angular/core";
import { WAFCreateComponent } from "./create/waf-create.component";

const routes: Routes = [
  {
    path: 'create',
    component: WAFCreateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WAFRoutingModule {}
