import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import { FileSystemComponent } from "./file-system.component";
import { CreateFileSystemComponent } from "./create-file-system/create-file-system.component";

const routes: Routes = [
  {
    path: '',
    component: FileSystemComponent,
  },
  {
    path: 'create',
    component: CreateFileSystemComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FileSystemRoutingModule {}
