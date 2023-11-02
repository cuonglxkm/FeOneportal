import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { SearchListStoreService } from '@store/biz-store-service/search-list/search-list-store.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectComponent implements OnInit {
  expanded = false;
  allSelFlag = false;
  searchInfo = {
    owner: ['2', '3'],
    author: null,
    like: null
  };
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
    this.searchListService.setCurrentSearchListComponentStore('Search List (projects)');
  }

  ngOnInit(): void {}
}
