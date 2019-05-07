import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment-timezone';
import { MessageService } from 'primeng/components/common/messageservice';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FormComponent } from 'src/app/shared/FormComponent';
import { Delegation, Employee, Person } from '../employees.model';
import { EmployeesService } from '../employees.service';
import { Team } from 'src/app/team-management/team-management.model';

@Component({
  selector: 'admin-employee-task-delegation',
  templateUrl: './task-delegation.component.html',
  styleUrls: ['./task-delegation.component.scss']
})
export class TaskDelegationComponent implements OnInit,  OnChanges, FormComponent {

  @Input()
  delegations: Delegation[] = [];

  @Input()
  fullscreen: boolean = false;

  @Input()
  teams: Team[];

  @Input('employee-id')
  emplid: number;

  rows: any[];
  field_newStartDate: HTMLElement;
  delegeeSuggestions: any[];
  search$: Subject<any>;
  newDelegationsForm: FormGroup = this.fb.group({
    newDelegations: this.fb.array([])
  });

  get newDelegations() {
    return this.newDelegationsForm.get('newDelegations') as FormArray;
  }

  rightNow: Date = new Date();
  MIN_NEW_DATE: number = Date.now();

  constructor( private employeesService: EmployeesService,
               private fb: FormBuilder,
               private messageService: MessageService) { }

  ngOnInit() {
    if (this.fullscreen) { return; }
    this.search$ = new Subject<any>();
    this.search$.pipe(
      switchMap( query => this.employeesService.searchForTeamMembers( query, this.teams, this.emplid ))
    ).subscribe((people: Person[]) => {
      this.delegeeSuggestions = people.map(this.mapPersonForDropDown);
    });
  }

  ngOnChanges() {
    if (!this.emplid) { return; }
    this.rows = this.delegations ? Array.from(this.delegations) : [];
    this.newDelegations.controls = [];
    this.rows.push(this.newDelegations);
    if ((!this.delegations || this.delegations.length < 1) && !this.fullscreen) {
      this.addNewDelegation();
    }
  }

  save( emp: Employee): Employee {
    if (this.pristineAndUntouched) { return emp; }
    emp.delegations = this.delegations.concat( this.newDelegations.value.map( group => {
      group.startDate.setHours(group.startTime.getHours(), group.startTime.getMinutes());
      group.startDate = moment(group.startDate).tz('America/Chicago').format('YYYY-MM-DDTHH:mm:ss.SSS');
      group.endDate.setHours(group.endTime.getHours(), group.endTime.getMinutes());
      group.endDate = moment(group.endDate).tz('America/Chicago').format('YYYY-MM-DDTHH:mm:ss.SSS');
      return new Delegation(
        group.contact.person,
        group.startDate,
        group.endDate
      );
    }));
    return emp;
  }

  clear() {
    this.resetAddDelegationForm();
  }

  get pristineAndUntouched(): boolean {
    return this.newDelegations.pristine && this.newDelegations.untouched;
  }

  get invalid(): boolean {
    if (this.newDelegations.invalid) {
      this.displayValidationError();
    }
    return this.newDelegations.invalid;
  }

  mapPersonForDropDown( person ): any {
    let fullNameAndTitle: string;
    fullNameAndTitle = person.prefName ? person.prefName : person.firstName;
    fullNameAndTitle += ' ' + person.lastName;
    fullNameAndTitle += ', ' + person.title;
    return { fullNameAndTitle: fullNameAndTitle, person: person };
  }

  focusOnDateTime( control: FormControl, start?: FormControl ) {
    if ( control.dirty ) { return; }
    if ( start && start.dirty ) { control.setValue(start.value); return; }

    const x = 60 * 60 * 1000;
    control.setValue(new Date(Math.ceil(new Date().getTime() / x ) * x ));
  }

  addNewDelegation() {
    if (this.newDelegations.length > 0 && this.newDelegations.invalid) {
      this.displayValidationError();
      return;
    }

    this.newDelegations.push(this.fb.group({
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required],
      contact: ['', Validators.required]
    }, { validators: this.sensicalTimesValidator }));
  }

  sensicalTimesValidator: ValidatorFn = ( control: FormGroup): ValidationErrors | null => {
    if (control.untouched) { return null; }
    control.setErrors(null);

    const newStartDateNumber: number = this.makeDateNumber(control, 'startDate', 'startTime');
    if (!newStartDateNumber) { return null; }
    if (newStartDateNumber < this.MIN_NEW_DATE) {
      return { 'startDateInPast': true };
    }

    const newEndDateNumber: number = this.makeDateNumber(control, 'endDate', 'endTime');
    if (!newEndDateNumber) { return null; }
    if (newEndDateNumber <= newStartDateNumber) {
      return { 'endDateBeforeStartDate': true };
    }
    return null;
  }

  makeDateNumber( control: FormGroup, date: string, time: string ): number {
    const newDate: Date = control.get(date).value;
    const newTime: Date = control.get(time).value;
    if (!newDate || !newTime) { return null; }
    newDate.setHours(newTime.getHours(), newTime.getMinutes());
    return newDate.valueOf();
  }

  resetAddDelegationForm(): void {
    this.newDelegationsForm.setControl('newDelegations', this.fb.array([]));
    if (!this.delegations || this.delegations.length < 1) {
      this.addNewDelegation();
    }
  }

  searchForDelegees( event ): void {
    this.search$.next( event.query );
  }

  isDelegation( row: any ): boolean {
    return row instanceof Delegation;
  }

  displayValidationError() {
    let detail: string;
    this.newDelegations.controls.forEach( (controlGroup: FormGroup, i: number) => {
      if (controlGroup.errors && controlGroup.errors.endDateBeforeStartDate) {
        detail = 'Specified end date and time must come after specified start date and time.';
      }
      if (controlGroup.errors && controlGroup.errors.startDateInPast) {
        detail = 'Specified start date and time must be in the future.';
      }
      if (controlGroup.getError('required', ['startDate']) || controlGroup.getError('required', ['startTime']) ||
          controlGroup.getError('required', ['endDate']) || controlGroup.getError('required', ['endTime']) ||
          controlGroup.getError('required', ['contact'])) {
            detail = 'All fields must be completed.';
      }
    });
    this.messageService.add({ severity: 'error', summary: 'Add Delegation Failed', detail: detail});
  }
}