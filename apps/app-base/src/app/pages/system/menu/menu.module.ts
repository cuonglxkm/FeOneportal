import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { MenuModalModule } from '@widget/biz-widget/system/menu-modal/menu-modal.module';

import { MenuRoutingModule } from './menu-routing.module';
import { MenuComponent } from './menu.component';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat'
import { environment } from '@env/environment';
import { MenuService } from '@core/services/firebase/menu.service';


@NgModule({
  declarations: [MenuComponent],
  imports: [SharedModule, MenuModalModule, MenuRoutingModule],
  providers: [
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    MenuService
  ]
})
export class MenuModule { }
