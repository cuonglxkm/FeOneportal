import {RouterModule, Routes} from "@angular/router";
import {NgModule, inject} from "@angular/core";
import { WAFCreateComponent } from "./create/waf-create.component";
import { AddDomainComponent } from "./add-domain/add-domain.component";
import { ListSslCertComponent } from "./ssl-cert/list-ssl-cert/list-ssl-cert.component";
import { WAFResizeComponent } from "./resize/waf-resize.component";
import { WafComponent } from "./waf.component";
import { WAFExtendComponent } from "./extend/waf-extend.component";
import { CreateSslCertWAFComponent } from "./ssl-cert/create/create-ssl-cert.component";
import { WafDetailComponent } from "./waf-detail/waf-detail.component";
import { SslCertDetailComponent } from "./ssl-cert-detail/ssl-cert-detail.component";
import { EditSslCertWAFComponent } from "./ssl-cert/edit/edit-ssl-cert.component";

const routes: Routes = [
  {
    path: '',
    component: WafComponent,
  },
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
  },
  {
    path: 'resize/:id',
    component: WAFResizeComponent,
  },
  {
    path: 'extend/:id',
    component: WAFExtendComponent,
  },
  {
    path: 'ssl-cert/create',
    component: CreateSslCertWAFComponent,
  },
  {
    path: 'ssl-cert/edit/:id',
    component: EditSslCertWAFComponent,
  },
  {
    path: 'detail/:id',
    component: WafDetailComponent,
  },
  {
    path: 'ssl-cert/:id',
    component: SslCertDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WAFRoutingModule {}
