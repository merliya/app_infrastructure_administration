import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { TaskDetail } from '../task-management.model';
import { TaskManagementService } from '../task-management.service';
import { Filter, ElasticFilter } from 'src/app/shared/filter-panel/filter/filter.model';
import { TeamManagementService } from 'src/app/team-management/team-management.service';
import { switchMap, map } from 'rxjs/operators';
import { MessageService } from 'primeng/components/common/messageservice';
import { ConfirmationService } from 'primeng/api';
import { workAssignmentTypes, WorkAssignmentType } from './work-assignment-types';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { TaskManagementValidators } from './task-management.validators';
import { HttpErrorResponse } from '@angular/common/http';
import { AutoComplete } from 'primeng/autocomplete';
import { EditableColumn, CellEditor } from 'primeng/table';

@Component({
  selector: 'taskmanagement-addEdit-task',
  templateUrl: './taskmanagement-addEdit-task.component.html',
  styleUrls: ['./taskmanagement-addEdit-task.component.scss']
})
export class TaskmanagementAddEditTaskComponent implements OnInit {

  @Output() close = new EventEmitter();
  @Output() updated = new EventEmitter();
  @Input('task-id') taskId: number;

  task: TaskDetail;
  taskCategoryOptions: { taskCategoryName: string, taskCategoryId: number }[] = [];
  userRoleOptions = [];
  typeOptions = [];
  filteredTypeOptions = [];
  valueOptions: any[];
  activeFilters: ElasticFilter[];
  filters: Filter[];
  onSearch$: Subject<any>;
  mostRecentSearch: any;
  filteredOptions: any[];
  selectedAssignedTo = [];
  selectedWorkAssignments = [];
  teamSearchSubject: Subject<any>;
  assignmentTypeSearchSubject: Subject<any>;
  assignToSuggestions: any[];
  responsibleTeamsSuggestions: any[];
  assignmentTypes: any[];
  availableTeamMembers: { id: string; name: string; teamMemberId: string; }[];
  userRoleSuggestions: any[];
  updating: boolean = false;
  loading: boolean;

  taskForm: FormGroup = this.fb.group({
    assignmentTitle: ['', [Validators.required, Validators.maxLength(30)]],
    category: ['', Validators.required],
    responsibleTeams: ['', Validators.required],
    assignToList: this.fb.array([], [Validators.required, TaskManagementValidators.noDuplicateValuePairsValidator]),
    workAssignmentList: this.fb.array([], [Validators.required, TaskManagementValidators.noDuplicateValuePairsValidator])
  }, { validators: TaskManagementValidators.unusedTeamValidator});

  constructor(private taskManagementService: TaskManagementService,
    private teamManagementService: TeamManagementService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder) {
    this.teamSearchSubject = new Subject();
    this.teamSearchSubject.pipe(
      switchMap(input => this.teamManagementService.findTeamWithNameContaining(input))
    ).subscribe(teams => {
      this.responsibleTeamsSuggestions = teams;
    });
  }

  get formAssignToArray(): FormArray {
    return this.taskForm.get('assignToList') as FormArray;
  }

  get formWorkAssignmentArray(): FormArray {
    return this.taskForm.get('workAssignmentList') as FormArray;
  }

  ngOnInit() {
    if (!this.taskId) {
      this.task = new TaskDetail();
    } else {
      this.task = this.taskManagementService.selectedTask;
      this.taskForm.reset({
        assignmentTitle: this.task.assignmentTitle,
        category: this.task.taskCategory,
        responsibleTeams: this.task.responsibleTeams
      });

      this.task.assignedTo.forEach( team => {
        this.formAssignToArray.push(
          this.fb.group({
            assignee: [team.assignee, Validators.required],
            roleType: [team.roleAssociation , Validators.required],
            effectiveTimestamp: team.effectiveTimestamp,
            expirationTimestamp: team.expirationTimestamp,
            taskAssignmentID: team.taskAssignmentID,
            teamID: team.teamID,
            teamMemberTaskAssignmentRoleAssociationID: team.teamMemberTaskAssignmentRoleAssociationID,
            alternateRoleIndicator: team.alternateRoleIndicator
          })
        );
      });

      this.task.workAssignments.forEach( workAssignment => {
        const group: any = this.fb.group({
          type: [workAssignment.taskResponsibilityTypeDescription, Validators.required],
          value: [workAssignment.taskAssignmentResponsibilityDetail, Validators.required]
        });
        this.taskResponsibilityTypeChange(workAssignment.taskResponsibilityTypeDescription, group);
        this.formWorkAssignmentArray.push(group);
      });

      this.findTeamMembers();
      this.taskCategoryChanged();
      this.updating = true;
    }
  }

