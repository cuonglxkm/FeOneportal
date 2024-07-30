import {Component, Inject, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { WafDTO } from '../waf.model';
import { WafService } from 'src/app/shared/services/waf.service';

@Component({
  selector: 'one-portal-waf-detail',
  templateUrl: './waf-detail.component.html',
  styleUrls: ['./waf-detail.component.less'],
})
export class WafDetailComponent implements OnInit{
  data: WafDTO;
  constructor(private service: WafService,
              private router: Router,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
              private activatedRoute: ActivatedRoute,
              private notification: NzNotificationService
            ) {
  }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getData(id);

  }

  private getData(id: any) {
    this.service.getDetail(id)
      .subscribe({
        next: data => {
          this.data = data;
        },
        error: error =>{
          this.notification.error(this.i18n.fanyi('app.status.fail'), this.i18n.fanyi(error.error.message));
        }
      });
  }
  
  edit() {
    this.router.navigate(['/app-smart-cloud/project/update/' + this.activatedRoute.snapshot.paramMap.get('id')])
  }

  extend() {
    this.router.navigate(['/app-smart-cloud/project/extend/' + this.activatedRoute.snapshot.paramMap.get('id')])
  }
}
