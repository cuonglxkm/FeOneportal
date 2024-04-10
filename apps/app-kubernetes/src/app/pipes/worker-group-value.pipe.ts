import { Pipe, PipeTransform } from '@angular/core';
import { FormArray } from '@angular/forms';

@Pipe({
  name: 'getValueInForm'
})
export class GetWorkerGroupValue implements PipeTransform {

  transform(controlName: string, listOfWokerGroupForm: FormArray, index: number): any {
    if (controlName == 'autoHealing') console.log(listOfWokerGroupForm.at(index).get(controlName).value);
    return listOfWokerGroupForm?.at(index).get(controlName).value;
  }

}
