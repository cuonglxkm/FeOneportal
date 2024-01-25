import {RouterModule, Routes} from "@angular/router";
import { DetailComponent } from "./detail/detail.component";
import { NgModule } from "@angular/core";

const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {
    path: 'dashboard',
    component: DetailComponent
  }
  ]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
