import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BucketService } from 'src/app/shared/services/bucket.service';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { getCurrentRegionAndProject } from '@shared';
import { RegionModel } from '../../../../../../../libs/common-utils/src';
import { RegionID } from 'src/app/shared/enums/common.enum';

@Component({
  selector: 'one-portal-bucket-create',
  templateUrl: './bucket-create.component.html',
  styleUrls: ['../bucket-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketCreateComponent implements OnInit {
  bucketName: string;
  type: string;
  isLoading: boolean = false;
  region = JSON.parse(localStorage.getItem('regionId'));
  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^(?!-)(?!.*-$)(?!\.)(?!.*\.$)[a-z0-9-.]*$/),
        this.checkErrorName.bind(this)
      ],
    }),
  });

  cardHeight: string = '160px';

  constructor(
    private bucketService: BucketService,
    private notification: NzNotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private el: ElementRef,
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
  ) {}

  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;
    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .subscribe((result) => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          // Màn hình cỡ nhỏ
          this.cardHeight = '130px';
        } else if (result.breakpoints[Breakpoints.Small]) {
          // Màn hình cỡ nhỏ - trung bình
          this.cardHeight = '180px';
        } else if (result.breakpoints[Breakpoints.Medium]) {
          // Màn hình trung bình
          this.cardHeight = '210px';
        } else if (result.breakpoints[Breakpoints.Large]) {
          // Màn hình lớn
          this.cardHeight = '165px';
        } else if (result.breakpoints[Breakpoints.XLarge]) {
          // Màn hình rất lớn
          this.cardHeight = '150px';
        }

        // Cập nhật chiều cao của card bằng Renderer2
        this.renderer.setStyle(
          this.el.nativeElement,
          'height',
          this.cardHeight
        );
      });
  }

  onRegionChange(region: RegionModel) {
    this.region = region.regionId;
    if(this.region === RegionID.ADVANCE){
      this.router.navigate(['/app-smart-cloud/object-storage-advance/bucket']);
    }else{
      this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
    }
  }

  onRegionChanged(region: RegionModel) {
    this.region = region.regionId;
  }

  activePrivate: boolean = true;
  activePublic: boolean = false;
  initPrivate(): void {
    this.activePrivate = true;
    this.activePublic = false;
  }
  initPublic(): void {
    this.activePrivate = false;
    this.activePublic = true;
  }

  save() {
    this.isLoading = true
    this.bucketService.createBucket(this.bucketName, this.activePrivate === true ? 'Private': 'Public', this.region).subscribe({
      next: (data) => {
        this.isLoading = false
        this.notification.success(
          this.i18n.fanyi('app.status.success'),
          this.i18n.fanyi('app.button.bucket.create.success')
        );
        if (this.region === RegionID.ADVANCE) {
          this.router.navigate(['/app-smart-cloud/object-storage-advance/bucket']);
        } else {
          this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
        }
      },
      error: (e) => {
        this.isLoading = false

        console.log(e);
        debugger;
        if(e.status === 500){
          const errorObject = JSON.parse(e.error);
          if(errorObject.type=="Exception"){
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi(e.message)
          );
        }
        if(errorObject.type=="BucketAlreadyExistsException"){
          this.notification.error(
          this.i18n.fanyi('app.status.fail'),
          this.i18n.fanyi('Tên Bucket đã được sử dụng bởi Object Storage khác, Vui lòng sử dụng tên khác.')
          )
        }
        }else{
          this.notification.error(
            this.i18n.fanyi('app.status.fail'),
            this.i18n.fanyi('app.button.bucket.create.fail')
          );
        }
        this.cdr.detectChanges();
      },
    });
  }

  navigateToBucketList(){
    if(this.region === RegionID.ADVANCE){
      this.router.navigate(['/app-smart-cloud/object-storage-advance/bucket']);
    }else{
      this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
    }
  }

  checkErrorName(control: FormControl): { [key: string]: boolean } | null {
    const value = control.value;
  
    if (value.length <= 2) {
      return { lessTwo: true };
    } else if (value.length > 63) {
      return { more63: true };
    }
  
    const invalidPatterns = /(\.-|-\.)/;
    if (invalidPatterns.test(value)) {
      return { invalidPattern: true };
    }
  
    return null;
  }
}
