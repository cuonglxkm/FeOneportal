import { DragDrop, DragRef } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';

import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { ModalTypes, NzModalService } from 'ng-zorro-antd/modal';

/**
 * Dialog Drag Service
 */
@Injectable()
export class ModalDragService {
  static readonly DRAG_CLS_PREFIX = 'NZ-MODAL-WRAP-CLS-';
  constructor(public modal: NzModalService, public dragDrop: DragDrop) {}

  /**
   * Create a drag handle
   *
   * @param wrapCls class name
   * @param nzModalType dialog box type
   */
  createDragHandler<T = NzSafeAny>(wrapCls: string, nzModalType?: ModalTypes): DragRef<T> {
    const wrapElement = document.querySelector<HTMLDivElement>(`.${wrapCls}`)!;
    const rootElement = wrapElement.querySelector<HTMLDivElement>(`.ant-modal-content`)!;
    const handle = nzModalType === 'confirm' ? rootElement.querySelector<HTMLDivElement>('.ant-modal-body')! : rootElement.querySelector<HTMLDivElement>('.ant-modal-header')!;
    this.fixedWrapElementStyle(wrapElement);
    this.setMaxZIndex(rootElement, wrapElement);
    return this.dragDrop.createDrag(handle).withHandles([handle]).withRootElement(rootElement);
  }

  /**
   * Get random class name
   */
  getRandomCls() {
    return ModalDragService.DRAG_CLS_PREFIX + Date.now() + Math.random().toString().replace('0.', '');
  }

  /**
   * Solve the wrap style, set the mouse can penetrate
   *
   * @param wrapElement
   * @protected
   */
  protected fixedWrapElementStyle(wrapElement: HTMLElement): void {
    wrapElement.style.pointerEvents = 'none';
  }

  /**
   * When the current dialog box is clicked, set the z-index of the current dialog box to the maximum
   *
   * @param rootElement current dialog
   * @param wrapElement z-index container to be modified
   * @protected
   */
  protected setMaxZIndex(rootElement: HTMLElement, wrapElement: HTMLElement): void {
    rootElement.addEventListener(
      'mousedown',
      () => {
        const maxZIndex = this.getModalMaxZIndex(wrapElement);
        if (maxZIndex) {
          wrapElement.style.zIndex = `${maxZIndex + 1}`;
        }
      },
      false
    );
  }

  /**
   * Get the maximum value of all dialog boxes, and determine whether it needs to be modified
   *
   * @param wrapElement z-index container to be modified
   */
  protected getModalMaxZIndex(wrapElement: HTMLElement): number | null {
    const wrapZIndex = this.getZIndex(wrapElement);
    const maxZIndex = this.modal.openModals.reduce<number>((prev, modal) => {
      // @ts-ignore
      const element = (modal.containerInstance.host || modal.containerInstance.elementRef).nativeElement;
      if (wrapElement === element) {
        return prev;
      }
      const zIndex = this.getZIndex(element);
      return zIndex > prev ? zIndex : prev;
    }, 0);
    return maxZIndex >= wrapZIndex ? maxZIndex : null;
  }

  protected getZIndex(element: HTMLElement): number {
    return +getComputedStyle(element, null).zIndex;
  }
}
