// import { Component, HostListener, Input, OnInit } from '@angular/core';
// import { LoggingService } from '../service/log.service';
// import { finalize } from 'rxjs';

// interface Log {
//   username: string;
//   action: string;
//   resource: string;
//   note: string;
//   timestamp: Date;
// }

// @Component({
//   selector: 'one-portal-logging',
//   templateUrl: './logging.component.html',
//   styleUrls: ['./logging.component.css'],
// })
// export class LoggingComponent implements OnInit{
//   // @Input() service: AppDetail | any;
//   username: string | any;
//   // resource: string;
//   resource: string | any;
//   action: string | any;
//   date = null;
//   pageSize: number | any;
//   pageIndex: number | any;
//   total: number | any;
//   isEndOfPage = false;
//   windowScrolled: boolean | undefined;
//   isEndOfList: boolean | undefined;

//   fromDate: number | any;
//   toDate: number | any;

//   listOfLogs: Log[] = [];

//   dateFormat = 'dd/MM/yyyy';

//   actions = {
//     CREATE_DATABASE: 'Thêm database',
//     DELETE_DATABASE: 'Xoá database',
//     CREATE_COLLECTION: 'Thêm collection',
//     DELETE_COLLECTION: 'Xoá collection',
//   };

//   constructor(private log: LoggingService) {}
//   @HostListener('window:scroll', ['$event'])
//   onWindowScroll() {
//     // auto load when user scroll to end of page
//     const pos =
//       (document.documentElement.scrollTop || document.body.scrollTop) +
//       document.documentElement.offsetHeight;
//     const max = document.documentElement.scrollHeight;
//     if (pos == max) {
//       if (this.pageSize < this.total) {
//         this.isEndOfList = false;
//         this.isEndOfPage = true;
//         this.pageSize += 50;
//         this.onSearch();
//       } else {
//         this.isEndOfList = true;
//       }
//     }

//     // check user scroll
//     if (document.documentElement.scrollTop || document.body.scrollTop > 100) {
//       this.windowScrolled = true;
//     } else if (
//       document.documentElement.scrollTop ||
//       document.body.scrollTop < 10
//     ) {
//       this.windowScrolled = false;
//     }
//   }

//   scrollToTop() {
//     (function smoothscroll() {
//       const currentScroll =
//         document.documentElement.scrollTop || document.body.scrollTop;
//       if (currentScroll > 0) {
//         window.requestAnimationFrame(smoothscroll);
//         window.scrollTo(0, currentScroll - currentScroll / 8);
//       }
//     })();
//   }
//   ngOnInit(): void {
//     this.listOfLogs = [];
//     this.username = '';
//     this.resource = '';
//     this.action = '';
//     this.pageIndex = 1;
//     this.pageSize = 20;
//     this.total = 0;
//     this.onSearch();
//   }

//   onSearch() {
//     this.log
//       .searchLogs(
//         this.username.trim(),
//         this.resource,
//         this.action,
//         this.fromDate,
//         this.toDate,
//         this.service.service_order_code,
//         this.pageIndex,
//         this.pageSize
//       )
//       .pipe(finalize(() => (this.isEndOfPage = false)))
//       .subscribe((r: any) => {
//         const tmp: [] = r.content;
//         this.listOfLogs = [...tmp];
//         this.total = r.total;
//       });
//   }

//   onChangeDate(result: Date[]) {
//     const from: Date = result[0];
//     const to: Date = result[1];

//     this.fromDate = from?.setHours(0, 0, 0, 0);
//     this.toDate = to?.setHours(0, 0, 0, 0);
//   }

//   onQueryParamsChange(event: any) {
//     this.pageIndex = event.pageIndex;
//     this.pageSize = event.pageSize;

//     this.onSearch();
//   }
// }
