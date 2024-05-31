import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keys'
})
export class KeysPipe implements PipeTransform {
  transform(value: { [key: string]: any }): string[] {
    console.log(Object.keys(value));
    return Object.keys(value);
  }
}
