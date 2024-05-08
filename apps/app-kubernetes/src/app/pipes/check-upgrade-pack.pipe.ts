import { Pipe, PipeTransform } from '@angular/core';
import { KubernetesConstant } from '../constants/kubernetes.constant';
import { PackModel } from '../model/pack.model';

@Pipe({
  name: 'checkUpgradePack'
})
export class CheckUpgradePackPipe implements PipeTransform {

  transform(currentPack: PackModel, checkPack: PackModel): boolean {
    if (checkPack.ram <= currentPack.ram
      || checkPack.cpu <= currentPack.cpu
      || checkPack.rootStorage <= currentPack.rootStorage) {
        return false;
    }

    return true;
  }

}
