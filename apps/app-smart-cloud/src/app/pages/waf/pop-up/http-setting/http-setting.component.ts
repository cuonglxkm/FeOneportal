import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpsSettingRequest, SslCertDTO, WafDomain } from '../../waf.model';
import { WafService } from 'src/app/shared/services/waf.service';
import { finalize } from 'rxjs';


@Component({
  selector: 'one-portal-http-setting',
  templateUrl: './http-setting.component.html',
  styleUrls: ['./http-setting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HttpSettingComponent implements OnInit{
  @Input() domainData: WafDomain ;
  @Input() listSslCert: SslCertDTO[]
  @Output() onOk = new EventEmitter();
  @Output() onOkCreateSsl = new EventEmitter()

  isLoading: boolean = false;
  isVisibleCreateSsl: boolean = false
  isVisible: boolean = false

  selectedProtocolValue: string = 'follow'

  httpsSettingRequest = new HttpsSettingRequest()

  constructor(
    private fb: NonNullableFormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private wafService: WafService
  ){}

  ngOnInit(): void {
    this.validateForm.controls.cert.setValue(this.domainData.sslCertId)
    this.validateForm.controls.port.setValue(this.domainData.port)
  }

  validateForm = this.fb.group({
    cert: [null as number , [Validators.required]],
    port: [0],
    protocol: ['follow' ,[Validators.required]]
  })

  protocolOptions = [
    {
      label: 'Follow',
      value: 'follow'
    },
    {
      label: 'HTTP->HTTPS',
      value:'https'
    },
    {
      label: 'HTTPS->HTTP',
      value:'http'
    }
  ]

  // getListSslCert(){
  //   this.wafService.getListSslCert('', 999, 1).subscribe((res) => {
  //     this.listSslCert = res?.records
  //   }, (error) => {
  //     console.log(error);     
  //   })
  // }

  onKeyDown(event: KeyboardEvent) {
    // Lấy giá trị của phím được nhấn
    const key = event.key;
    // Kiểm tra xem phím nhấn có phải là một số hoặc phím di chuyển không
    if (
      (isNaN(Number(key)) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight') ||
      key === '.'
    ) {
      // Nếu không phải số hoặc đã nhập dấu chấm và đã có dấu chấm trong giá trị hiện tại
      event.preventDefault(); // Hủy sự kiện để ngăn người dùng nhập ký tự đó
    }
  }

  onChangeProtocol(value: any){
    this.selectedProtocolValue = value
    if(value === 'http'){
      this.validateForm.controls.port.setValue(this.domainData.port ?? 80, {emitEvent: false})
    }
    else if(value === 'https'){
      this.validateForm.controls.port.setValue(this.domainData.port ?? 443, {emitEvent: false})
    }
  }

  openModal(){
    this.isVisible = true
  }

  handleCancelHttpSetting(){
    this.isVisible = false
  }

  handleSubmit(){
    const formValues = this.validateForm.getRawValue()
    this.httpsSettingRequest.certId = Number(formValues.cert)
    if(formValues.protocol){
      this.httpsSettingRequest.port = String(formValues.port)
      this.httpsSettingRequest.protocol = formValues.protocol
    }
    this.wafService.settingHttps(this.httpsSettingRequest, this.domainData.id).pipe(finalize(()=>{
      this.isLoading = false
    })).subscribe({
      next:()=>{
        this.notification.success(this.i18n.fanyi("app.status.success"), "Thao tác thành công")
        this.isVisible = false;
        this.onOk.emit()
      },
      error:()=>{
        this.notification.error(this.i18n.fanyi("app.status.error"), "Có lỗi xảy ra")
        this.isLoading = false
      }
    })
    this.cdr.detectChanges()
  }

  openModalSSlCert(){
    this.isVisibleCreateSsl = true
  }

  cancelModalSslCert(){
    this.isVisibleCreateSsl = false
  }

  handleOnAddCert(){
    this.onOkCreateSsl.emit()
    this.cancelModalSslCert()
  }
}
