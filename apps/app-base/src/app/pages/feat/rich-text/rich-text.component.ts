import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';

import { environment } from '@env/environment';
import { PageHeaderType } from '@app/core/models/interfaces/page';

@Component({
  selector: 'app-rich-text',
  templateUrl: './rich-text.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RichTextComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Rich text, people always like to use fancy words to express their empty emotions',
    breadcrumb: ['Home', 'Extensions', 'Rich Text']
  };
  localUrl = 'http://139.9.225.248:8088';
  uploadRichFileUrl = environment.production ? `${this.localUrl}/rich-upload` : '/site/rich-upload';
  validateForm = this.fb.group({
    detail: ['', [Validators.required]]
  });

  // all configurations
  // http://tinymce.ax-z.cn/configure/editor-appearance.php
  editInit = {
    // automatic_uploads: false,
    images_upload_url: this.uploadRichFileUrl,
    branding: false, // hide technical support in the lower right corner
    height: 500,
    convert_urls: false, // uploaded image paths are not converted to relative paths
    menubar: false,
    plugins: ['image'],
    fontsize_formats: '12px 14px 16px 18px 24px 36px 48px 56px 72px',
    language: 'vi_VN',
    // images_upload_handler: function (blobInfo: any, success: (arg0: string) => void, failure: any) {
    //   console.log(blobInfo);
    //   console.log(success);
    //   /* no matter what you upload, we will turn it into TinyMCE logo :)*/
    //   // success('http://moxiecode.cachefly.net/tinymce/v9/images/logo.png');
    // },
    toolbar: '|bold|fontselect|fontsizeselect|styleselect|removeformat|aligncenter  alignright alignjustify | image'

    // image_caption: true,
    // paset: plugin allows pasting images
    // paste_data_images: true,
    // image_advtab: true,
    // imagetools_toolbar: 'rotateleft rotateright | flipv fliph | editimage imageoptions',
  };

  constructor(private fb: NonNullableFormBuilder) {}

  ngOnInit(): void {}
}
