import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { SearchListStoreService } from '@store/biz-store-service/search-list/search-list-store.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleComponent implements OnInit {
  expanded = false;
  searchInfo = {
    owner: ['1', '2'],
    author: null,
    like: null
  };
  allSelFlag = false;
  tagArray = [
    { name: 'Category 1', isChecked: false },
    { name: 'Category 2', isChecked: false },
    { name: 'Category 3', isChecked: false },
    { name: 'Category 4', isChecked: false },
    { name: 'Category 5', isChecked: false },
    { name: 'Category 6', isChecked: false },
    { name: 'Category 7', isChecked: false },
    { name: 'Category 8', isChecked: false },
    { name: 'Category 9', isChecked: false },
    { name: 'Category 10', isChecked: false },
    { name: 'Category 11', isChecked: false },
    { name: 'Category 12', isChecked: false }
  ];

  constructor(private searchListService: SearchListStoreService) {
    this._onReuseInit();
  }

  allSel(): void {
    this.allSelFlag = !this.allSelFlag;
    this.tagArray.forEach(item => {
      item.isChecked = this.allSelFlag;
    });
    this.tagArray = [...this.tagArray];
  }

  _onReuseInit(): void {
    this.searchListService.setCurrentSearchListComponentStore('Search List (article)');
  }

  ngOnInit(): void {}
}
