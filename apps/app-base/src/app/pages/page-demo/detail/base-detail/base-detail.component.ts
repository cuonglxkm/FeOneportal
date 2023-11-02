import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { AntTableConfig } from '@app/core/models/interfaces/table';

import { PageHeaderType } from '@app/core/models/interfaces/page';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

interface ReturnObj {
  num: string;
  name: string;
  code: string;
  unitPrice: string;
  number: string;
  price: string;
}

@Component({
  selector: 'app-base-detail',
  templateUrl: './base-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseDetailComponent implements OnInit {
  @ViewChild('returnProductTpl', { static: true }) returnProductTpl!: TemplateRef<NzSafeAny>;
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Basic Details',
    breadcrumb: ['Home', 'Detail Page', 'Basic Details']
  };
  returnTableConfig!: AntTableConfig;
  returnTableConfig2!: AntTableConfig;
  returnDataList: ReturnObj[] = [
    {
      num: '1234561',
      name: 'Mineral water 550ml',
      code: '12421432143214321',
      unitPrice: '2.00',
      number: '1',
      price: '2.00'
    },
    {
      num: '1234561',
      name: 'Mineral water 550ml',
      code: '12421432143214321',
      unitPrice: '2.00',
      number: '1',
      price: '2.00'
    },
    {
      num: '1234561',
      name: 'Mineral water 550ml',
      code: '12421432143214321',
      unitPrice: '2.00',
      number: '1',
      price: '2.00'
    },
    {
      num: '1234561',
      name: 'Mineral water 550ml',
      code: '12421432143214321',
      unitPrice: '2.00',
      number: '1',
      price: '2.00'
    },
    {
      num: '1234561',
      name: 'Mineral water 550ml',
      code: '12421432143214321',
      unitPrice: '2.00',
      number: '1',
      price: '2.00'
    }
  ];

  constructor() {}

  private initReturnTable(): void {
    this.returnTableConfig = {
      showCheckbox: false,
      headers: [
        {
          title: 'Product code',
          field: 'num',
          width: 150,
          tdTemplate: this.returnProductTpl
        },
        {
          title: 'Product name',
          width: 160,
          field: 'name'
        },
        {
          title: 'Commodity barcode',
          width: 150,
          field: 'code'
        },
        {
          title: 'Unit Price',
          width: 150,
          field: 'unitPrice'
        },
        {
          title: 'Quantity (pieces)',
          width: 150,
          field: 'number'
        },
        {
          title: 'Amount',
          field: 'price'
        }
      ],
      total: 0,
      loading: false,
      pageSize: 10,
      pageIndex: 1
    };
    this.returnTableConfig2 = {
      showCheckbox: false,
      headers: [
        {
          title: 'Product code',
          field: 'num',
          width: 150,
          tdTemplate: this.returnProductTpl
        },
        {
          title: 'Product name',
          width: 160,
          field: 'name'
        },
        {
          title: 'Commodity barcode',
          width: 150,
          field: 'code'
        },
        {
          title: 'Unit Price',
          width: 150,
          field: 'unitPrice'
        },
        {
          title: 'Quantity (pieces)',
          width: 150,
          field: 'number'
        },
        {
          title: 'Amount',
          field: 'price'
        }
      ],
      total: 0,
      loading: false,
      pageSize: 10,
      pageIndex: 1
    };
  }

  ngOnInit(): void {
    this.initReturnTable();
  }
}
