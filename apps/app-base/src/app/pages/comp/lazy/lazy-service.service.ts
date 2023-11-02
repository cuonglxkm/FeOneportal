import { ChangeDetectorRef, Injectable, SimpleChange } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { AdDirective } from '@shared/directives/ad.directive';
import { LazySelPeopleEnum } from '@app/core/models/enum';

@Injectable()
export class LazyServiceService {
  _adHost!: AdDirective;
  get adHost(): AdDirective {
    return this._adHost;
  }

  set adHost(value: AdDirective) {
    this._adHost = value;
  }

  constructor(public cdr: ChangeDetectorRef) {}

  async create(selPerson: LazySelPeopleEnum = LazySelPeopleEnum.YiLin): Promise<void> {
    await this.lazyLoadCard(selPerson);
    this.cdr.detectChanges();
  }

  async lazyLoadCard(selPerson: LazySelPeopleEnum = LazySelPeopleEnum.YiLin): Promise<void> {
    const viewContainerRef = this._adHost.viewContainerRef;
    const { LazyTargCompComponent } = await import('./lazy-targ-comp/lazy-targ-comp.component');
    const componentRef = viewContainerRef.createComponent(LazyTargCompComponent);
    // Using the setInput api can be managed by the onchange hook
    componentRef.setInput('purChoosePeople', selPerson);
    componentRef.instance.currentPeople.pipe(takeUntil(componentRef.instance.destroy$)).subscribe(() => {
      this.create(componentRef.instance.purChoosePeople);
    });
    // Implement the OnChange hook
    // (instance as any).ngOnChanges({
    //   purChoosePeople: new SimpleChange(null, instance.purChoosePeople, true)
    // });
  }
}
