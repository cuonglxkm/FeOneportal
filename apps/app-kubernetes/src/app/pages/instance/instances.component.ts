import { Component, OnInit } from '@angular/core';
import { ClusterService } from '../../services/cluster.service';
import { Subject, debounceTime, distinctUntilChanged, map } from 'rxjs';

@Component({
  selector: 'cluster-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.css'],
})
export class InstancesComponent implements OnInit {

  keySearch: string;
  serviceOrderCode: string;
  pageSize: number;
  pageIndex: number;
  total: number;

  listOfInstances: [];

  changeKeySearch = new Subject<string>();

  constructor(
    private clusterService: ClusterService
  ) {
    this.listOfInstances = [];
    this.keySearch = '';
    this.pageIndex = 1;
    this.pageSize = 10;
    this.total = 0;
  }

  ngOnInit(): void {
    this.changeKeySearch.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      map(key => key.trim())
    ).subscribe((key: string) => {
      this.keySearch = key;
      this.searchInstances();
    });
  }

  searchInstances() {}

  syncInstances() {}

  onQueryParamsChange(event: any) {
    if (event) {
      this.pageSize = event.pageSize;
      this.pageIndex = event.pageIndex;

      this.searchInstances();
    }
  }

}
