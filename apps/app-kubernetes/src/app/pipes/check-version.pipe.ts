import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkUpgradeVersion'
})
export class CheckUpgradeVersionPipe implements PipeTransform {

  transform(version: string, listOfAvailableVersion: string[]): boolean {
    if (version && listOfAvailableVersion) return !listOfAvailableVersion.includes(version);
  }

}
