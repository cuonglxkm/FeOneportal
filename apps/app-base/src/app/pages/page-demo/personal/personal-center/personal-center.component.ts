import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';

import { AdComponent, DynamicComponent } from '@app/core/models/interfaces/types';
import { AdDirective } from '@shared/directives/ad.directive';

import { ApplicationComponent } from './application/application.component';
import { ArticleComponent } from './article/article.component';
import { ProjectsComponent } from './projects/projects.component';

interface TabInterface {
  label: string;
  component: DynamicComponent;
}

@Component({
  selector: 'app-personal-center',
  templateUrl: './personal-center.component.html',
  styleUrls: ['./personal-center.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalCenterComponent implements OnInit {
  tagArray: string[] = ["Creative", "Focused on Design", "Long-legged", "Sichuan Girl", "Inclusive"];
  inputVisible = false;
  @ViewChild('inputElement', { static: false }) inputElement?: ElementRef;
  inputValue = '';
  tabData: TabInterface[] = [
    { label: 'Articles(8)', component: new DynamicComponent(ArticleComponent, {}) },
    { label: 'Application(8)', component: new DynamicComponent(ApplicationComponent, {}) },
    { label: 'Project(8)', component: new DynamicComponent(ProjectsComponent, {}) }
  ];

  @ViewChild(AdDirective, { static: true }) adHost!: AdDirective;

  constructor() {}

  to(adItem: TabInterface): void {
    const viewContainerRef = this.adHost.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent<AdComponent>(adItem.component.component);
    componentRef.instance.data = adItem.component.data;
  }

  handleInputConfirm(): void {
    if (this.inputValue && this.tagArray.indexOf(this.inputValue) === -1) {
      this.tagArray = [...this.tagArray, this.inputValue];
    }
    this.inputValue = '';
    this.inputVisible = false;
  }

  showInput(): void {
    this.inputVisible = true;
    setTimeout(() => {
      this.inputElement?.nativeElement.focus();
    }, 10);
  }

  ngOnInit(): void {
    this.to(this.tabData[0]);
  }
}
