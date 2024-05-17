import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ClusterComponent } from "./cluster/cluster.component";
import { ListClusterComponent } from "./list-cluster/list-cluster.component";
import { OverallComponent } from "./overall/overall.component";
import { UpgradeComponent } from "./upgrade/upgrade.component";
import { ExtensionComponent } from "./extension/extension.component";
import { EditInfoComponent } from "./edit-info/edit-info.component";

const routes: Routes = [
  { path: '', component: ListClusterComponent },
  { path: 'create', component: ClusterComponent },
  { path: ':id', component: OverallComponent },
  { path: 'upgrade/:id', component: UpgradeComponent },
  { path: 'extension/:id', component: ExtensionComponent },
  { path: 'edit/:id', component: EditInfoComponent }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
