import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { InstancesService } from '../../instances/instances.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CatalogService } from 'src/app/shared/services/catalog.service';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core';
import { IpPublicService } from 'src/app/shared/services/ip-public.service';
import { VpcService } from 'src/app/shared/services/vpc.service';
import { OrderService } from 'src/app/shared/services/order.service';
import { LoadingService } from '@delon/abc/loading';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DOMAIN_REGEX } from 'src/app/shared/constants/constants';
import { duplicateDomainValidator, ipValidatorMany } from '../../../../../../../libs/common-utils/src';

@Component({
  selector: 'one-portal-add-domain',
  templateUrl: './add-domain.component.html',
  styleUrls: ['./add-domain.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDomainComponent {

  form: FormGroup = this.fb.group({
    nameWAF: ['', [Validators.required]],
    domain: ['', [Validators.required,Validators.pattern(DOMAIN_REGEX) ,duplicateDomainValidator]],
      ipPublic: ['', [Validators.required, ipValidatorMany]],
      host: [''],
      port: [''],
      sslCert: [''],
      package:['']
  })

  isVisibleCreateSSLCert = false;
 
  openModalSSlCert(){
    this.isVisibleCreateSSLCert = true
  }

  handleCancelCreateSSLCert(){
    this.isVisibleCreateSSLCert = false
  }

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private instancesService: InstancesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService,
    private catalogService: CatalogService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private ipService: IpPublicService,
    private vpc: VpcService,
    private orderService: OrderService,
    private loadingSrv: LoadingService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer

  ) {
  
  }
}
