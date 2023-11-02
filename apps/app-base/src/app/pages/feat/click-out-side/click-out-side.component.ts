import { DOCUMENT } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { fromEvent, merge, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PageHeaderType } from '@app/core/models/interfaces/page';
import { fnStopMouseEvent } from '@utils/tools';

@Component({
  selector: 'app-click-out-side',
  templateUrl: './click-out-side.component.html',
  styleUrls: ['./click-out-side.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClickOutSideComponent implements OnInit, AfterViewInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Tap internal and external trigger events, click a little will always have good luck',
    breadcrumb: ['Home', 'Features', 'ClickOutSide']
  };
  text: string = 'Click inside or outside';
  winClick$!: Observable<Event>; // Bind the click event of window
  @ViewChild('targetHtml') targetHtml!: ElementRef;
  targetHtmlClick$!: Observable<any>;

  constructor(private cdr: ChangeDetectorRef, @Inject(DOCUMENT) private doc: Document) {}

  ngAfterViewInit(): void {
    this.targetHtmlClick$ = fromEvent(this.targetHtml.nativeElement, 'click').pipe(
      tap(e => {
        fnStopMouseEvent(<MouseEvent>e);
        this.text = 'Knife cut the flesh';
      })
    );
    this.winClick$ = fromEvent(this.doc, 'click').pipe(
      tap(() => {
        this.text = 'Heart Cut Soul';
      })
    );
    merge(this.targetHtmlClick$, this.winClick$).subscribe(res => {
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {}
}
