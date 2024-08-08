import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { BaseResponse } from '../../../../../../../libs/common-utils/src';
import { WafService } from 'src/app/shared/services/waf.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AssociatedDomainDTO, SslCertDTO } from '../waf.model';
import { LoadingService } from '@delon/abc/loading';
import { finalize } from 'rxjs';

@Component({
  selector: 'one-portal-ssl-cert-detail',
  templateUrl: './ssl-cert-detail.component.html',
  styleUrls: ['./ssl-cert-detail.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SslCertDetailComponent implements OnInit {
  isLoading: boolean = false;
  detail: SslCertDTO;

  isVisibleAssociateDomain: boolean = false;
  associatedDomains: AssociatedDomainDTO[];

  constructor(
    private service: WafService,
    private router: Router,
    private loadingService: LoadingService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id')
    this.getSslCertificateDetail(id);
  }

  private getSslCertificateDetail(id) {
    this.loadingService.open({ type: "spin", text: "Loading..." });
    this.service.getDetailSslCert(id).pipe(
          finalize(() => this.loadingService.close())
        ).subscribe({
      next:(data)=>{
        this.detail = data
        this.associatedDomains = data?.domains
        this.cdr.detectChanges()
      },
      error:(error)=>{
        this.notification.error(this.i18n.fanyi("app.status.fail"), this.i18n.fanyi(error.error.message))
      }
    })
  }

  handleOpenAssociateDomain() {
    this.isVisibleAssociateDomain = true;
  }

  handleCancelAssociateDomain() {
    this.isVisibleAssociateDomain = false;
  }

  handleOk(){
    const id = this.activatedRoute.snapshot.paramMap.get('id')
    this.getSslCertificateDetail(id)
  }
}