  responsibleTeamAddedOrDropped() {
    this.taskForm.get('responsibleTeams').markAsTouched();
    this.findTeamMembers();
  }

  confirmActionIfTouched = (action: Function): void => {
    if (this.taskForm.touched) {
      this.confirmationService.confirm({
        message: 'You are about to lose all your unsaved changes.<br><br>Are you sure you want to proceed?',
        header: 'Unsaved Changes',
        accept: () => { action(); },
        reject: () => {}
      });
    } else {
      action();
    }
  }

  confirmChanges() {
    this.confirmActionIfTouched(() => this.close.emit());
  }

  onSubmit = () => {
    if (this.taskForm.touched
      && this.taskForm.valid
      && this.formAssignToArray.controls.length > 0
      && this.formWorkAssignmentArray.controls.length > 0) {
        this.loading = true;

        this.task.assignmentTitle = this.taskForm.get('assignmentTitle').value.trim();
        this.task.taskCategory = this.taskForm.get('category').value;
        this.task.responsibleTeams = this.taskForm.get('responsibleTeams').value;
        this.task.assignedTo = this.formAssignToArray.controls.map( team => {
          return{
            assignee: team.value.assignee,
            roleAssociation: team.value.roleType,
            effectiveTimestamp: team.value.effectiveTimestamp,
            expirationTimestamp: team.value.expirationTimestamp,
            taskAssignmentID: team.value.taskAssignmentID,
            teamID: team.value.teamID,
            teamMemberTaskAssignmentRoleAssociationID: team.value.teamMemberTaskAssignmentRoleAssociationID,
            alternateRoleIndicator: team.value.alternateRoleIndicator
          };
        });
        this.task.expiredAssignedTo = this.task.expiredAssignedTo.map( team => {
          return{
            assignee: team.assignee,
            roleAssociation: team.roleType,
            effectiveTimestamp: team.effectiveTimestamp,
            expirationTimestamp: team.expirationTimestamp,
            taskAssignmentID: team.taskAssignmentID,
            teamID: team.teamID,
            teamMemberTaskAssignmentRoleAssociationID: team.teamMemberTaskAssignmentRoleAssociationID,
            alternateRoleIndicator: team.alternateRoleIndicator
          };
        });
        this.task.workAssignments = this.formWorkAssignmentArray.controls.map( workAssignment => {
          return {
            taskResponsibilityTypeDescription: workAssignment.get('type').value,
            taskAssignmentResponsibilityDetail: workAssignment.get('value').value
          };
        });
        this.task.expiredWorkAssignments = this.task.expiredWorkAssignments.map( workAssignment => {
          return {
            taskResponsibilityTypeDescription: workAssignment.type,
            taskAssignmentResponsibilityDetail: workAssignment.value
          };
        });
        this.taskManagementService.saveTaskAssignment(this.task, this.updating).subscribe(res => {
          this.messageService.add({
            severity: 'success',
            summary: 'Task Assignment Saved',
            detail: 'Task Assignment [' + this.task.assignmentTitle + '] has been successfully saved.'
          });
          this.close.emit(res);
        }, (err: HttpErrorResponse) => {
          console.error(err);
          let detailErrorString = err.statusText;
          if (err.error && err.error.errors) {
            const detailErrorName = [];
            err.error.errors.forEach( e => {
              if (e.errorMessage.indexOf('SQL') !== -1) {
                detailErrorString = 'Task cannot be saved to the database.';
              }
              detailErrorName.push(e.errorMessage);
            });
            if (detailErrorString === err.statusText && detailErrorName.length !== 0) {
              detailErrorString = detailErrorName.join(', ');
            }
          } else {
            detailErrorString = 'Task service is currently unavailable.';
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Error Saving Task Assignment',
            detail: 'There was a problem saving the task assignment. Error: ' + detailErrorString
          });
          this.loading = false;
        }, () => {
          this.loading = false;
        });
    } else {
      this.taskForm.get('assignmentTitle').markAsTouched();
      this.taskForm.get('category').markAsTouched();
      this.taskForm.get('responsibleTeams').markAsTouched();
      this.generateInvalidFormErrorMessage();
    }
  }

  private generateInvalidFormErrorMessage() {
    if (!this.taskForm.touched) {
      this.messageService.add({ severity: 'info', summary: 'No Changes', detail: 'Nothing has been changed that needs saving.' });
      } else {
      this.messageService.add({ severity: 'error', summary: 'Invalid Form', detail: this.getEmptyFieldsErrorDetail() });
    }
  }

  private getEmptyFieldsErrorDetail(): string {
    const emptyFields = this.getEmptyFields()
    .map((item, index, arr) => {
      if (index === arr.length - 1) {
        if (arr.length === 2) {
          return ` and ${item}`;
        }
        else if (arr.length === 1) {
          return item;
        }
        return `, and ${item}`;
      }
      else if (index === 0) {
        return item;
      }
      else {
        return `, ${item}`;
      }
    })
    .join('');
    return `${emptyFields} must not be empty`;
  }

  private getEmptyFields(): string[] {
    let emptyFields = [];
    if (!this.taskForm.get('assignmentTitle').value) {
      emptyFields.push('Assignment Title');
    }
    if (!this.taskForm.get('category').value) {
      emptyFields.push('Task Category');
    }
    if (this.taskForm.get('responsibleTeams').value.length === 0) {
      emptyFields.push('Responsible Teams');
    }
    if (this.formAssignToArray.invalid) {
      emptyFields.push('Assigned To list');
    }
    if (this.formWorkAssignmentArray.invalid) {
      emptyFields.push('Work Assignment list');
    }
    return emptyFields;
      }

  isTouchedAndInvalid(key: string | Array<string|number>): boolean {
    return this.taskForm.get(key).touched && this.taskForm.get(key).invalid;
  }

  isCategoryOrTeamsInvalid(): boolean {
    return this.taskForm.get('category').invalid || this.taskForm.get('responsibleTeams').invalid;
  }

  validateAddButtons(): boolean {
    return (this.formAssignToArray.touched || this.formWorkAssignmentArray.touched) && this.isCategoryOrTeamsInvalid();
  }

  fetchTaskCategoryOptions(event?: any) {
    this.taskManagementService.getTaskCategoryOptions().subscribe(res => {
      const categoryList = [];
      for (const element of res) {
        if (event.query && !element.taskGroupName.toLowerCase().includes(event.query.toLowerCase())) {
          continue;
        }
        categoryList.push({ taskCategoryName: element.taskGroupName, taskCategoryId: element.taskGroupID });
      }
      categoryList.sort((a, b) => {
        const nameA = a.taskCategoryName.toUpperCase();
        const nameB = b.taskCategoryName.toUpperCase();
        if (nameA < nameB) { return -1; }
        if (nameA > nameB) { return 1; }
        return 0;
      });
      this.taskCategoryOptions = [].concat(categoryList); // because primeNg
    });
  }

  fetchAssignToSuggestions(event?: any) {
    let assignTo = this.availableTeamMembers;
    if (event.query && event.query !== ' ') {
      assignTo = this.availableTeamMembers.filter(member => {
        return member.name.toLowerCase().includes(event.query.toLowerCase());
      });
    }
    this.assignToSuggestions = [].concat(assignTo); // force p-autocomplete to call setter
    return;
  }

  dropdownAssignToSuggestions(event?: any) {
    event.query = ' ';
    this.fetchAssignToSuggestions(event);
  }

  filterRoleOptions(event?: any) {
    let options = this.userRoleOptions;
    if (event.query && event.query !== ' ') {
      options = this.userRoleOptions.filter(member => {
        return member.name.toLowerCase().includes(event.query.toLowerCase());
      });
    }
    this.userRoleSuggestions = [].concat(options); // force p-autocomplete to call setter
  }

  dropdownRoleOptions(event?: any) {
    event.query = ' ';
    this.filterRoleOptions(event);
  }

  onTypeaheadClear(key: string | Array<string|number>, autoComplete: AutoComplete) {
    this.taskForm.get(key).markAsTouched();
    this.taskForm.get(key).setValue(null);
    autoComplete.value = null;
    autoComplete.inputFieldValue = null;
  }

  taskCategoryChanged() {
    const category = this.taskForm.get('category').value;
    if (category) {
      this.taskManagementService.getRoleTypeOptions(category.taskCategoryId).subscribe(res => {
        this.userRoleOptions = [];
        res.forEach(element => {
          this.userRoleOptions.push({
              roleType: element.roleType,
              roleTypeAssocId: element.taskGroupRoleTypeAssociationID,
              name: element.roleType.roleTypeName
          });
        });
        this.formAssignToArray.controls.forEach((controlGroup: FormGroup) => {
          const roleType = controlGroup.get('roleType');
          if (roleType.value) {
            const filteredRoleTypes = this.userRoleOptions.find( roleTypeOption => {
              return roleType.value.name === roleTypeOption.name;
            });
            if (filteredRoleTypes) {
              roleType.setValue(filteredRoleTypes);
            } else {
              roleType.setValue(null);
            }
          }
        });
      });
      this.taskManagementService.getWorkAssignmentTypeOptions(category.taskCategoryId).subscribe(res => {
        this.typeOptions = [];
        res.forEach(element => {
          this.typeOptions.push({
            description: element.taskResponsibilityType.taskResponsibilityTypeDescription,
            associationId: element.taskGroupTaskResponsibilityTypeAssociationID,
            typeCode: element.taskResponsibilityType.taskResponsibilityTypeCode
          });
        });
        this.formWorkAssignmentArray.controls.forEach((controlGroup: FormGroup) => {
          const workAssignmentType = controlGroup.get('type');
          if (workAssignmentType.value) {
            const filteredOptions = this.typeOptions.find( typeOption => {
              return typeOption.description === workAssignmentType.value.description;
            });
            if (filteredOptions) {
              workAssignmentType.setValue(filteredOptions);
            } else {
              this.selectedWorkAssignments.push(controlGroup);
            }
          }
        });
        this.removeWorkAssignments();
      });
    }
  }

  searchForOptions(event, workAssignment) {
    const typeName = workAssignment.value.type.description;
    const workAssignmentType = workAssignment.type || workAssignmentTypes.find(type => type.name === typeName);
    if (!(workAssignmentType && workAssignmentType.service)) {
      workAssignment.filteredOptions = [];
      workAssignment.get('value').value = workAssignmentType.mapLabelValue(event.query);
      return;
    }
    if (!workAssignmentType.dropdown) {
      this.fetchWorkAssignmentTypeValues(workAssignmentType, event.query || '').subscribe( filteredVals => {
        workAssignment.filteredOptions = filteredVals;
      });
    } else if (event.query !== '') {
      workAssignment.filteredOptions = workAssignment.valueOptions.filter(value => value.label.includes(event.query));
    } else {
      workAssignment.filteredOptions = [].concat(workAssignment.valueOptions); // Because primeNg
    }
  }

  fetchWorkAssignmentTypeValues(type: WorkAssignmentType, query: string ): Observable<any[]> {
    return this.taskManagementService.searchForWorkAssignmentTypeValues(type.service, query).pipe(
      map((elements: any[]) => {
        const filteredValues = [];
        if (elements && elements.length > 0) {
          for (let i = 0; i < elements.length && i < 10; i++) {
            filteredValues.push(type.mapLabelValue(elements[i]));
          }
        }
        return filteredValues;
      })
    );
  }

  // *Regular service calls*.
  taskResponsibilityTypeChange(event, workAssignment): any {
    const workAssignmentType = workAssignmentTypes.find(type => type.name === event.description);
    workAssignment.type = workAssignmentType;
    workAssignment.filteredOptions = [];
    const valueList = [];
    if (workAssignmentType && workAssignmentType.service && workAssignmentType.dropdown) {
      this.taskManagementService.getWorkAssignmentTypeValues(workAssignmentType.service).subscribe((elements: any[]) => {
        if (elements && elements.length > 0) {
          for (const element of elements) {
            valueList.push(workAssignmentType.mapLabelValue(element));
          }
        }
        workAssignment.valueOptions = valueList;
      }, (err: Error) => this.messageService.add({
          severity: 'error',
          summary: 'Error Retrieving Values',
          detail: 'Error retrieving values for work assignment type: ' + workAssignmentType.name + '\n' +
            'Error: ' + err.message
      }));
    }
    return workAssignment;
  }

  addTeam() {
    this.formAssignToArray.updateValueAndValidity();
    if (this.isCategoryOrTeamsInvalid()) {
        this.taskForm.get('category').markAsTouched();
        this.taskForm.get('responsibleTeams').markAsTouched();
        this.messageService.add(
          {severity: 'error', summary: 'Invalid Form', detail: 'Please add a Responsible Team and Category before adding a team.'}
        );
        return;
    }
    if (this.formAssignToArray.length > 0 && (
      this.formAssignToArray.invalid ||
      this.formAssignToArray.controls.some(control => control.invalid)
      )) {
      this.formAssignToArray.controls.forEach((controlGroup: FormGroup) => {
        controlGroup.get('assignee').markAsTouched();
        controlGroup.get('roleType').markAsTouched();
      });
      return;
    }
    this.formAssignToArray.push(
      this.fb.group({
        assignee: ['', Validators.required],
        roleType: ['', Validators.required]
      }, Validators.required)
    );
    this.formAssignToArray.markAsTouched();
  }

  removeTeams() {
    this.taskForm.markAsTouched();
    this.formAssignToArray.controls = this.formAssignToArray.controls.filter(assignTo =>
      !this.selectedAssignedTo.includes(assignTo)
    );
    this.selectedAssignedTo.forEach( assignTo => {
      this.task.expiredAssignedTo.push(assignTo.value);
    });
    this.selectedAssignedTo = [];
  }

  searchResponsibleTeams(event: any) {
    this.teamSearchSubject.next(event.query);
  }

  searchAssignmentTypes(event: any) {
    this.filteredTypeOptions = [];
    if (event.query === '') {
      this.filteredTypeOptions = [].concat(this.typeOptions); // because of primeNg
    } else {
      this.filteredTypeOptions = this.typeOptions.filter(
        option => option.description.toLowerCase().includes(event.query.toLowerCase())
      );
    }
  }

  findTeamMembers() {
    const responsibleTeams = this.taskForm.get('responsibleTeams').value;
    const ids: number[] = responsibleTeams.map(team => team.teamID);
    this.teamManagementService.findTeamMembersByTeamIds(ids).subscribe(teamMemberList => {
      this.availableTeamMembers = teamMemberList;
    });
    this.formAssignToArray.controls.forEach((controlGroup: FormGroup) => {
      const assignee = controlGroup.get('assignee');
      let orphanedMember = true;
      if (responsibleTeams.length > 0) {
        responsibleTeams.forEach( responsibleTeam => {
          if (assignee.value && assignee.value.id.indexOf('Team-' + responsibleTeam.teamID) !== -1) {
            orphanedMember = false;
          }
        });
      }
      if (orphanedMember) {
        this.selectedAssignedTo.push(controlGroup);
      }
    });
    this.removeTeams();
  }


  addWorkAssignment() {
    this.formWorkAssignmentArray.updateValueAndValidity();
    if (this.isCategoryOrTeamsInvalid()) {
        this.taskForm.get('category').markAsTouched();
        this.taskForm.get('responsibleTeams').markAsTouched();
        this.messageService.add(
          {severity: 'error',
            summary: 'Invalid Form',
            detail: 'Please add a Responsible Team and Category before adding a work assignment.'}
        );
        return;
    }
    if (this.formWorkAssignmentArray.length > 0 && (
      this.formWorkAssignmentArray.invalid ||
      this.formWorkAssignmentArray.controls.some(control => control.invalid)
      )) {
      this.formWorkAssignmentArray.controls.forEach((group: FormGroup) => {
        group.get('type').markAsTouched();
        group.get('value').markAsTouched();
      });
      return;
    }
    this.formWorkAssignmentArray.push(
      this.fb.group({
        type: ['', Validators.required],
        value: ['', Validators.required]
      }, Validators.required)
    );
    this.formWorkAssignmentArray.markAsTouched();
  }

  removeWorkAssignments() {
    this.taskForm.markAsTouched();
    this.formWorkAssignmentArray.controls = this.formWorkAssignmentArray.controls.filter(workAssignment =>
      !this.selectedWorkAssignments.includes(workAssignment)
    );
    this.selectedWorkAssignments.forEach( workAssignment => {
      this.task.expiredWorkAssignments.push(workAssignment.value);
    });
    this.selectedWorkAssignments = [];
  }

  confirmRemoveAssignment() {
    this.confirmationService.confirm({
      message: 'This function will inactivate the task assignment. Do you want to proceed?',
      accept: () => {
        this.loading = true;
        this.taskManagementService.inactivateTask(this.task.id).subscribe(res => {
          if (res === 'Success') {
            this.messageService.add({
              severity: 'success',
              summary: 'Inactivated',
              detail: 'Task Assignment inactivated successfully.'
            });
            this.taskId = null;
            this.task = null;
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
      }
    });
  }

  valueEntered(input: HTMLInputElement, workAssignment: FormGroup & {type: WorkAssignmentType}) {
    if (!workAssignment || !workAssignment.type) {
      return; // nothing to do here
    }
    const val: string = input.value;
    workAssignment.get('value').setValue(workAssignment.type.mapLabelValue(input.value));
    input.value = val;
  }

  // For overriding the onClick behavior of editable column cells when the currently editing cell is invalid
  onEditCellClick(cell: CellEditor) {
    const column: EditableColumn = cell.editableColumn;
    if (column.isEnabled() && column.dt.editingCell && column.dt.editingCell !== column.el.nativeElement && !column.isValid()) {
      // open that cell any way
      column.domHandler.removeClass(cell.dt.editingCell, 'ui-editing-cell');
      column.openCell();
    }
  }
}