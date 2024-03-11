import {RouterModule, Routes} from "@angular/router";
import { DetailComponent } from "./detail/detail.component";
import { NgModule } from "@angular/core";
import { LoadTopicComponent } from "./detail/topic-mngt/load-topic/load-topic.component";
import { KafkaDetailComponent } from "./list-kafka/list-kafka.component";
import { CreateKafkaComponent } from "./create-kafka/create-kafka.component";

const routes: Routes = [
  {path: '', redirectTo: '', pathMatch: 'full'},
  {
    path: '',
    component: KafkaDetailComponent
  },
  {
    path: 'create',
    component: CreateKafkaComponent
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
