import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { ScheduleDay, Employee } from '../../employees.model';
import * as moment from 'moment-timezone';
import { ConfirmationService } from 'primeng/api';
import { formatDate } from '@angular/common';
import { MessageService } from 'primeng/components/common/messageservice';
import { EmployeesService } from '../../employees.service';

type Schedule = {
  emplId: string,
  scheduleList: ScheduleDay[]
};

@Component({
  selector: 'admin-schedule-form',
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.scss']
})
export class ScheduleFormComponent {
  @Input()
  set display(dis: boolean) {
    if (dis === this._display) {
      return;
    } else if (dis === false) {
      if (this.scheduleForm.touched) {
        this._display = false;
        this.confirmationService.confirm({
          message: 'You are about to lose any unsaved changes.<br><br>Are you sure you want to proceed?',
          accept: () => {
            this.hide();
            this.reset();
          },
          reject: () => {
            this._display = true;
          }
        });
      } else {
        this.reset();
        this.hide();
      }
    } else {
      this._display = dis;
      this.scheduleForm.updateValueAndValidity();
    }
  }
  get display(): boolean {
    return this._display;
  }
  private _display: boolean = false;

  @Output()
  displayChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input()
  set schedule(sched: Schedule) {
    if (this._schedule === sched) {
      return;
    } else {
      this._schedule = sched;
      this.resetScheduleForm();
    }
  }
  get schedule(): Schedule {
    return this._schedule;
  }
  private _schedule: Schedule;

  @Output()
  readonly saved = new EventEmitter<any>();

  get scheduleList(): FormArray {
    return this.scheduleForm.get('scheduleList') as FormArray;
  }

  private scheduleForm: FormGroup = this.fb.group({
    scheduleList: this.fb.array([])
  });

  private currentEdit: {
    index: number,
    controlName: string,
    value?: string | Date
  };

  readonly modalColumns = [
    { header: 'Day' },
    { header: 'Start Time'},
    { header: 'End Time'},
    { header: ''}
  ];
  readonly days: { label: string, value: string }[] = [
    { label: 'Monday', value: 'MONDAY' },
    { label: 'Tuesday', value: 'TUESDAY' },
    { label: 'Wednesday', value: 'WEDNESDAY' },
    { label: 'Thursday', value: 'THURSDAY' },
    { label: 'Friday', value: 'FRIDAY' },
    { label: 'Saturday', value: 'SATURDAY' },
    { label: 'Sunday', value: 'SUNDAY' }
  ];

  constructor(private fb: FormBuilder,
              private confirmationService: ConfirmationService,
              private employeesService: EmployeesService,
              private messageService: MessageService) { }

  clearForm() {
    this._display = false;
    this.confirmationService.confirm({
      message: 'Are you sure you want to clear the schedule?',
      accept: () => {
        this.clearSchedule();
        this.addRow();
        this.scheduleForm.markAsTouched();
        this._display = true;
      },
      reject: () => {
        this._display = true;
      }
    });
  }

  addRow(previousIndex?: number): any {
    if (this.scheduleForm.invalid && this.scheduleList.value.length > 0) {
      this.touchAndValidateRows();
      this.messageService.add({
        severity: 'error',
        summary: 'Fix Errors',
        detail: 'Fix existing errors before adding a new row'
      });
    } else {
      this.insertRow((previousIndex|| 0) + 1);
    }
  }

  removeRow(index: number): any {
    this.scheduleList.removeAt(index);
    if (this.currentEdit && this.currentEdit.index === index) {
      this.currentEdit = null;
    }
  }

