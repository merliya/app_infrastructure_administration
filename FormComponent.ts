
export interface FormComponent {
    save(forSaving: any): any;
    clear():void;
    pristineAndUntouched: boolean;
    invalid: boolean;
}