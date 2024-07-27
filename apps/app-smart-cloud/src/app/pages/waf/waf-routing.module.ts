import {RouterModule, Routes} from "@angular/router";
import {NgModule, inject} from "@angular/core";
import { WAFCreateComponent } from "./create/waf-create.component";
import { WAFResizeComponent } from "./resize/waf-resize.component";

const routes: Routes = [
  {
    path: 'create',
    component: WAFCreateComponent,
  },
  {
    path: 'resize/:id',
    component: WAFResizeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WAFRoutingModule {}
