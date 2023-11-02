import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';
import { NzImageService } from 'ng-zorro-antd/image';

@Component({
  selector: 'app-img-preview',
  templateUrl: './img-preview.component.html',
  styleUrls: ['./img-preview.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImgPreviewComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Image Preview',
    breadcrumb: ['Home', 'Features', 'Image Preview']
  };
  constructor(private nzImageService: NzImageService) {}
  onClick(): void {
    const images = [
      {
        src: 'https://img.alicdn.com/tfs/TB1g.mWZAL0gK0jSZFtXXXQCXXa-200-200.svg',
        width: '200px',
        height: '200px',
        alt: 'ng-zorro'
      },
      {
        src: 'https://img.alicdn.com/tfs/TB1Z0PywTtYBeNjy1XdXXXXyVXa-186-200.svg',
        width: '200px',
        height: '200px',
        alt: 'angular'
      }
    ];
    this.nzImageService.preview(images, { nzZoom: 1.5, nzRotate: 0 });
  }
  ngOnInit(): void {}
}
