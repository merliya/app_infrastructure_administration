import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ScheduleDay } from '../employees.model';
import * as moment from 'moment-timezone';
import { ScheduleFormComponent } from './schedule-form/schedule-form.component';

@Component({
  selector: 'admin-employee-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  @ViewChild(ScheduleFormComponent)
  form: ScheduleFormComponent;

  @Input()
  fullscreen: boolean = false;

  @Output()
  readonly saved = new EventEmitter<any>();

  private _schedule: {emplId: number, scheduleList: ScheduleDay[]};
  scheduleRows: Array<ScheduleTableRow> = [];
  cols: any[];
  modalColumns: any[];
  displayFormModal: boolean = false;

  constructor() { }

  @Input()
  set schedule(sched: {emplId: number, scheduleList: ScheduleDay[]}) {
    if (this._schedule === sched) {
      return;
    }
    this._schedule = sched;
    this.scheduleRows = this.buildScheduleTableRows(sched);
  }
  get schedule(): {emplId: number, scheduleList: ScheduleDay[]} {
    return this._schedule;
  }

  ngOnInit() {
    this.cols = [
      { header: 'Sunday' },
      { header: 'Monday' },
      { header: 'Tuesday' },
      { header: 'Wednesday' },
      { header: 'Thursday' },
      { header: 'Friday' },
      { header: 'Saturday' }
    ];
  }

  displayModalChanged(newValue) {
    this.displayFormModal = newValue;
  }

  showDialog() {
    this.displayFormModal = true;
  }

  buildScheduleTableRows(schedule: {emplId: number, scheduleList: ScheduleDay[]}): ScheduleTableRow[] {
    const scheduleTableRows: ScheduleTableRow[] = [];
    for (const daySchedule of schedule.scheduleList) {
      let needsNewRow: boolean = true;
      for (const row of scheduleTableRows) {
        if (!row[daySchedule.day.toUpperCase()]) {
          row[daySchedule.day.toUpperCase()] = this.tableTimeString(daySchedule);
          needsNewRow = false;
          break;
        }
      }
      if (needsNewRow) {
        const newRow: ScheduleTableRow = new ScheduleTableRow();
        newRow[daySchedule.day.toLocaleUpperCase()] = this.tableTimeString(daySchedule);
        scheduleTableRows.push(newRow);
      }
    }
    return scheduleTableRows;
  }

  tableTimeString(sched: ScheduleDay): string {
    return `${this.hoursFormatConvention(sched.startTime)}\nto\n${this.hoursFormatConvention(sched.endTime)}`;
  }

  scheduleFormClosed() {
    this.displayFormModal = false;
  }

  resetForm() {
    this.form.reset();
    this.displayFormModal = false;
  }

  private hoursFormatConvention(time: string): string {
    return moment(time, 'HH:mm:ss').format('HH:mm');
  }
}

class ScheduleTableRow {
  MONDAY: string;
  TUESDAY: string;
  WEDNESDAY: string;
  THURSDAY: string;
  FRIDAY: string;
  SATURDAY: string;
  SUNDAY: string;
}