import { NgModule } from '@angular/core';
import { RemoteEntryComponent } from './entry.component';
import {DashboardModule} from "../routes/dashboard/dashboard.module";
import {PagesModule} from "../pages/pages.module";

@NgModule({
  declarations: [RemoteEntryComponent],
  imports: [
    PagesModule
  ],
  providers: [],
})
export class RemoteEntryModule {}
