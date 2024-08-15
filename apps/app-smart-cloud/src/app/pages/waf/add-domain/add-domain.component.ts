import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
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
import { duplicateDomainValidator, hostValidator, ipValidatorMany, ipWafDomainValidatorMany } from '../../../../../../../libs/common-utils/src';
import { AddDomainRequest, WafDetailDTO, SslCertDTO } from '../waf.model';
import { WafService } from 'src/app/shared/services/waf.service';
import { debounceTime, finalize, fromEvent, map } from 'rxjs';
import { checkProperSslWithDomain } from 'src/app/shared/utils/common';

@Component({
  selector: 'one-portal-add-domain',
  templateUrl: './add-domain.component.html',
  styleUrls: ['./add-domain.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDomainComponent implements OnInit {

  @ViewChild('domainInput') domainInput: ElementRef;

  form: FormGroup = this.fb.group({
    nameWAF: ['', [Validators.required]],
    domain: ['', [Validators.required,Validators.pattern(DOMAIN_REGEX)]],
      ipPublic: ['', [Validators.required, ipValidatorMany]],
      host: ['', hostValidator],
      port: [''],
      sslCert: [''],
      package:['']
  })

  listWafs: WafDetailDTO[]

  listSslCert: SslCertDTO[]

  listSslCertOptions: SslCertDTO[]

  isVisibleCreateSSLCert = false;

  isLoadingGetWaf: boolean

  isLoadingSubmit: boolean

  selectedPackage: number

  addDomainRequest = new AddDomainRequest()
 
  openModalSSlCert(){
    this.isVisibleCreateSSLCert = true
  }

  handleCancelCreateSSLCert(){
    this.isVisibleCreateSSLCert = false
  }

  ngOnInit(): void {
      this.getListWaf()
      this.getListSslCert()
  }

  ngAfterViewInit() {
    fromEvent(this.domainInput.nativeElement, 'input').pipe(
      map((event: any) => event.target.value),
      debounceTime(700)
    ).subscribe((value: string) => {
      this.getListSslOptions(value);
    });
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
    private sanitizer: DomSanitizer,
    private wafService: WafService
  ) {
  
  }

  getListWaf(){
    this.isLoadingGetWaf = true
    this.wafService.getWafs(9999, 1, 'ACTIVE', '', '').pipe(finalize(()=>{
      this.isLoadingGetWaf = false
    })).subscribe((data)=>{
      console.log('data', data)
      this.listWafs = data.records
      this.form.controls.nameWAF.setValue(this.listWafs?.[0]?.id)
      this.form.controls.package.setValue(this.listWafs?.[0].offerId)
    })
  }

  getListSslCert(){
    this.wafService.getListSslCert('', 999, 1).subscribe((res) => {
      this.listSslCert = res?.records
      this.listSslCertOptions = this.listSslCert
    }, (error) => {
      console.log(error);     
    })
  }

  onChangeWaf(value: any){
    const selectedWaf = this.listWafs.filter((waf)=> (waf.id === value))
    this.selectedPackage = selectedWaf?.[0]?.offerId
  }

  handleOnSubmit(){
    this.isLoadingSubmit = true
    const formValues = this.form.getRawValue()
    this.addDomainRequest.domain = formValues.domain
    this.addDomainRequest.host = formValues.host
    this.addDomainRequest.ipPublic = formValues.ipPublic
    this.addDomainRequest.packageId = formValues.nameWAF
    if(formValues.port) this.addDomainRequest.port = formValues.port
    this.addDomainRequest.policyId = 0
    this.addDomainRequest.sslCertId = formValues.sslCert || 0


    this.wafService.addDomain(this.addDomainRequest).pipe(finalize(()=>{
      this.isLoadingSubmit = false
      this.cdr.detectChanges()
    })).subscribe({
      next: (data: any)=>{
        this.notification.success( this.i18n.fanyi("app.status.success"), "Tiến trình sẽ diễn ra trong 1 – 3 phút")
        this.navigateToListWaf()
      },
      error: ()=>{
        this.notification.error(
          this.i18n.fanyi("app.status.fail"),
          "Có lỗi xảy ra, vui lòng thử lại"
        )
      }
    })
  }

  navigateToListWaf() {
    this.router.navigate(['/app-smart-cloud/waf']);
  }

  onOkCreateSsl(){
    this.isVisibleCreateSSLCert = false;
    this.getListSslCert()
  }

  getListSslOptions(domainName: string){
    this.listSslCertOptions = this.listSslCert.filter((cert) => checkProperSslWithDomain(domainName, cert.subjectAlternativeNames))
  }

  handleOnChangeDomain(event: any){
    this.getListSslOptions(event.target.value)
  }
}
