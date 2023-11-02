import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';

import { PageHeaderType } from '@app/core/models/interfaces/page';
import { ThemeService } from '@store/common-store/theme.service';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'app-card-table',
  templateUrl: './card-table.component.html',
  styleUrls: ['./card-table.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardTableComponent implements OnInit, AfterViewInit {
  isOverMode$ = this.themesService.getIsOverMode();
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: '',
    breadcrumb: [],
    extra: '',
    desc: ''
  };
  list = [
    {
      id: 1,
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
      name: 'Alipay',
      desc: 'In the development process of a middle-end product, there may be different design specifications and implementation methods, but there are often many similar pages and components. These similar components will be abstracted into a set of standard specifications.'
    },
    {
      id: 2,
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png',
      name: 'Angular',
      desc: 'In the development process of a middle-end product, there may be different design specifications and implementation methods, but there are often many similar pages and components. These similar components will be abstracted into a set of standard specifications.'
    },
    {
      id: 3,
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/dURIMkkrRFpPgTuzkwnB.png',
      name: 'Ant Design',
      desc: 'In the development process of a middle-end product, there may be different design specifications and implementation methods, but there are often many similar pages and components. These similar components will be abstracted into a set of standard specifications.'
    },
    {
      id: 4,
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/sfjbOqnsXXJgNCjCzDBL.png',
      name: 'Ant Design Pro',
      desc: 'In the development process of a middle-end product, there may be different design specifications and implementation methods, but there are often many similar pages and components. These similar components will be abstracted into a set of standard specifications.'
    },
    {
      id: 5,
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/siCrBXXhmvTQGWPNLBow.png',
      name: 'Bootstrap',
      desc: 'In the development process of a middle-end product, there may be different design specifications and implementation methods, but there are often many similar pages and components. These similar components will be abstracted into a set of standard specifications.'
    },
    {
      id: 6,
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/kZzEzemZyKLKFsojXItE.png',
      name: 'React',
      desc: 'In the development process of a middle-end product, there may be different design specifications and implementation methods, but there are often many similar pages and components. These similar components will be abstracted into a set of standard specifications.'
    },
    {
      id: 7,
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ComBAopevLwENQdKWiIn.png',
      name: 'Vue',
      desc: 'In the development process of a middle-end product, there may be different design specifications and implementation methods, but there are often many similar pages and components. These similar components will be abstracted into a set of standard specifications.'
    },
    {
      id: 8,
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png',
      name: 'Webpack',
      desc: 'In the development process of a middle-end product, there may be different design specifications and implementation methods, but there are often many similar pages and components. These similar components will be abstracted into a set of standard specifications.'
    }
  ];
  @ViewChild('headerContent', { static: false }) headerContent!: TemplateRef<NzSafeAny>;

  constructor(private themesService: ThemeService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.pageHeaderInfo = {
      title: 'Card List',
      breadcrumb: ['Home', 'List Page', 'Card List'],
      desc: this.headerContent
    };
  }
}
