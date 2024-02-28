import {RouterModule, Routes} from "@angular/router";
import { DetailComponent } from "./detail/detail.component";
import { NgModule } from "@angular/core";
import { LoadTopicComponent } from "./detail/topic-mngt/load-topic/load-topic.component";

const routes: Routes = [
  {path: '', redirectTo: 'detail', pathMatch: 'full'},
  {
    path: 'detail',
    component: DetailComponent
  },
  {path: '', redirectTo: 'load-topic', pathMatch: 'full'},
  {
    path: 'load-topic',
    component: LoadTopicComponent
  }
  ]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
