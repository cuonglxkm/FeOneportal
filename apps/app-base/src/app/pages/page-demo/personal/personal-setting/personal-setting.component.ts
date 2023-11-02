import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef } from '@angular/core';

import { AdComponent, DynamicComponent } from '@app/core/models/interfaces/types';
import { AdDirective } from '@shared/directives/ad.directive';
import { NzMenuModeType } from 'ng-zorro-antd/menu/menu.types';

import { BaseComponent } from './base/base.component';
import { BindComponent } from './bind/bind.component';
import { NoticeComponent } from './notice/notice.component';
import { SafeComponent } from './safe/safe.component';

interface TabInterface {
  key: string;
  component: DynamicComponent;
}

@Component({
  selector: 'app-personal-setting',
  templateUrl: './personal-setting.component.html',
  styleUrls: ['./personal-setting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalSettingComponent implements OnInit {
  @ViewChild(AdDirective, { static: true }) adHost!: AdDirective;
  tabModel: NzMenuModeType = 'inline';
  settingComponent: TabInterface[] = [
    { key: 'base', component: new DynamicComponent(BaseComponent, { label: 'Basic Settings' }) },
    { key: 'safe', component: new DynamicComponent(SafeComponent, { label: 'Safe Settings' }) },
    { key: 'bind', component: new DynamicComponent(BindComponent, { label: 'Account Binding' }) },
    { key: 'notice', component: new DynamicComponent(NoticeComponent, { label: 'New message notification' }) }
  ];
  menus: Array<{ key: string; title: string; selected?: boolean }> = [
    {
      key: 'base',
      title: 'Basic Settings',
      selected: true
    },
    {
      key: 'safe',
      title: 'Safe Settings',
      selected: false
    },
    {
      selected: false,
      key: 'bind',
      title: 'Account Binding'
    },
    {
      selected: false,
      key: 'notice',
      title: 'New message notification'
    }
  ];
  currentTitle: string = this.menus[0].title;

  constructor(private breakpointObserver: BreakpointObserver, private cdr: ChangeDetectorRef) {}

  to(item: { key: string; title: string; selected?: boolean }): void {
    const selMenu = this.settingComponent.find(({ key }) => {
      return key === item.key;
    });
    this.currentTitle = selMenu!.component.data.label;
    const viewContainerRef = this.adHost.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent<AdComponent>(selMenu!.component.component);
    componentRef.instance.data = selMenu!.component.data;
  }

  obBreakPoint(): void {
    this.breakpointObserver.observe(['(max-width: 767px)']).subscribe(result => {
      this.tabModel = result.matches ? 'horizontal' : 'inline';
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.to(this.menus[0]);
    this.obBreakPoint();
  }
}
