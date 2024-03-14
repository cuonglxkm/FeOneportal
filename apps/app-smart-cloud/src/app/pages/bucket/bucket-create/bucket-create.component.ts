import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BucketService } from 'src/app/shared/services/bucket.service';

@Component({
  selector: 'one-portal-bucket-create',
  templateUrl: './bucket-create.component.html',
  styleUrls: ['../bucket-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketCreateComponent implements OnInit {
  bucketName: string;
  type: string;

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[a-z0-9-.]{3,63}$/),
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
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
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
    this.cdr.detectChanges();
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
    this.type = this.activePrivate ? 'Private' : 'Public';
    this.bucketService.createBucket(this.bucketName, this.type).subscribe({
      next: (data) => {
        this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
      },
      error: (e) => {
        this.router.navigate(['/app-smart-cloud/object-storage/bucket']);
        this.notification.error('', 'Tạo mới Bucket không thành công');
      },
    });
  }
}
