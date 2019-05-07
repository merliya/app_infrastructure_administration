import { Pipe, PipeTransform } from "@angular/core";

/*
 * Convert number to properly formatted phone number
 * Will add default area code
 * Usage: 
 *   value | phoneNumber
 * Example:
 *   5555555555 | phoneNumber
 *   formats to: 1 (555) 555-5555
*/
@Pipe({
    name: 'phoneNumber'
})
export class PhoneNumberPipe implements PipeTransform {

    transform( value: number ): string {
        if(!value) return;
        let numberAsString: string = value.toString();
        if (numberAsString.length != 10) throw new Error('Invalid phone number');
        return `1 (${numberAsString.substring(0, 3)}) ${numberAsString.substring(3, 6)}-${numberAsString.substring(6)}`;
    }
}