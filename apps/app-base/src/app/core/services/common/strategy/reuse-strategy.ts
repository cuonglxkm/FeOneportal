import { DOCUMENT } from '@angular/common';
import { inject, Inject } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { ReuseComponentRef } from '@app/core/models/interfaces/reuse-component';

import { ScrollService } from '@core/services/common/scroll.service';
import { ThemeService } from '@store/common-store/theme.service';
import { fnGetReuseStrategyKeyFn, getDeepReuseStrategyKeyFn } from '@utils/tools';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

/* Routing multiplexing*/
export class SimpleReuseStrategy implements RouteReuseStrategy {
  // Cache the map of each component
  static handlers: { [key: string]: NzSafeAny } = {};
  // Cache the scroll position of each page, why not put it in the handlers, because when the route leaves, the route reuse causes the current page as the key to be null
  static scrollHandlers: { [key: string]: NzSafeAny } = {};

  // The purpose of this parameter is to click the delete button in the current tab. Although the tab is closed, when the route leaves, the components of the closed tab will still be cached.
  // Use this parameter to record whether the current route needs to be cached
  public static waitDelete: string | null;

  // Whether there are multiple tabs, if there are no multiple tabs, no routing cache will be performed
  isShowTab$ = inject(ThemeService).getThemesMode();

  static #activatedRoute: ActivatedRoute;
  public static deleteRouteSnapshot(key: string): void {
    if (SimpleReuseStrategy.handlers[key]) {
      if (SimpleReuseStrategy.handlers[key].componentRef) {
        SimpleReuseStrategy.handlers[key].componentRef.destroy();
      }
      delete SimpleReuseStrategy.handlers[key];
      delete SimpleReuseStrategy.scrollHandlers[key];
    }
  }

  // Delete all caches, it needs to be used in operations such as logging out and not using multi-label
  public static deleteAllRouteSnapshot(route: ActivatedRouteSnapshot): Promise<void> {
    return new Promise(resolve => {
      Object.keys(SimpleReuseStrategy.handlers).forEach(key => {
        SimpleReuseStrategy.deleteRouteSnapshot(key);
      });
      SimpleReuseStrategy.waitDelete = getDeepReuseStrategyKeyFn(route);
      resolve();
    });
  }

  constructor(@Inject(DOCUMENT) private doc: Document, private scrollService: ScrollService, private activatedRoute: ActivatedRoute) {}

  // Whether to allow multiplexing routes
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Whether to display multiple tabs, if not, route reuse will not be performedÏ
    let isShowTab = false;
    this.isShowTab$.subscribe(res => {
      isShowTab = res.isShowTab;
    });
    return route.data['shouldDetach'] !== 'no' && isShowTab;
  }

  // Triggered when the route leaves, store the route
  store(route: ActivatedRouteSnapshot, handle: NzSafeAny): void {
    if (route.data['shouldDetach'] === 'no') {
      return;
    }
    const key = fnGetReuseStrategyKeyFn(route);
    // If the current route is to be deleted, the snapshot will not be stored
    if (SimpleReuseStrategy.waitDelete === key) {
      this.runHook('_onReuseDestroy', handle.componentRef);
      handle.componentRef.destroy();
      SimpleReuseStrategy.waitDelete = null;
      delete SimpleReuseStrategy.scrollHandlers[key];
      return;
    }

    // Cache the scroll position of the current page when leaving the route
    // By default, keepScroll is required. If keepScroll is not required, add the needKeepScroll:no attribute
    const innerScrollContainer = [];
    if (route.data['needKeepScroll'] !== 'no') {
      const scrollContain = route.data['scrollContain'] ?? [];
      scrollContain.forEach((item: string) => {
        const el = this.doc.querySelector(item)!;
        if (el) {
          const postion = this.scrollService.getScrollPosition(el);
          innerScrollContainer.push({ [item]: postion });
        }
      });
      innerScrollContainer.push({ window: this.scrollService.getScrollPosition() });
    }

    SimpleReuseStrategy.scrollHandlers[key] = { scroll: innerScrollContainer };
    SimpleReuseStrategy.handlers[key] = handle;

    if (handle && handle.componentRef) {
      this.runHook('_onReuseDestroy', handle.componentRef);
    }
  }

  // Whether to allow restore routes
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const key = fnGetReuseStrategyKeyFn(route);
    return !!key && !!SimpleReuseStrategy.handlers[key];
  }

  // Get storage route
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    const key = fnGetReuseStrategyKeyFn(route);
    return !key ? null : SimpleReuseStrategy.handlers[key];
  }

  // Enter the route trigger, multiplex the route when it is the same route
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    const futureKey = fnGetReuseStrategyKeyFn(future);
    const currKey = fnGetReuseStrategyKeyFn(curr);
    if (!!futureKey && SimpleReuseStrategy.handlers[futureKey]) {
      this.runHook('_onReuseInit', SimpleReuseStrategy.handlers[futureKey].componentRef);
    }

    const result = futureKey === currKey;
    // Lazy loading can't read data, drill down to the lowest level of routing through this method
    while (future.firstChild) {
      future = future.firstChild;
    }
    // The reacquisition is because the future has changed in the above while loop
    const scrollFutureKey = fnGetReuseStrategyKeyFn(future);
    if (!!scrollFutureKey && SimpleReuseStrategy.scrollHandlers[scrollFutureKey]) {
      SimpleReuseStrategy.scrollHandlers[scrollFutureKey].scroll.forEach((elOptionItem: { [key: string]: [number, number] }) => {
        Object.keys(elOptionItem).forEach(element => {
          setTimeout(() => {
            this.scrollService.scrollToPosition(this.doc.querySelector(element), elOptionItem[element]);
          }, 1);
        });
      });
    }
    return result;
  }

  runHook(method: ReuseHookTypes, comp: ReuseComponentRef): void {
    const compThis = comp.instance;
    if (comp == null || !compThis) {
      return;
    }
    const fn = compThis[method];
    if (typeof fn !== 'function') {
      return;
    }
    (fn as () => void).call(compThis);
  }
}

export type ReuseHookTypes = '_onReuseInit' | '_onReuseDestroy';
