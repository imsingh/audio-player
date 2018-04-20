import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "trimName"
})
export class TrimNamePipe implements PipeTransform {
  transform(value: string, ...args) {
    let result = value;
    result = result.split("/").pop();
    console.log(result);
    return result;
  }
}
