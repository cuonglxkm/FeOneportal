import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { PolicyListComponent } from './policy-list/policy-list.component';
import { PolicyRoutingModule } from './policy-routing.module';
import { SharedModule } from '@shared';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { PolicyCreateComponent } from './policy-create/policy-create.component';

@NgModule({
  declarations: [PolicyListComponent, PolicyCreateComponent],
  imports: [PolicyRoutingModule, SharedModule, NgJsonEditorModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PolicyModule {}
