import { TemplateRef } from "@angular/core";
import { NzSafeAny } from "ng-zorro-antd/core/types";

export interface TableHeader {
    title: string; // Header name
    field?: string; // Field
    pipe?: string; // Pipe
    showSort?: boolean; // Whether to display sorting
    sortDir?: undefined | 'asc' | 'desc'; // sorting direction
    width?: number; // Cell width
    thTemplate?: TemplateRef<NzSafeAny>; // th cell template
    tdTemplate?: TemplateRef<NzSafeAny>; // td cell template
    fixed?: boolean; // Whether to fix the cell (only valid if it is fixed continuously from the leftmost or rightmost)
    fixedDir?: 'left' | 'right'; // fixed on the left or right, need to be used with fixed
    notNeedEllipsis?: boolean; // true when no...
    tdClassList?: string[]; // Specify the class for the td cell (the class in the parent component must be prefixed with /deep/ to take effect for the child component)
    thClassList?: string[]; // Specify the class for the th cell (the class in the parent component must be prefixed with /deep/ to take effect on the child component)
    show?: boolean; // Whether to display the column, false: not to display, others: to display
    tdClassFn?: (data: any, index: number) => string[];
    thClassFn?: (data: any) => string[];
}

export interface AntTableConfig {
    needNoScroll?: boolean; //Whether the list needs a scroll bar
    xScroll?: number; // list horizontal scroll bar
    yScroll?: number; // list vertical scroll bar
    virtualItemSize?: number; //Height of each column during virtual scrolling, same as cdk itemSize
    showCheckbox?: boolean; // If checkBox is required, showCheckbox=true is required, and [checkedCashArrayFromComment]="cashArray" is passed in when using the app-ant-table component, cashArray is an array defined by the business component itself, and it needs to be in the table The data has an id attribute
    pageIndex: number; // The current page number, (two-way binding with the page number in the page)
    pageSize: number; // The number of data items displayed on each page (two-way binding with pageSize in the page)
    total: number; // The total amount of data, used to calculate paging (should be obtained from the backend interface)
    loading: boolean; // Whether to display the form loading
    headers: TableHeader[]; // Column settings
}

export interface SortFile {
    fileName: string;
    sortDir: undefined | 'desc' | 'asc';
}
