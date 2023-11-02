import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { LoginFormRoutingModule } from './login-form-routing.module';
import { LoginFormComponent } from './login-form.component';

import { TranslateModule } from '@ngx-translate/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat'
import { environment } from '@env/environment';
import { AuthService } from '@app/core/services/firebase/auth.service';

@NgModule({
  declarations: [LoginFormComponent],
  imports: [SharedModule, LoginFormRoutingModule, TranslateModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  providers: [
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    AuthService
  ]
})
export class LoginFormModule { }
