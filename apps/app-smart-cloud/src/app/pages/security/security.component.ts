import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { getCurrentRegionAndProject } from '@shared';
import { ProjectModel } from '../../shared/models/project.model';
import { RegionModel } from '../../shared/models/region.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SecurityService } from 'src/app/shared/services/security.service';
import { FormEnable2FA } from 'src/app/shared/models/security.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'one-portal-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.less'],
})
export class SecurityComponent implements OnInit {
  region = JSON.parse(localStorage.getItem('region')).regionId;
  project = JSON.parse(localStorage.getItem('projectId'));

  toggleSwitch: boolean = false
  isLoading: boolean = false
  isVisibleUpdate: boolean = false

  email:string = ''
  authenticatorKey:string = ''

  form: FormGroup<{
    otp: FormControl<string>;
  }> = this.fb.group({
    otp: ['', [Validators.required]],
  });

  constructor(
    private service: SecurityService,
    private notification: NzNotificationService,
    private fb: NonNullableFormBuilder,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
  ) {}

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
  }

  projectChange(project: ProjectModel) {
    this.project = project.id;
  }

  ngOnInit() {

    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.project = regionAndProject.projectId;

    this.email = this.tokenService.get().email
    
  }

  // clickSwitch(): void {
  //   this.toggleSwitch = !this.toggleSwitch;
  // }

  handleSubmit(): void {
    let formeEnable2FA = new FormEnable2FA();
    formeEnable2FA.code = this.form.controls.otp.value.toString();
    this.service.enable2fa(formeEnable2FA).subscribe(data => {
      if (data.success == true) {
        this.isVisibleUpdate = false
        this.notification.success("Thành công", "Đăng nhập với xác thực hai yếu tố đã được bật");
      }
      else
      {
        this.notification.error("Thất bại", "Mã xác thực không chính xác");
      }
    }, error => {
      this.isVisibleUpdate = false;
      this.toggleSwitch = false;
      this.notification.error("Thất bại", "Thao tác thất bại");
    })
  }

  handleCancel(){
    this.isVisibleUpdate = false;
  }

  handleChangeSwitch(event){
    this.toggleSwitch = event
    if (this.toggleSwitch == true) {
      this.service.authenticatorKey().subscribe((data: any) => {
        this.authenticatorKey = data.key;
        this.isVisibleUpdate = true;
      }, error => {
        this.toggleSwitch = false;
        this.notification.error("Thất bại", "Thao tác thất bại")
      });
    }
    
    console.log(this.toggleSwitch);
  }

  handleUpdate(){
    
  }
}
