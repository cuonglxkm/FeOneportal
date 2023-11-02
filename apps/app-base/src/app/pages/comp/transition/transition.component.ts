import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';
import { fadeInOnEnterAnimation, fadeOutOnLeaveAnimation, collapseAnimation, rubberBandAnimation } from 'angular-animations';

@Component({
  selector: 'app-transition',
  templateUrl: './transition.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(), rubberBandAnimation(), collapseAnimation()]
})
export class TransitionComponent implements OnInit {
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Animation Componen',
    desc: 'move!',
    breadcrumb: ['Home', 'Components', 'Animation']
  };
  currentComp = 'home';

  constructor() {}

  ngOnInit(): void {}
}
