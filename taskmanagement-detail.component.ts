import { Component, OnInit, EventEmitter, Output, OnChanges } from '@angular/core';
import { TaskDetail } from '../task-management.model';
import { Input } from '@angular/core';
import { TaskManagementService } from '../task-management.service';
import { ConfirmationService } from 'primeng/components/common/confirmationservice';
import { MessageService } from 'primeng/components/common/messageservice';
import { EmployeesService } from 'src/app/employees/employees.service';

@Component({
  selector: 'taskmanagement-detail',
  templateUrl: './taskmanagement-detail.component.html',
  styleUrls: ['./taskmanagement-detail.component.scss']
})
export class TaskmanagementDetailComponent implements OnChanges {

  @Input('task-id')
  taskId: number;

  @Output()
  close = new EventEmitter();

  @Output()
  add = new EventEmitter();

  @Output()
  updated = new EventEmitter();

  _taskId: number;
  taskDetail: TaskDetail;
  loading: boolean;

  constructor(private taskManagementService: TaskManagementService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private employeeService: EmployeesService) {}

  ngOnChanges() {
    if (!this.taskId || this.loading ) {
      return;
    }
    this.loading = true;
    this.taskManagementService.getTaskDetails(this.taskId).subscribe(task => {
      this.taskDetail = task;
      this.employeeService.searchForUsers(this.taskDetail.createdBy).subscribe(createdBy => {
        if (createdBy.employees && createdBy.employees.length === 1) {
          this.taskDetail.createdBy = createdBy.employees[0].displayEmployee;
        }
      });
      this.employeeService.searchForUsers(this.taskDetail.updatedBy).subscribe(updatedBy => {
        if (updatedBy.employees && updatedBy.employees.length === 1) {
          this.taskDetail.updatedBy = updatedBy.employees[0].displayEmployee;
        }
      });
      this.loading = false;
      }, (err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to Load Task',
          detail: 'Failed to load task details'
        });
        this.loading = false;
        this.close.emit(null);
      })
    );
  }

  confirmRemoveAssignment() {
    this.confirmationService.confirm({
        message: 'This function will inactivate the task assignment. Do you want to proceed?',
        accept: () => {
          this.loading = true;
          this.taskManagementService.inactivateTask(this.taskDetail.id).subscribe(res => {
            if (res === 'Success') {
              this.messageService.add({ severity: 'success', summary: 'Inactivated',  detail: 'Task Assignment inactivated successfully.'});
              this._taskId = null;
              this.taskDetail = null;
              this.close.emit(res);
            }
          }, (err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Inactivate Failed',
              detail: 'Failed to inactivate task assignment: ' + err.name
            });
            this.loading = false;
          }), () => {
            this.loading = false;
          });
        },
        reject: () => {}
    });
  }

  confirmActivateAssignment() {
    this.confirmationService.confirm({
      message: 'This function will activate the task assignment. Do you want to proceed?',
      accept: () => {
        this.loading = true;
        this.taskManagementService.activateTask(this.taskDetail.id).subscribe(res => {
          if (res === 'Success') {
            this.messageService.add({ severity: 'success', summary: 'Activated',  detail: 'Task Assignment activated successfully.'});
            this._taskId = null;
            this.taskDetail = null;
            this.close.emit(res);
          }
        }, (err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Activate Failed',
            detail: 'Failed to activate task assignment: ' + err.name
          });
          this.loading = false;
        }), () => {
          this.loading = false;
        });
      },
      reject: () => {}
    });
  }

  getTeamNames( teams: any[] ): string {
    if (teams) { return teams.map(team => team.teamName).join(', '); }
  }

}
