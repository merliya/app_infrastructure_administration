import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { TeamManagementService } from '../team-management.service';
import {
  FormBuilder,
  Validators,
  FormArray,
  FormGroup,
  AbstractControl,
  FormControl,
  ValidationErrors
} from '@angular/forms';
import { EmployeesService } from 'src/app/employees/employees.service';
import { TeamDetail, TeamMemberSaveDTO } from '../team-management.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { OpenRightPanel } from '../state/team-management.actions';
import { ConfirmationService } from 'primeng/api';
import { switchMap } from 'rxjs/operators';
import { AutoComplete } from 'primeng/autocomplete';
import { MessageService } from 'primeng/components/common/messageservice';

import * as fromTeam from '../state';
import * as teamActions from '../state/team-management.actions';
import { Employee, TeamEmployee } from 'src/app/employees/employees.model';
import { TeamDTO } from '../team-management-dto';
import { localTimeString } from 'src/app/shared/javaLocalTime';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'team-add-edit',
  templateUrl: './team-addEdit.component.html',
  styleUrls: ['./team-addEdit.component.scss']
})
export class TeamAddEditComponent implements OnInit, OnDestroy {
  teamId: number;
  selectedTeam$: Subscription;
  mode: string;
  employeeSuggestions: TeamMemberEntry[];
  filteredEmployeeSuggestions: TeamMemberEntry[];
  team: TeamDetail;
  removedTeamMembers: TeamMemberEntry[] = [];
  currentEmplIds: number[] = [];
  onSearch$: Subject<any>;
  onFilteredSearch$: Subject<any>;
  loading$: Subscription;
  loading: boolean;
  fullScreen: EventEmitter<boolean>;
  teamForm = this.fb.group({
    teamName: ['', [Validators.required, Validators.maxLength(120)]],
    teamLeader: ['', [Validators.required]],
    teamMemberList: this.fb.array([], [Validators.minLength(2)])
  });

  constructor(
    private teamManagementService: TeamManagementService,
    private employeesService: EmployeesService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private store: Store<any>
  ) {}

  ngOnInit() {
    this.loading$ = this.store
      .pipe(select(fromTeam.getLoading))
      .subscribe((value: boolean) => {
        this.loading = value;
      });
    this.buildFilteredSearchSubject();
    this.buildSearchSubject();
    this.store.dispatch(new OpenRightPanel());
    this.route.url.subscribe(url => {
      if (url.length > 1) {
        this.mode = url[1].path;
      }
    });
    if (this.inEdit()) {
      this.teamId = this.route.snapshot.params['id'];
      this.selectedTeam$ = this.store
        .pipe(select(fromTeam.getSelectedTeam))
        .subscribe(teamDetail => {
          if (teamDetail && teamDetail.teamID === this.teamId.toString()) {
            this.team = teamDetail;
            this.populateFormData(teamDetail);
          } else {
            this.store.dispatch(
              new teamActions.LoadSelectedTeam(this.teamId.toString())
            );
          }
        });
    }
  }

  ngOnDestroy(): void {
    if (this.selectedTeam$) {
      this.selectedTeam$.unsubscribe();
    }
  }

  buildFilteredSearchSubject() {
    this.onFilteredSearch$ = new Subject<TeamMemberEntry>();
    this.onFilteredSearch$
      .pipe(switchMap(query => this.employeesService.searchForUsers(query)))
      .subscribe(result => {
        this.filteredEmployeeSuggestions = this.makeSuggestions(
          result.employees
        ).filter((element: TeamMemberEntry) => {
          return !this.currentEmplIds.includes(+element.emplId);
        });
      });
  }

  buildSearchSubject() {
    this.onSearch$ = new Subject<any>();
    this.onSearch$
      .pipe(switchMap(query => this.employeesService.searchForUsers(query)))
      .subscribe(result => {
        this.employeeSuggestions = this.makeSuggestions(result.employees);
      });
  }

