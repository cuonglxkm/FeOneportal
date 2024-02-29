import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PagesModule } from "../pages/pages.module";
import { RemoteEntryComponent } from './entry.component';
import { remoteRoutes } from './entry.routes';

@NgModule({
    declarations: [RemoteEntryComponent],
    imports: [
        PagesModule,
        RouterModule.forChild(remoteRoutes),
    ],
    providers: [],
})
export class RemoteEntryModule {
}
