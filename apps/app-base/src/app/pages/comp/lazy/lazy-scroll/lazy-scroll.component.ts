import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef, AfterViewInit, NgZone } from '@angular/core';
import { fromEvent, take } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

import { LazyServiceService } from '@app/pages/comp/lazy/lazy-service.service';
import { DestroyService } from '@core/services/common/destory.service';
import { PageHeaderType } from '@app/core/models/interfaces/page';
import { AdDirective } from '@shared/directives/ad.directive';

const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });

@Component({
  selector: 'app-lazy-scroll',
  templateUrl: './lazy-scroll.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LazyServiceService, DestroyService]
})
export class LazyScrollComponent implements OnInit, AfterViewInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Scroll Lazy Loading Component',
    breadcrumb: ['Home', 'Components', 'Lazy Scroll'],
    desc: 'Scroll the page, load the component'
  };
  @ViewChild(AdDirective, { static: true }) adHost!: AdDirective;

  constructor(private lazyServiceService: LazyServiceService, private zone: NgZone, private cdr: ChangeDetectorRef, private destroyService$: DestroyService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.lazyServiceService.adHost = this.adHost;
    this.zone.runOutsideAngular(() => {
      fromEvent(window, 'scroll', <AddEventListenerOptions>passiveEventListenerOptions)
        .pipe(
          debounceTime(50),
          filter(() => {
            return window.scrollY >= 200;
          }),
          take(1),
          takeUntil(this.destroyService$)
        )
        .subscribe(() => {
          this.lazyServiceService.create().then(() => {
            this.cdr.detectChanges();
          });
        });
    });
  }
}
