import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Params, Router, UrlSegment } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { getDeepReuseStrategyKeyFn, fnGetPathWithoutParam } from '@utils/tools';
import _ from 'lodash';

import { SimpleReuseStrategy } from './strategy/reuse-strategy';
import { TabModel } from '@app/core/models/interfaces/tab';

/*
 * Tab operation service
 * */
@Injectable({
  providedIn: 'root'
})
export class TabService {
  private tabArray$ = new BehaviorSubject<TabModel[]>([]);
  private tabArray: TabModel[] = [];
  private currSelectedIndexTab = 0;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  getTabArray$(): Observable<TabModel[]> {
    return this.tabArray$.asObservable();
  }

  setTabArray$(tabArray: TabModel[]): void {
    this.tabArray$.next(tabArray);
  }

  setTabsSourceData(): void {
    this.setTabArray$(this.tabArray);
  }

  clearTabs(): void {
    this.tabArray = [];
    this.setTabsSourceData();
  }

  addTab(param: TabModel, isNewTabDetailPage = false): void {
    this.tabArray.forEach(tab => {
      // List details operations, such as user form click details, open the details in the current tab, you can see the online example: "Query Form" and "View Button" in the form
      // title needs to be the same as the title of the user form details component route
      if (tab.title === param.title && !isNewTabDetailPage) {
        // Save the component snapshots under each tab into the tab array, and do the deduplication operation below
        tab.snapshotArray = _.uniqBy([...tab.snapshotArray, ...param.snapshotArray], item => {
          // @ts-ignore
          return item['_routerState'].url;
        });
        // When opening the details on the current page, you need to replace the path of the corresponding tab
        tab.path = param.path;
      }
    });
    if (!this.tabArray.find(value => value.path === param.path)) {
      this.tabArray.push(param);
    }
    this.setTabsSourceData();
  }

  getTabArray(): TabModel[] {
    return this.tabArray;
  }

  changeTabTitle(title: string): void {
    this.tabArray[this.getCurrentTabIndex()].title = title;
    this.setTabArray$(this.tabArray);
  }

  // Use the key to delete the cache in SimpleReuseStrategy.handlers in routing reuse
  delReuseStrategy(snapshotArray: ActivatedRouteSnapshot[]): void {
    const beDeleteKeysArray = this.getSnapshotArrayKey(snapshotArray);
    // The beDeleteKey array saves the key of the relevant route, and solves "when the current tab opens the details page", and generates "on which page (the list page or the list details page) click the close button, the clicked page (list or in the list) The details page of one) will be cleared, and the other will not be cleared" bug
    beDeleteKeysArray.forEach(item => {
      SimpleReuseStrategy.deleteRouteSnapshot(item);
    });
  }

  // According to the route snapshot cached in the tab, construct the key for route reuse For example: login{name:'zhangsan'}, so the form of key+param is cached in SimpleReuseStrategy.handlers
  getSnapshotArrayKey(activatedArray: ActivatedRouteSnapshot[]): string[] {
    const temp: string[] = [];
    activatedArray.forEach(item => {
      const key = getDeepReuseStrategyKeyFn(item);
      temp.push(key);
    });
    return temp;
  }

  // Right-click the tab to remove all tabs on the right, index is the index of the tab selected by the mouse
  delRightTab(tabPath: string, index: number): void {
    // Get the tab to be deleted
    const beDelTabArray = this.tabArray.filter((item, tabindex) => {
      return tabindex > index;
    });
    // Remove all tabs to the right of the right-clicked tab
    this.tabArray.length = index + 1;
    beDelTabArray.forEach(({ snapshotArray }) => {
      this.delReuseStrategy(snapshotArray);
    });
    // If the index of the tab selected by the right mouse button is smaller than the index of the currently displayed tab, it will be deleted together with the tab being opened
    if (index < this.currSelectedIndexTab) {
      SimpleReuseStrategy.waitDelete = getDeepReuseStrategyKeyFn(this.activatedRoute.snapshot);
      this.router.navigateByUrl(this.tabArray[index].path);
    }
    this.setTabsSourceData();
  }

  // Right click to remove all tabs on the left
  /*
  * @params index The index of the tab where the current mouse button is clicked
  * */
  delLeftTab(tabPath: string, index: number): void {
    // tab to delete
    const beDelTabArray = this.tabArray.filter((item, tabindex) => {
      return tabindex < index;
    });

    // Process the index relationship first
    if (this.currSelectedIndexTab === index) {
      this.currSelectedIndexTab = 0;
    } else if (this.currSelectedIndexTab < index) {
      // If the index of the tab clicked by the mouse is greater than the current index, you need to put the path of the current page in waitDelete
      SimpleReuseStrategy.waitDelete = getDeepReuseStrategyKeyFn(this.activatedRoute.snapshot);
      this.currSelectedIndexTab = 0;
    } else if (this.currSelectedIndexTab > index) {
      this.currSelectedIndexTab = this.currSelectedIndexTab - beDelTabArray.length;
    }
    // remaining tabs
    this.tabArray = this.tabArray.splice(beDelTabArray.length);
    beDelTabArray.forEach(({ snapshotArray }) => {
      this.delReuseStrategy(snapshotArray);
    });
    this.setTabsSourceData();
    this.router.navigateByUrl(this.tabArray[this.currSelectedIndexTab].path);
  }

