import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ClusterComponent } from "./cluster/cluster.component";
import { ListClusterComponent } from "./list-cluster/list-cluster.component";
import { OverallComponent } from "./overall/overall.component";

const routes: Routes = [
  { path: '', component: ListClusterComponent },
  { path: 'create', component: ClusterComponent },
  { path: ':id', component: OverallComponent }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
