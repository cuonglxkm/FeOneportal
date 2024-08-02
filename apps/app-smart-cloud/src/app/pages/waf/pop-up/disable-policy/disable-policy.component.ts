import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { WafDomain } from '../../waf.model';
import { WafService } from 'src/app/shared/services/waf.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { finalize } from 'rxjs';

@Component({
  selector: 'one-portal-disable-policy',
  templateUrl: './disable-policy.component.html',
  styleUrls: ['./disable-policy.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisablePolicyComponent {
  @Input() domainData: WafDomain

  isVisible: boolean = false;
  isLoading: boolean = false

  constructor(
    private wafService: WafService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ){}

  openModal(){
    this.isVisible = true
  }

  handleCancelDisablePolicyModal(){
    this.isVisible = false
  }

  handleOnSubmit(){
    this.isLoading = true;
    this.wafService.disableAllPolicies(this.domainData.id).pipe(finalize(()=>{
      this.isLoading = false
    })).subscribe({
      next:()=>{
        this.notification.success(this.i18n.fanyi("app.status.success"),"Thao tác thành công")
        this.isVisible = false;
        this.router.navigate(['/app-smart-cloud/waf'])
      },
      error:()=>{
        this.notification.error(this.i18n.fanyi("app.status.error"),"Có lỗi xảy ra")
      }
    })
  }
}