  // Right-click the tab and select "Remove other tabs"
  delOtherTab(path: string, index: number): void {
    // tab to delete
    const beDelTabArray = this.tabArray.filter((item, tabindex) => {
      return tabindex !== index;
    });

    // Handle the tabs that should be displayed
    this.tabArray = [this.tabArray[index]];
    // Remove the cache of the tab to be deleted
    beDelTabArray.forEach(({ snapshotArray }) => {
      this.delReuseStrategy(snapshotArray);
    });

    // If the index of the tab selected by the mouse is not the index of the tab of the currently opened page, the key of the current page should be used as waitDelete to prevent the components displayed by the current tab from being cached after being removed
    if (index !== this.currSelectedIndexTab) {
      SimpleReuseStrategy.waitDelete = getDeepReuseStrategyKeyFn(this.activatedRoute.snapshot);
    }
    this.router.navigateByUrl(path);
    this.setTabsSourceData();
  }

  // Click the x icon on the tab label to delete the tab action, or right-click the "delete current tab" action
delTab(tab: TabModel, index: number): void {
    // remove the currently displayed tab
    if (index === this.currSelectedIndexTab) {
      const selectedTabKey = getDeepReuseStrategyKeyFn(this.activatedRoute.snapshot);
      this.tabArray.splice(index, 1);
      // handle index relationship
      this.currSelectedIndexTab = index - 1 < 0 ? 0 : index - 1;
      // jump to new tab
      this.router.navigateByUrl(this.tabArray[this.currSelectedIndexTab].path);
      // Cache the current path in reuse-strategy.ts, if it is the current path, the current route will not be cached
      SimpleReuseStrategy.waitDelete = selectedTabKey;
    } else if (index < this.currSelectedIndexTab) {
        // If the tab index selected by the mouse is smaller than the currently displayed tab index, that is, the tab selected by the mouse is on the left side of the current tab
        this.tabArray.splice(index, 1);
        this.currSelectedIndexTab = this.currSelectedIndexTab - 1;
    } else if (index > this.currSelectedIndexTab) {
        // Remove the tab to the right of the current tab
        this.tabArray.splice(index, 1);
    }
    // This operation solves the problem of saving the status of two pages, such as a list page with a detail page, and a list page and a detail page.
    // The bug in the state of the tab that the current page is closed
    // Delete the snapshot cached by the selected tab
    this.delReuseStrategy(tab.snapshotArray);
    this.setTabsSourceData();
  }

  findIndex(path: string): number {
    const current = this.tabArray.findIndex(tabItem => {
      return path === tabItem.path;
    });
    this.currSelectedIndexTab = current;
    return current;
  }

  getCurrentPathWithoutParam(urlSegmentArray: UrlSegment[], queryParam: { [key: string]: any }): string {
    const temp: string[] = [];
    // Get the value of all parameters
    const queryParamValuesArray = Object.values(queryParam);
    urlSegmentArray.forEach(urlSeqment => {
        // Remove the url fragment that represents the parameter
      if (!queryParamValuesArray.includes(urlSeqment.path)) {
        temp.push(urlSeqment.path);
      }
    });
    return `${temp.join('/')}`;
  }

  // Refresh
  refresh(): void {
    // Get the current route snapshot
    let snapshot = this.activatedRoute.snapshot;
    const key = getDeepReuseStrategyKeyFn(snapshot);
    while (snapshot.firstChild) {
      snapshot = snapshot.firstChild;
    }
    let params: Params;
    let urlWithOutParam = ''; // this is the url without parameters
    // It is a route with path parameters and has parameters
    if (Object.keys(snapshot.params).length > 0) {
      params = snapshot.params;
      // @ts-ignore
      urlWithOutParam = this.getCurrentPathWithoutParam(snapshot['_urlSegment'].segments, params);
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        SimpleReuseStrategy.deleteRouteSnapshot(key);
        this.router.navigate([urlWithOutParam, ...Object.values(params)]);
      });
    } else {
      // It is a route with query parameters, or a route without parameters
      params = snapshot.queryParams;
      const sourceUrl = this.router.url;
      const currentRoute = fnGetPathWithoutParam(sourceUrl);
      // is the query parameter
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        SimpleReuseStrategy.deleteRouteSnapshot(key);
        this.router.navigate([currentRoute], { queryParams: params });
      });
    }
  }

  getCurrentTabIndex(): number {
    return this.currSelectedIndexTab;
  }
}
