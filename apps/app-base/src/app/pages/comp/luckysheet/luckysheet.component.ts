import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';

import { LazyService } from '@core/services/common/lazy.service';

@Component({
  selector: 'app-luckysheet',
  templateUrl: './luckysheet.component.html',
  styleUrls: ['./luckysheet.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LuckysheetComponent implements OnInit, AfterViewInit {
  constructor(private lazyService: LazyService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.lazyService
      .load([
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/css/pluginsCss.css',
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/plugins.css',
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/css/luckysheet.css',
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/assets/iconfont/iconfont.css',
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/js/plugin.js',
        'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js'
      ])
      .then(() => {
        const options = {
          userName: 'NgAntAdmin', // Username
          myFolderUrl: 'https://github.com/huajian123/ng-ant-admin',
          container: 'luckysheet',
          title: 'Simple example', // set the table name
          lang: 'en' // set the form language
        };
        // @ts-ignore
        luckysheet.create(options);
      });
  }
}
