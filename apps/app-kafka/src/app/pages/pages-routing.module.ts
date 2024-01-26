import {RouterModule, Routes} from "@angular/router";
import { DetailComponent } from "./detail/detail.component";
import { NgModule } from "@angular/core";

const routes: Routes = [
  {path: '', redirectTo: 'detail', pathMatch: 'full'},
  {
    path: 'detail',
    component: DetailComponent
  }
  ]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