  save(): void {
    this.finalizeEdit();
    const removed = this.removeEmptyRow();
    this.touchAndValidateRows();
    if (this.scheduleForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fix Errors',
        detail: 'Please fix any errors on the form before saving'
      });
      if (removed) {
        this.insertRow(removed);
      }
      return;
    } else {
      this.saveSchedule();
    }
  }

  saveSchedule(): void {
    const scheduleList = this.createSavePayload();
    const scheduledForSaving: Employee = new Employee();
    scheduledForSaving.personEmployeeID = this.schedule.emplId;
    scheduledForSaving.scheduleList = scheduleList.schedule;
    this.employeesService.saveEmployee( scheduledForSaving ).subscribe( _ => {
      this.messageService.add({
        severity: 'success',
        summary: 'The schedule has been saved successfully', detail: 'Your changes have been saved successfully.'
      });
      this.saved.emit();
      this.scheduleForm.markAsUntouched();
      this.display = false;
    }, err => {
        this.messageService.add({
          severity: 'error', summary: 'Schedule Did Not Save',
          detail: `There was an error saving this user: ${err.message}`
        });
    });
  }

  cancel() {
    this.display = false;
  }

  reset() {
    this.scheduleForm.markAsUntouched();
    this.schedule = this._schedule;
    this.resetScheduleForm();
    this.currentEdit = null;
  }

  isTouchedAndInvalid(key: string | Array<string|number>): boolean {
    const control: AbstractControl = this.scheduleForm.get(key);
    return control && control.touched && control.invalid;
  }

  displayFriendlyDay(dayName: string): string {
    return dayName.toLowerCase().replace(/^./, (match) => match.toUpperCase());
  }

  displayFriendlyTime(time: Date): string {
    if (!time || time.toString() === 'Invalid Date') {
      return null;
    }
    return formatDate(time, 'HH:mm', 'en-us');
  }

  onEditInit(event: {data: number, field: string}) {
    if (this.currentEdit) {
      this.finalizeEdit();
      return;
    } else {
      const index = event.data;
      const controlName = event.field;
      const control = this.scheduleList.get([index, controlName]);
      this.currentEdit = {
        index: index,
        controlName: controlName,
        value: control.value
      };
      control.markAsTouched();
    }
  }

  onDropdownChange(event: {originalEvent: any, value: string}) {
    this.currentEdit.value = event.value;
    if (event.originalEvent instanceof MouseEvent) {
      this.finalizeEdit();
    }
  }

  onTimeSelect(time: Date) {
    this.currentEdit.value = this.convertTimeStringToDate(`${time.getHours()}:${time.getMinutes()}:0`);
  }

  onTimeInput(event: any) {
    this.currentEdit.value = this.convertTimeStringToDate(`${event.target.value}:00`);
  }

  onCalendarClose() {
    this.finalizeEdit();
  }

  onEditComplete() {
    this.finalizeEdit()
  }

  private finalizeEdit() {
    if (this.currentEdit) {
      const index = this.currentEdit.index;
      const controlName = this.currentEdit.controlName;
      this.scheduleList.get([index, controlName]).setValue(this.currentEdit.value);
      this.updateValidity(index);
      this.currentEdit = null;
    }
  }

  private updateValidity(index) {
    this.scheduleForm.updateValueAndValidity();
    const startTimeControl = this.scheduleList.get([index, 'startTime'])
    startTimeControl.updateValueAndValidity();
    this.scheduleList.get([index, 'endTime']).updateValueAndValidity();

    if (startTimeControl.errors && startTimeControl.errors.endTimeBeforeStartTime) {
      this.messageService.add({
        severity: 'error',
        summary: 'Start time cannot be after End time',
        detail: 'Start times must come before their relative end times'
      });
    }
  }

  private sensicalTimesValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
    const startTimeControl = group.get('startTime');
    const endTimeControl = group.get('endTime');
    if (!startTimeControl
      || !endTimeControl
      || !startTimeControl.value
      || !endTimeControl.value
      || isNaN(startTimeControl.value)
      || isNaN(endTimeControl.value)) {
      return null;
    }

    startTimeControl.setErrors(null);
    endTimeControl.setErrors(null);

    const startTime = this.makeTimeNumber(startTimeControl.value || 0);
    const endTime = this.makeTimeNumber(endTimeControl.value || 0);

    if (startTime >= endTime) {
      startTimeControl.setErrors({ 'endTimeBeforeStartTime': true });
      endTimeControl.setErrors({ 'endTimeBeforeStartTime': true });
      return { 'endTimeBeforeStartTime': true };
    } else {
      return null;
    }
  }

  private nonNullDateValidator(control: AbstractControl) {
    if (control.value && control.value.toString() === 'Invalid Date') {
      return { 'invalidDate': true };
    }
    return null;
  }

  private makeTimeNumber(value: Date): number {
    const result: Date = value;
    result.setHours(result.getHours(), result.getMinutes());
    return result.valueOf();
  }

  private resetScheduleForm() {
    this.clearSchedule();
    for (const daySched of this.schedule.scheduleList) {
      this.scheduleList.push(this.buildScheduleDayForm(daySched));
    }
    if (this.scheduleList.length === 0) {
      this.addRow();
    }
    this.scheduleForm.updateValueAndValidity();
  }

  private clearSchedule() {
    this.scheduleForm = this.fb.group({
      scheduleList: this.fb.array([])
    });
  }

  private buildScheduleDayForm(form: any = {}): FormGroup {
    const group = this.fb.group({
      id: [form.id || ''],
      day: [form.day || '', Validators.required],
      startTime: [form.startTime
        ? this.convertTimeStringToDate(form.startTime)
        : ''
        , [Validators.required, this.nonNullDateValidator]],
      endTime: [form.endTime
        ? this.convertTimeStringToDate(form.endTime)
        : ''
        , [Validators.required, this.nonNullDateValidator]]
    }, { validators: [this.sensicalTimesValidator]});
    return group;
  }

  private convertTimeStringToDate(timeString: string): Date {
    if (!timeString) {
      return null;
    }
    const timeStringSplit = timeString.split(':');
    return new Date(0, 0, 0,
      parseInt(timeStringSplit[0], 10), // hours
      parseInt(timeStringSplit[1], 10), // minutes
      parseInt(timeStringSplit[2], 10), // seconds
    0);
  }

  private createSavePayload() {
    return {
      schedule: this.scheduleList.value.map(item => {
        const day = new ScheduleDay();
        day.day = item.day;
        day.startTime = moment(item.startTime, 'MM/DD/YYYY', true).isValid()
          ? moment(item.startTime).format('HH:mm:ss')
          : item.startTime;
        day.endTime = moment(item.endTime, 'MM/DD/YYYY', true).isValid()
          ? moment(item.endTime).format('HH:mm:ss')
          : item.endTime;
        day.id = typeof item.id === 'number'
          ? item.id
          : null;
        return day;
      })
    };
  }

  private hide() {
    this._display = false;
    this.displayChange.emit(false);
  }

  private removeEmptyRow(): number | null {
    let removedAtIndex = null;
    this.scheduleList.controls.forEach((group: FormGroup, index: number) => {
      if (group.get('day').value === ''
        && group.get('startTime').value === ''
        && group.get('endTime').value === '') {
          removedAtIndex = index;
          this.removeRow(index);
      }
    });
    return removedAtIndex;
  }

  private touchAndValidateRows() {
    this.scheduleList.controls.forEach((group: FormGroup) => {
      group.get('day').markAsTouched();
      group.get('startTime').markAsTouched();
      group.get('endTime').markAsTouched();
    });
    this.scheduleForm.updateValueAndValidity();
  }

  private insertRow(index: number) {
    this.scheduleList.insert(index , this.buildScheduleDayForm());
  }
}