  makeSuggestions(employees: Employee[]): TeamMemberEntry[] {
    return employees.map((filteredElement: Employee) =>
      this.mapToTeamMemberEntry(filteredElement)
    );
  }

  onFilteredSearch(event?: any) {
    this.filteredEmployeeSuggestions = [];
    this.onFilteredSearch$.next(event.query);
  }

  onSearch(event?: any) {
    this.employeeSuggestions = [];
    this.onSearch$.next(event.query);
  }

  get teamMemberListToArray(): FormArray {
    return this.teamForm.get('teamMemberList') as FormArray;
  }

  addMember(teamMember?: TeamMemberEntry) {
    const member = this.fb.group({
      memberInfo: [teamMember ? teamMember : '', Validators.required]
    });
    this.teamMemberListToArray.push(member);
    if (teamMember) {
      this.currentEmplIds.push(+teamMember.emplId);
    }
  }

  removeMember(index: number) {
    this.teamForm.markAsDirty();
    this.teamForm.markAsTouched();
    const leaderInput = this.teamForm.get('teamLeader');
    const teamMember: TeamMemberEntry = this.teamMemberListToArray.at(index).value.memberInfo;
    if (
      teamMember &&
      leaderInput.value &&
      leaderInput.value.emplId === teamMember.emplId
    ) {
      leaderInput.reset();
      leaderInput.markAsTouched();
      leaderInput.markAsDirty(); // Had to do this to get confirmation dialog to work, for some reason
    }
    if (
      teamMember &&
      this.team &&
      this.team.teamMembers &&
      this.team.teamMembers.filter(
        member => member.personEmployeeID === teamMember.emplId
      ).length > 0
    ) {
      this.removedTeamMembers.push(this.teamMemberListToArray.at(index).value);
    }
    this.teamMemberListToArray.removeAt(index);
    this.currentEmplIds.splice(index, 1);
  }

  teamMemberSelected(event?: any) {
    this.removedTeamMembers = this.removedTeamMembers.filter(
      entry => entry.emplId === event.emplId
    );
    this.currentEmplIds.push(event.emplId);
  }

  changeLeader() {
    const memberCount = this.teamMemberListToArray.length;
    const leader = this.fb.group({
      memberInfo: this.cloneControl(this.teamForm.get('teamLeader'))
    });
    if (!this.isDuplicateMember(leader)) {
      this.teamMemberListToArray.push(leader);
      this.currentEmplIds.push(leader.value.memberInfo.emplId);
    }
    if (memberCount === 0) {
      this.addMember();
    }
  }

