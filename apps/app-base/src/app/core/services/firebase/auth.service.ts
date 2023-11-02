import { Injectable, NgZone } from '@angular/core';
import { from } from 'rxjs';
import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
} from '@angular/fire/compat/firestore';
import { WindowService } from '../common/window.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    private windowSrv: WindowService
  ) {

    // this.afAuth.authState.subscribe((user) => {
    //   if (user) {
    //     this.windowSrv.setStorage('user', JSON.stringify(user));
    //   } else {
    //     this.windowSrv.setStorage('user', 'null');
    //   }
    // });
  }
  // Sign in with email/password
  signIn(email: string, password: string) {
    return from(
      this.afAuth.signInWithEmailAndPassword(email, password)
        .catch((err) => {
          this.windowSrv.alert(err)
          return { user: undefined }
        })
    )
  }
  // Sign up with email/password
  signUp(email: string, password: string) {
    // try {
    return from(this.afAuth.createUserWithEmailAndPassword(email, password))
    /* Call the SendVerificaitonMail() function when new user sign
    up and returns promise */
    // await this.sendVerificationMail();
    // this.SetUserData(result.user);
    // } catch (error) {
    //   window.alert(error.message);
    // }
  }
  // Send email verfificaiton when new user sign up
  sendVerificationMail() {
    return from(this.afAuth.currentUser.then((u: any) => u.sendEmailVerification()))
    // .then(() => {
    //   this.router.navigate(['verify-email-address']);
    // });
  }
  // Reset Forggot password
  forgotPassword(passwordResetEmail: string) {
    return from(this.afAuth.sendPasswordResetEmail(passwordResetEmail))
    // .then(() => {
    //   window.alert('Password reset email sent, check your inbox.');
    // })
    // .catch((error) => {
    //   window.alert(error);
    // });
  }
  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user.emailVerified !== false ? true : false;
  }
  // Sign in with Google
  googleAuth() {
    const provider = new auth.GoogleAuthProvider()
    return from(this.afAuth.signInWithPopup(provider))
    //  return this.AuthLogin(new auth.GoogleAuthProvider()).then((res: any) => {
    //     this.router.navigate(['dashboard']);
    //   }); 
  }
  // Auth logic to run auth providers
  async authLogin(provider: any) {
    return this.afAuth.signInWithPopup(provider)
    // .then((result) => {
    //   this.router.navigate(['dashboard']);
    //   this.SetUserData(result.user);
    // })
    // .catch((error) => {
    //   window.alert(error);
    // });
  }

  // Sign out
  signOut() {
    return from(this.afAuth.signOut())
    // .then(() => {
    //   localStorage.removeItem('user');
    //   this.router.navigate(['sign-in']);
    // });
  }
}
