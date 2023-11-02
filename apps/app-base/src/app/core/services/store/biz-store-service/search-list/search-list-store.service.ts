import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

type componentName = 'Search List (article)' | 'Search List (projects)' | 'Search List (application)';

// This is the store that caches the search list, which belongs to the business store
@Injectable({
  providedIn: 'root'
})
export class SearchListStoreService {
  private SearchListComponentStore = new Subject<componentName>();

  constructor() {}

  setCurrentSearchListComponentStore(componentName: componentName): void {
    this.SearchListComponentStore.next(componentName);
  }

  getCurrentSearchListComponentStore(): Observable<componentName> {
    return this.SearchListComponentStore.asObservable();
  }
}
