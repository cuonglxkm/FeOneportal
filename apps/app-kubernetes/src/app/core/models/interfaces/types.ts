/*
 * common interface
 * */

import { Type } from '@angular/core';

import { NzSafeAny } from 'ng-zorro-antd/core/types';

// dynamic component
export class DynamicComponent {
  constructor(public component: Type<NzSafeAny>, public data: NzSafeAny) { }
}

// select drop down
export interface OptionsInterface {
  value: number | string;
  label: string;
}

// list search
export interface SearchCommonVO<T> {
  pageNum: number;
  pageSize: number;
  filters?: T;
}

// pagination
export interface PageInfo<T> {
  pageNum: number;
  pageSize: number;
  size?: number;
  orderBy?: string;
  startRow?: number;
  endRow?: number;
  total: number;
  pages?: number;
  list: T[];
  firstPage?: number;
  prePage?: number;
  nextPage?: number;
  lastPage?: number;
  isFirstPage?: boolean;
  isLastPage?: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  navigatePages?: number;
  navigatepageNums?: number[];
}

// dynamic component
export interface AdComponent {
  data: NzSafeAny;
}

// cascaded selection data structure
export interface CascaderOption {
  value: number | string;
  label: string;
  children?: CascaderOption[];
  isLeaf?: boolean;
}

/*
 * Menu
 * */

export interface Menu {
  id: number | string;
  fatherId: number | string;
  path: string;
  menuName: string;
  menuType: 'C' | 'F'; // c: menu, f button
  icon?: string; // If showIcon is false, set this as the leftmost icon in the search window
  alIcon?: string; // If showIcon is false, set this as the leftmost icon in the search window
  open?: boolean;
  selected?: boolean; // is selected
  children?: Menu[];
  code?: string; // permission code
  newLinkFlag?: 0 | 1; // Whether it is a new page
}
/*
 * Menu Admin
 * */

export interface MenuAdmin {
  id: string;
  fatherId: number | string;
  path: string;
  menuName: string;
  menuType: 'C' | 'F'; // c: menu, f button
  icon?: string; // If showIcon is false, set this as the leftmost icon in the search window
  alIcon?: string; // If showIcon is false, set this as the leftmost icon in the search window
  open?: boolean;
  selected?: boolean; // is selected
  children?: Menu[];
  code?: string; // permission code
  newLinkFlag?: 0 | 1; // Whether it is a new page
}
