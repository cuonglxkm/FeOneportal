import {Component, OnInit} from '@angular/core';
import {SocialService} from "@delon/auth";
import {SettingsService} from "@delon/theme";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'one-portal-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.less'],
})
export class WelcomeComponent implements OnInit {
  loading = false;

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {

  }

  ngOnInit(): void {

  }

  clickLogin() {
    this.router.navigate(['/passport/login'])
  }

  clickRegister() {
    this.router.navigate(['/passport/register'])
  }

}
