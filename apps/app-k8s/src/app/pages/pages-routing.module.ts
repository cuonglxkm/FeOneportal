import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RemoteEntryComponent } from "../remote-entry/entry.component";
import { ClusterComponent } from "./cluster/cluster.component";
import { DetailClusterComponent } from "./detail-cluster/detail-cluster.component";
import { LogsComponent } from "./logs/logs.component";
import { ListClusterComponent } from "./list-cluster/list-cluster.component";

const routes: Routes = [
  { path: '', component: ListClusterComponent },
  { path: 'create', component: ClusterComponent },
  { path: ':id', component: DetailClusterComponent },
  { path: 'logs/:id', component: LogsComponent },
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
