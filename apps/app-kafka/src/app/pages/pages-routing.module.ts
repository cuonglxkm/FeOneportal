import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateKafkaComponent } from "./create-kafka/create-kafka.component";
import { LoadTopicComponent } from "./detail/topic-mngt/load-topic/load-topic.component";
import { ListKafkaComponent } from "./list-kafka/list-kafka.component";
import { EditKafkaComponent } from "./edit-kafka/edit-kafka.component";
import { UpgradeKafkaComponent } from "./upgrade-kafka/upgrade-kafka.component";

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
    path: 'edit/:id',
    component: EditKafkaComponent
  },
  {
    path: 'upgrade/:id',
    component: UpgradeKafkaComponent
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
