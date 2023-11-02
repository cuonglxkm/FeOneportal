import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';

@Component({
  selector: 'app-color-sel',
  templateUrl: './color-sel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSelComponent implements OnInit {
  public color: string = '#2889e9';
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: "I suddenly thought of the lyrics \"You said that the colorful world doesn't have to be taken seriously\"",
    desc: 'All examples: https://zefoy.github.io/ngx-color-picker/',
    breadcrumb: ['Home', 'Features', 'Color Picker']
  };
  constructor() {}

  ngOnInit(): void {}
}
