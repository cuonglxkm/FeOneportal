import {RouterModule, Routes} from "@angular/router";
import {NgModule, inject} from "@angular/core";
import { WAFCreateComponent } from "./create/waf-create.component";
import { AddDomainComponent } from "./add-domain/add-domain.component";
import { ListSslCertComponent } from "./ssl-cert/list-ssl-cert/list-ssl-cert.component";

const routes: Routes = [
  {
    path: 'create',
    component: WAFCreateComponent,
  },
  {
    path:'add-domain',
    component: AddDomainComponent
  },
  {
    path:'ssl-cert',
    component: ListSslCertComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WAFRoutingModule {}
