import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { getCurrentRegionAndProject } from '@shared';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ClipboardService } from 'ngx-clipboard';
import { FILE_NO_SPACE_REGEX } from 'src/app/shared/constants/constants';
import { RegionID } from 'src/app/shared/enums/common.enum';
import {
  BucketDetail,
  BucketWebsite
} from 'src/app/shared/models/bucket.model';
import { BucketService } from 'src/app/shared/services/bucket.service';

@Component({
  selector: 'one-portal-static-web-hosting',
  templateUrl: './static-web-hosting.component.html',
  styleUrls: ['./static-web-hosting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaticWebHostingComponent implements OnInit {
  @Input() bucketName: string;
  @Input() bucketDetail: BucketDetail = new BucketDetail();
  bucketWebsitecreate: BucketWebsite = new BucketWebsite();
  isLoading: boolean = false;
  bucket: any;
  indexDocument : string | null
  region = JSON.parse(localStorage.getItem('regionId'));
  constructor(
    private bucketService: BucketService,
    private cdr: ChangeDetectorRef,
    private clipboardService: ClipboardService,
    private message: NzMessageService,
    private notification: NzNotificationService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private fb: NonNullableFormBuilder
  ) {
  }
  ngOnInit(): void {
    let regionAndProject = getCurrentRegionAndProject();
    this.region = regionAndProject.regionId;  
    console.log(this.bucketDetail);
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bucketDetail'] && changes['bucketDetail'].currentValue) {
     if(this.bucketDetail.indexDocumentSuffix !== undefined){
      if (this.bucketDetail.indexDocumentSuffix !== null) {
        console.log('indexDocument set to:', this.indexDocument);
        this.formUpdate.get('indexDocumentSuffix')?.enable();
        this.formUpdate.get('errorDocument')?.enable();
        this.formUpdate.get('redirectAllRequestsTo')?.disable();
      } else if(this.bucketDetail.indexDocumentSuffix === null && this.bucketDetail.redirectAllRequestsTo === null) {
        console.log(this.bucketDetail.indexDocumentSuffix)
        this.formUpdate.get('indexDocumentSuffix')?.enable();
        this.formUpdate.get('errorDocument')?.enable();
        this.formUpdate.get('redirectAllRequestsTo')?.disable();
      }else{
        this.formUpdate.get('indexDocumentSuffix')?.disable();
        this.formUpdate.get('errorDocument')?.disable();
        this.formUpdate.get('redirectAllRequestsTo')?.enable();
      }
     }
    }
  }


  formUpdate: FormGroup<{
    errorDocument: FormControl<string>;
    indexDocumentSuffix: FormControl<string>;
    redirectAllRequestsTo: FormControl<string>;
  }> = this.fb.group({
    errorDocument: ['', Validators.pattern(FILE_NO_SPACE_REGEX)],
    indexDocumentSuffix: ['', Validators.pattern(FILE_NO_SPACE_REGEX)],
    redirectAllRequestsTo: ['', Validators.pattern(FILE_NO_SPACE_REGEX)],
  });

  copyText(endPoint: string) {
    this.clipboardService.copyFromContent(endPoint);
    this.message.success('Copied to clipboard');
  }

  handleChangeRedirect(event){
    if (event === false) {
     this.formUpdate.controls.errorDocument.setValidators([Validators.required, Validators.pattern(FILE_NO_SPACE_REGEX)])
     this.formUpdate.controls.indexDocumentSuffix.setValidators([Validators.required, Validators.pattern(FILE_NO_SPACE_REGEX)])
     this.formUpdate.controls.redirectAllRequestsTo.setValidators([Validators.pattern(FILE_NO_SPACE_REGEX)])
     this.formUpdate.get('indexDocumentSuffix')?.enable();
     this.formUpdate.get('errorDocument')?.enable();
     this.formUpdate.get('redirectAllRequestsTo')?.disable();
     this.formUpdate.updateValueAndValidity()
    } else {
      this.formUpdate.controls.errorDocument.setValidators([Validators.pattern(FILE_NO_SPACE_REGEX)])
     this.formUpdate.controls.indexDocumentSuffix.setValidators([Validators.pattern(FILE_NO_SPACE_REGEX)])
     this.formUpdate.controls.redirectAllRequestsTo.setValidators([Validators.required, Validators.pattern(FILE_NO_SPACE_REGEX)])
     this.formUpdate.get('indexDocumentSuffix')?.disable();
     this.formUpdate.get('errorDocument')?.disable();
     this.formUpdate.get('redirectAllRequestsTo')?.enable();
     this.formUpdate.updateValueAndValidity()
    }
  }

  update() {
    this.isLoading = true
    if (this.bucketDetail.isWebsite) {
      this.bucketWebsitecreate.bucketName = this.bucketName;
      this.bucketWebsitecreate.indexDocumentSuffix =
        this.bucketDetail.indexDocumentSuffix;
      this.bucketWebsitecreate.errorDocument = this.bucketDetail.errorDocument;
      if (this.bucketDetail.checkRedirectAllRequests) {
        this.bucketWebsitecreate.redirectAllRequestsTo =
          this.bucketDetail.redirectAllRequestsTo;
      } else {
        this.bucketWebsitecreate.redirectAllRequestsTo = '';
      }

      this.bucketService
        .createBucketWebsite(this.bucketWebsitecreate, this.region)
        .subscribe({
          next: (data) => {
            this.isLoading = false
            this.notification.success(
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.static.web.hosting.create.success')
            );
            this.cdr.detectChanges()
          },
          error: (e) => {
            this.isLoading = false
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.static.web.hosting.create.fail')
            );
            this.cdr.detectChanges()
          },
        });
    } else {
      this.bucketService
        .deleteBucketWebsite({ bucketName: this.bucketName }, this.region)
        .subscribe({
          next: (data) => {
            this.isLoading = false
            this.notification.success(
              this.i18n.fanyi('app.status.success'),
              this.i18n.fanyi('app.static.web.hosting.create.success')
            );
            this.cdr.detectChanges()
          },
          error: (e) => {
            this.isLoading = false
            this.notification.error(
              this.i18n.fanyi('app.status.fail'),
              this.i18n.fanyi('app.static.web.hosting.create.fail')
            );
            this.cdr.detectChanges()
          },
        });
    }
  }

  cancel() {
    if (this.region === RegionID.ADVANCE) {
      this.router.navigate(['/app-smart-cloud/object-storage-advance/bucket']);
    } else {
      this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
    }
  }
}
