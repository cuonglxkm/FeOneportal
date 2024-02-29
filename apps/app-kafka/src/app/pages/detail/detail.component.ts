import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'one-portal-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
})
export class DetailComponent implements OnInit {
  selectedIndex = 0;
  serviceOrderCode: string;

  constructor(
    private _activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this._activatedRoute.queryParams
      .subscribe(
        params => {
          if (params['tab']) {
            this.selectedIndex = params['tab'];
          }
        }
      );
    this.selectedIndex = +localStorage.getItem('selectedTabIndex') || 0;

    this._activatedRoute.params.subscribe((params) => {
      this.serviceOrderCode = params.id;
    });
  }

  setTransactionTabIndex(e: number) {
    this.selectedIndex = e;
    localStorage.setItem('selectedTabIndex', e.toString());
  }


}
