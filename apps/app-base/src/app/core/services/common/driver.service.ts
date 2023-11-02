import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

import Driver from 'driver.js';
/*
 * https://madewith.cn/766
 * Setup
 * */
@Injectable({
  providedIn: 'root'
})
export class DriverService {
  constructor(@Inject(DOCUMENT) private doc: Document) {}

  load(): void {
    setTimeout(() => {
      const driver = new Driver({
        animate: false,
        allowClose: true,
        doneBtnText: 'Complete',
        closeBtnText: 'Close',
        nextBtnText: 'Next',
        prevBtnText: 'Prev',
        onHighlightStarted: () => {
          this.doc.body.style.cssText = 'overflow:hidden';
        },
        onReset: () => {
          this.doc.body.style.cssText = '';
        }
      });
      driver.defineSteps([
        {
          element: '#menuNav',
          popover: {
            title: 'Menu',
            description: 'This is the menu',
            position: 'right-center'
          }
        },
        {
          element: '#drawer-handle',
          popover: {
            title: 'Theme Settings Button',
            description: 'Click to expand and set the theme, you can drag up and down',
            position: 'left'
          }
        },
        {
          element: '#tools',
          popover: {
            title: 'Toolbar',
            description: 'Lock screen, search menu, full screen, notification message, logout, multilingual',
            position: 'bottom'
          }
        },
        {
          element: '#chats',
          popover: {
            title: 'Contact Administrator',
            description: 'Contact the administrator',
            position: 'top'
          }
        },
        {
          element: '#trigger',
          popover: {
            title: 'Collapse menu',
            description: 'menu collapse',
           position: 'bottom'
          }
        },
        {
          element: '#multi-tab',
          popover: {
            title: 'multi-label',
            description: 'Click the right mouse button on a single label to expand multiple options. After exceeding the screen, scroll the mouse wheel to scroll through the tabs',
            position: 'bottom'
          }
        },
        {
          element: '#multi-tab2',
          popover: {
            title: 'multi-label',
            description: 'Click the right mouse button on a single label to expand multiple options. After exceeding the screen, scroll the mouse wheel to scroll through the tabs',
            position: 'bottom'
          }
        }
      ]);
      driver.start();
    }, 500);
  }
}
