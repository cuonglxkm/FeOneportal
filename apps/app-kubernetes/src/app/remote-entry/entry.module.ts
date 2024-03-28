import {NgModule} from '@angular/core';
import {RemoteEntryComponent} from './entry.component';
import {PagesModule} from "../pages/pages.module";

@NgModule({
    declarations: [RemoteEntryComponent],
    imports: [
        PagesModule
    ],
    providers: [],
})
export class RemoteEntryModule {
}
