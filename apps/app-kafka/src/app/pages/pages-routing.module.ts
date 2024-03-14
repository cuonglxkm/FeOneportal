import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateKafkaComponent } from "./create-kafka/create-kafka.component";
import { LoadTopicComponent } from "./detail/topic-mngt/load-topic/load-topic.component";
import { ListKafkaComponent } from "./list-kafka/list-kafka.component";

const routes: Routes = [
  {path: '', redirectTo: '', pathMatch: 'full'},
  {
    path: '',
    component: ListKafkaComponent
  },
  {
    path: 'create',
    component: CreateKafkaComponent
  },
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
