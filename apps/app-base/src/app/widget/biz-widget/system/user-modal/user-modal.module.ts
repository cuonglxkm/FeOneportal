import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { UserModalComponent } from './user-modal.component';

@NgModule({
  declarations: [UserModalComponent],
  imports: [SharedModule]
})
export class UserModalModule { }
