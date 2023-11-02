import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';

import { LazyServiceService } from '@app/pages/comp/lazy/lazy-service.service';
import { PageHeaderType } from '@app/core/models/interfaces/page';
import { AdDirective } from '@shared/directives/ad.directive';

@Component({
  selector: 'app-lazy-basic',
  templateUrl: './lazy-basic.component.html',
  styleUrls: ['./lazy-basic.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LazyServiceService]
})
export class LazyBasicComponent implements OnInit, AfterViewInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Lazy Loading Component',
    breadcrumb: ['Home', 'Components', 'Lazy Basic'],
    desc: 'Lazy loading components, I always like Jay Chou'
  };
  @ViewChild(AdDirective, { static: true }) adHost!: AdDirective;
  isStarted = false;

  constructor(public lazyServiceService: LazyServiceService) {}

  ngAfterViewInit(): void {
    this.lazyServiceService.adHost = this.adHost;
  }

  ngOnInit(): void {}
}
