import { ChangeDetectorRef, inject, ViewRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperatorFunction, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/*https://github.com/angular/angular/issues/46119*/
/* Only V14 version can be used, below V14 must use the service provided by src/app/core/services/common/destory.service.ts
  * destroy$=untilDestroyedFn();
  *
  * someObserve.pipe(this.destroy$).subscribe()
  * */
const untilDestroyedFn = function untilDestroyed(): OperatorFunction<any, any> {
  const subject = new Subject<void>();
  const viewRef = inject(ChangeDetectorRef) as ViewRef;

  viewRef.onDestroy(() => {
    subject.next();
    subject.complete();
  });

  return takeUntil(subject.asObservable());
};

// Get route parameters
const getRouteParamFn = function getRouteParam(key: string): string {
  return inject(ActivatedRoute).snapshot.params[key];
};

export { untilDestroyedFn, getRouteParamFn };