  getFormValidationErrors(): ValidationError[] {
    const errors: ValidationError[] = [];
    Object.keys(this.teamForm.controls).forEach(key => {
      const controlErrors: ValidationErrors = this.teamForm.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError: string) => {
          errors.push({ field: key, error: keyError });
        });
      }
    });
    if (this.teamMemberListToArray.invalid) {
      errors.push({ field: 'teamMemberList', error: 'required' });
    }
    return errors;
  }

  onSave() {
    let team: TeamDTO;

    if (this.teamForm.touched && this.teamForm.valid) {
      this.loading = true;
      team = this.mapFormToTeam();
      if (this.inEdit()) {
        this.addRemovedTeamMembers(team);
      }
      this.teamManagementService.saveTeam(team, this.inEdit()).subscribe(
        response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Team Saved',
            detail:
              'You have ' +
              (this.inEdit() ? 'updated ' : 'created ') +
              'the ' +
              team.teamName +
              ' Team.'
          });
          this.teamForm.markAsPristine();
          this.onClose();
        },
        (err: HttpErrorResponse) => {
          this.handleHttpError(err);
          this.loading = false;
        },
        () => {
          this.loading = false;
        }
      );
    } else {
      this.generateInvalidFormErrorMessage();
    }
  }

  onClose() {
    if (this.inEdit()) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  onAutocompleteClear(
    key: string | Array<string | number>,
    autoComplete: AutoComplete
  ) {
    this.teamForm.get(key).markAsTouched();
    this.teamForm.get(key).setValue(null);
    autoComplete.value = null;
    autoComplete.inputFieldValue = null;
  }

  onInactivate() {
    this.confirmationService.confirm({
      message:
        'This function will inactivate the team. Do you want to proceed?',
      accept: () => {
        this.teamManagementService.inactivateTeam(this.team.teamID).subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Inactivated',
              detail: 'Team inactivated successfully.'
            });
            this.store.dispatch(new teamActions.CloseRightPanel());
          },
          (err: HttpErrorResponse) => {
            this.handleHttpError(err);
          }
        );
      }
    });
  }

  onViewProfile() {
    this.router.navigate(['../', 'profile'], {
      relativeTo: this.route
    });
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.teamForm.dirty) {
      this.confirmationService.confirm({
        message: 'Any changes will be lost, do you want to continue?',
        accept: () => {
          this.teamForm.reset();
          this.onClose();
          return true;
        }
      });
    } else {
      this.teamForm.reset();
      return true;
    }
  }

  private handleHttpError(err: HttpErrorResponse) {
    let detailErrorString = err.statusText;
    if (err.error && err.error.errors) {
      const detailErrorName = [];
      err.error.errors.forEach(e => {
        if (e.errorMessage.indexOf('SQL') !== -1) {
          detailErrorString = 'Team cannot be saved to the database.';
        }
        detailErrorName.push(e.errorMessage);
      });
      if (
        detailErrorString === err.statusText &&
        detailErrorName.length !== 0
      ) {
        detailErrorString = detailErrorName.join(', ');
      }
    } else {
      detailErrorString = 'Team service is currently unavailable';
    }
    this.messageService.add({
      severity: 'error',
      summary: 'Error Saving Team',
      detail:
        'Error ' +
        (this.inEdit() ? 'updating ' : 'creating ') +
        'team: ' +
        detailErrorString
    });
  }

  private generateInvalidFormErrorMessage() {
    if (this.teamForm.pristine) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Changes',
        detail: 'Nothing has been changed that needs saving.'
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Form',
        detail: this.getValidationErrorDetail()
      });
    }
  }

  private getValidationErrorDetail(): string {
    return this.getFormValidationErrors()
      .map((error: ValidationError) => {
        return FieldNames[error.field] + ErrorMessages[error.error];
      })
      .join(', ');
  }

  private isDuplicateMember(memberControl: AbstractControl): boolean {
    let hasDuplicate = false;
    this.teamMemberListToArray.value.forEach(entry => {
      if (memberControl.value.memberInfo.emplId === entry.memberInfo.emplId) {
        hasDuplicate = true;
      }
    });
    return hasDuplicate;
  }

  private cloneControl<T extends AbstractControl>(control: T): T {
    let newControl: T;
    if (control instanceof FormGroup) {
      const formGroup = new FormGroup(
        {},
        control.validator,
        control.asyncValidator
      );
      const controls = control.controls;

      Object.keys(controls).forEach(key => {
        formGroup.addControl(key, this.cloneControl(controls[key]));
      });
    } else if (control instanceof FormControl) {
      newControl = new FormControl(
        control.value,
        control.validator,
        control.asyncValidator
      ) as any;
    }
    return newControl;
  }

  isTouchedAndInvalid(key: string | Array<string | number>): boolean {
    return this.teamForm.get(key).touched && this.teamForm.get(key).invalid;
  }

  inEdit(): boolean {
    return this.mode === 'edit';
  }

  private mapToTeamMemberEntry(employee: TeamEmployee): TeamMemberEntry {
    return {
      nameAndUsername: `${employee.fullName} (${employee.userName})`,
      fullMemberInfo: `${employee.fullName} (${employee.userName}), ${
        employee.title
      }`,
      emplId: employee.personEmployeeID
    };
  }

  populateFormData(teamDetail: TeamDetail) {
    teamDetail.teamMembers.forEach((teamMember: TeamEmployee) => {
      this.addMember(this.mapToTeamMemberEntry(teamMember));
    });
    this.teamForm.patchValue({
      teamName: teamDetail.teamName,
      teamLeader: this.findTeamLeaderDetails(teamDetail)
    });
  }

  findTeamLeaderDetails(teamDetail: TeamDetail): TeamMemberEntry {
    return this.teamMemberListToArray.controls.find(
      control =>
        control.value.memberInfo.emplId === teamDetail.teamLeaderPersonID
    ).value.memberInfo;
  }

  mapFormToTeam(): TeamDTO {
    if (this.inEdit()) {
      return {
        teamID: this.teamId,
        teamName: this.teamForm.get('teamName').value.trim(),
        teamLeaderPersonID: this.teamForm.get('teamLeader').value.emplId,
        teamEffectiveTimestamp: this.team.teamEffectiveTimestamp,
        teamExpirationTimestamp: this.team.teamExpirationTimestamp,
        teamPersonDTOs: this.teamMemberListToArray.value.map(member =>
          this.mapToTeamMemberSaveDTO(member)
        )
      };
    } else {
      return {
        teamName: this.teamForm.get('teamName').value.trim(),
        teamLeaderPersonID: this.teamForm.get('teamLeader').value.emplId,
        teamPersonDTOs: this.teamMemberListToArray.value.map(member =>
          this.mapToTeamMemberSaveDTO(member)
        )
      };
    }
  }

  addRemovedTeamMembers(teamDTO: TeamDTO): void {
    this.removedTeamMembers.forEach((teamMember: TeamMemberEntry) => {
      const teamMemberSaveDTO: TeamMemberSaveDTO = this.mapToTeamMemberSaveDTO(
        teamMember
      );
      teamMemberSaveDTO.teamAssignmentExpirationTimestamp = localTimeString();
      teamDTO.teamPersonDTOs.push(teamMemberSaveDTO);
    });
  }

  mapToTeamMemberSaveDTO(member): TeamMemberSaveDTO {
    const teamMemberSaveDTO: TeamMemberSaveDTO = new TeamMemberSaveDTO();

    if (this.inEdit()) {
      const teamMember: TeamEmployee = this.team.teamMembers.find(
        (teamPerson: TeamEmployee) =>
          teamPerson.emplid === member.memberInfo.emplId
      );
      teamMemberSaveDTO.personEmployeeID = teamMember
        ? teamMember.personEmployeeID
        : member.memberInfo.emplId;
      teamMemberSaveDTO.teamMemberPersonID = teamMember
        ? teamMember.teamMemberPersonID
        : 0;
      teamMemberSaveDTO.teamAssignmentEffectiveTimestamp = teamMember
        ? teamMember.teamAssignmentEffectiveTimestamp
        : localTimeString();
      teamMemberSaveDTO.teamAssignmentExpirationTimestamp = teamMember
        ? teamMember.teamAssignmentExpirationTimestamp
        : '2099-12-31T23:59:59.5959';
    } else {
      teamMemberSaveDTO.personEmployeeID = member.memberInfo.emplId;
      teamMemberSaveDTO.teamMemberName = member.memberInfo.nameAndUsername;
      teamMemberSaveDTO.addedAsLeader = this.isLeader(member.memberInfo.emplId);
    }
    return teamMemberSaveDTO;
  }

  isLeader(personEmployeeID: string): boolean {
    if (this.teamForm.get('teamLeader').value) {
      return this.teamForm.get('teamLeader').value.emplId === personEmployeeID;
    }
    return false;
  }
}
interface TeamMemberEntry {
  nameAndUsername: string;
  fullMemberInfo: string;
  emplId: string;
}

interface ValidationError {
  field: string;
  error: string;
}

enum FieldNames {
  teamName = 'Team name',
  teamLeader = 'Team leader',
  teamMemberList = 'Team members list'
}

enum ErrorMessages {
  maxlength = ' is too long',
  required = ' is invalid',
  minlength = ' should have at least 2 members'
}
