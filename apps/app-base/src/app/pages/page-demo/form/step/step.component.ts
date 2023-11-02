import { BreakpointObserver } from '@angular/cdk/layout';
import { ComponentPortal, CdkPortalOutletAttachedRef, Portal, ComponentType } from '@angular/cdk/portal';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentRef, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { StepThreeComponent } from '@app/pages/page-demo/form/step/step-three/step-three.component';
import { PageHeaderType } from '@app/core/models/interfaces/page';

import { StepOneComponent } from './step-one/step-one.component';
import { StepTwoComponent } from './step-two/step-two.component';

type comp = StepOneComponent | StepTwoComponent | StepThreeComponent;

enum StepEnum {
  One,
  Two,
  Three
}

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedPortal!: Portal<any>;
  stepDirection: 'horizontal' | 'vertical' = 'horizontal';
  pageHeaderInfo: Partial<PageHeaderType> = {
    title: 'Step Form',
    desc: 'Breaking down a lengthy or unfamiliar form task into multiple steps that the user is then guided through.',
    breadcrumb: ['Home', 'Form', 'Step Form']
  };
  currentStep = 1;
  stepComponentArray: Array<ComponentType<comp>> = [StepOneComponent, StepTwoComponent, StepThreeComponent];
  componentPortal?: ComponentPortal<comp>;

  constructor(private fb: FormBuilder, private breakpointObserver: BreakpointObserver, private cdr: ChangeDetectorRef) {}

  go(step: StepEnum, ref: CdkPortalOutletAttachedRef, currentStepNum: number): void {
    this.currentStep = currentStepNum;
    ref!.destroy();
    this.goStep(step);
    // ngZoneEventCoalescing, ngZoneRunCoalescing example, please see main.ts
    this.cdr.detectChanges();
  }

  // This is done entirely to demonstrate the simple usage of the CDK portal
  initComponent(ref: CdkPortalOutletAttachedRef): void {
    if (ref instanceof ComponentRef) {
      if (ref.instance instanceof StepOneComponent) {
        ref.instance.stepDirection = this.stepDirection;
        ref.instance.next.subscribe(() => {
          this.go(StepEnum.Two, ref, this.currentStep + 1);
        });
      }
      if (ref.instance instanceof StepTwoComponent) {
        ref.instance.previous.subscribe(() => {
          this.go(StepEnum.One, ref, this.currentStep - 1);
        });
        ref.instance.next.subscribe(() => {
          this.go(StepEnum.Three, ref, this.currentStep + 1);
        });
      }
      if (ref.instance instanceof StepThreeComponent) {
        ref.instance.stepDirection = this.stepDirection;
        ref.instance.next.subscribe(() => {
          this.go(StepEnum.One, ref, 1);
        });
      }
    }
  }

  ngOnInit(): void {
    this.breakpointObserver.observe(['(max-width: 770px)']).subscribe(result => {
      let tempDir: 'vertical' | 'horizontal' = result.matches ? 'vertical' : 'horizontal';
      if (tempDir !== this.stepDirection) {
        this.stepDirection = tempDir;
        this.cdr.markForCheck();
      }
    });
  }

  goStep(step: number): void {
    this.componentPortal = new ComponentPortal(this.stepComponentArray[step]);
    this.selectedPortal = this.componentPortal;
  }

  ngAfterViewInit(): void {
    this.goStep(StepEnum.One);
  }

  ngOnDestroy(): void {
    console.log('fenbu');
  }
}
