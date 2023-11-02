import { DOCUMENT } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';
import { NzScrollService } from 'ng-zorro-antd/core/services';

/*https://segmentfault.com/a/1190000020769492*/
@Component({
  selector: 'app-play-scroll',
  templateUrl: './play-scroll.component.html',
  styleUrls: ['./play-scroll.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayScrollComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Play Scroll',
    breadcrumb: ['Home', 'Extended', 'Play Scroll'],
    desc: 'It is said that a teenager rode an electric donkey to buy melons'
  };

  constructor(private scrollService: NzScrollService, @Inject(DOCUMENT) private _doc: Document) {}

  toDocBottom(): void {
    this.scrollService.scrollTo(null, this._doc.body.scrollHeight);
  }

  toDoc100(): void {
    this.scrollService.scrollTo(null, 100);
  }

  toBox1(): void {
    this.scrollService.scrollTo(this._doc.querySelector('#div-scroll3'), 100);
  }

  toBox2(): void {
    this.scrollService.scrollTo(this._doc.querySelector('#div-scroll4'), 100);
  }

  toDocHead(): void {
    this.scrollService.scrollTo(null, 0);
  }

  ngOnInit(): void {}
}
