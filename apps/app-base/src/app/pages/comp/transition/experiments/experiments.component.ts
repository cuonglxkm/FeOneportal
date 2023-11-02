import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import {
  rotateInDownLeftOnEnterAnimation,
  rollInAnimation,
  zoomInLeftAnimation,
  zoomInDownOnEnterAnimation,
  hueRotateAnimation,
  zoomInUpOnEnterAnimation,
  rubberBandAnimation,
  flashAnimation,
  fadeInOnEnterAnimation,
  rubberBandOnEnterAnimation
} from 'angular-animations';

@Component({
  selector: 'app-experiments',
  templateUrl: './experiments.component.html',
  styleUrls: ['./experiments.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    rotateInDownLeftOnEnterAnimation({ anchor: 'enter' }),
    zoomInDownOnEnterAnimation({ anchor: 'enterLetterAnim1' }),
    fadeInOnEnterAnimation({ anchor: 'enterLetterAnim2' }),
    zoomInUpOnEnterAnimation({ anchor: 'enterLetterAnim3' }),
    rollInAnimation({ anchor: 'letterAnim1' }),
    zoomInLeftAnimation({ anchor: 'letterAnim2' }),
    rubberBandAnimation({ anchor: 'letterAnim3' }),
    hueRotateAnimation({ anchor: 'hueLetter', duration: 5000 }),
    flashAnimation({ anchor: 'flash' }),
    rubberBandOnEnterAnimation({ anchor: 'btnEnter', delay: 12500 }),
    fadeInOnEnterAnimation({ anchor: 'btnEnterFadeIn', delay: 12500, duration: 500 })
  ]
})
export class ExperimentsComponent implements OnInit {
  text1 = 'Shaolin Kungfu is good, really good, Shaolin Kungfu is great, really good...'.split('');
  text2 = 'You have diamond legs, I have diamond legs, I have iron head skills, ouch...'.split('');
  text3 = 'I punch a tiger like a tiger, and a tiger like a tiger blows a wind, my palm is ecstasy, I am ecstasy...'.split('');

  animationState = false;
  hueState = false;
  flashState = false;

  constructor(private cdr: ChangeDetectorRef) {}

  getDelay(index: number, lenght: number): number {
    if (index < lenght / 2 - 2) {
      return index * 100;
    } else {
      return lenght * 100 - index * 100;
    }
  }

  animate(): void {
    this.animationState = false;
    setTimeout(() => {
      this.animationState = true;
      this.cdr.markForCheck();
    }, 1);
  }

  ngOnInit(): void {}
}
