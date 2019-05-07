import {
  Component,
  Input,
  EventEmitter,
  Output,
  OnInit,
} from '@angular/core';
import { TeamManagementService } from '../team-management.service';
import { TeamDetail } from '../team-management.model';
import { MessageService } from 'primeng/components/common/messageservice';
import { RightPanelHelper } from 'src/app/shared/data-panel/RightPanelHelper';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { AppService } from 'src/app/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { CloseRightPanel, OpenRightPanel } from '../state/team-management.actions';
import { Observable } from 'rxjs';
import { Employee } from 'src/app/employees/employees.model';

import * as teamActions from '../state/team-management.actions';
import * as fromTeams from '../state';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { EmployeesService } from 'src/app/employees/employees.service';

@Component({
  selector: 'team-management-detail',
  templateUrl: './team-management-detail.component.html',
  styleUrls: ['./team-management-detail.component.scss']
})

export class TeamManagementDetailComponent implements OnInit {

  selectedEmp: Employee;
  selectedTeamEmp: string;
  selectedTeamID: string;
  profilePic: any;
  selectedTeam$: Subscription;
  @Input()
  teamID: string;
  templateName: string;
  rightPanelHelper: RightPanelHelper;
  teamDetail: TeamDetail;
  @Output()
  close: EventEmitter<null> = new EventEmitter();
  @Output()
  edit: EventEmitter<TeamDetail> = new EventEmitter();
  canDeact: boolean;
  @Output()
  fullScreen = new EventEmitter();
  loading: boolean;
  loading$: Subscription;

  constructor(
    private teamManagementService: TeamManagementService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<any>,
    private employeeService: EmployeesService
  ) {}

  ngOnInit(): void {
    this.loading$ = this.store
      .pipe(select(fromTeams.getLoading))
      .subscribe((value: boolean) => {
        this.loading = value;
      });
    this.route.paramMap.subscribe(params => {
      this.teamID = params.get('id');
      this.templateName = params.get('templateName');
      if (this.templateName === 'profile') {
        this.fullScreen.emit(true);
        this.setBreadcrumbs(this.teamID, 'Profile');
      }
      this.loading = true;
      this.store.dispatch(new teamActions.LoadSelectedTeam(this.teamID));
    });
    this.store.dispatch(new teamActions.OpenRightPanel());
    this.selectedTeam$ = this.store
      .pipe(select(fromTeams.getSelectedTeam))
      .subscribe(teamDetail => {
        if (teamDetail) {
          this.teamDetail = teamDetail;
          this.employeeService.searchForUsers(this.teamDetail.createdBy).subscribe(createdBy => {
            if (createdBy.employees && createdBy.employees.length === 1) {
              this.teamDetail.createdBy = createdBy.employees[0].displayEmployee;
            }
          });
          this.employeeService.searchForUsers(this.teamDetail.updatedBy).subscribe(updatedBy => {
            if (updatedBy.employees && updatedBy.employees.length === 1) {
              this.teamDetail.updatedBy = updatedBy.employees[0].displayEmployee;
            }
          });
        }
      });
    this.store
      .pipe(select(fromTeams.getError))
      .subscribe(error => this.teamDetailsError(error));
  }

  ngOnDestroy(): void {
    this.selectedTeam$.unsubscribe();
    this.loading$.unsubscribe();
  }

  teamDetailsError(error: string) {
    if (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Failed to retrieve team details',
        detail: error
      });
    }
  }

  inactivateTeam() {
    this.confirmationService.confirm({
      message:
        'This function will inactivate the team. Do you want to proceed?',
      accept: () => {
        this.teamManagementService
          .inactivateTeam(this.teamDetail.teamID)
          .subscribe(
            res => {
              this.messageService.add({
                severity: 'success',
                summary: 'Inactivated',
                detail: 'Team inactivated successfully.'
              });
              this.store.dispatch(
                new teamActions.LoadSelectedTeam(this.teamID)
              );
            },
            (err: HttpErrorResponse) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Failed',
                detail: this.getErrorMessage(err)
              });
            }
          );
      }
    });
  }

  bodyHasNoErrors(body: any) {
    if (body.length !== 1) {
      return true;
    }

    const res = body[0];
    if (res && res.teamValidationDTO && res.teamValidationDTO.errors) {
      return false;
    }

    return true;
  }

  getErrorMessage(err: HttpErrorResponse): string {
    let detailErrorString = err.statusText;
    if (err.error && err.error.errors) {
      const detailErrorName = [];
      err.error.errors.forEach(e => {
        detailErrorName.push(e.errorMessage);
      });
      if (
        detailErrorString === err.statusText &&
        detailErrorName.length !== 0
      ) {
        detailErrorString = detailErrorName.join(', ');
      }
      return detailErrorString;
    }
    return 'Failed to inactivate team';
  }

  activateTeam() {
    this.confirmationService.confirm({
      message: 'This function will activate the team. Do you want to proceed?',
      accept: () => {
        this.teamManagementService
          .activateTeam(this.teamDetail.teamID)
          .subscribe(
            res => {
              if (res.status === 200) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Activated',
                  detail: 'Team activated successfully.'
                });
                this.store.dispatch(
                  new teamActions.LoadSelectedTeam(this.teamID)
                );
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Failed',
                  detail: 'Failed to active team.'
                });
              }
            },
            error =>
              this.messageService.add({
                severity: 'error',
                summary: 'Failed',
                detail: 'Failed to active team.'
              })
          );
      }
    });
  }

  onClose() {
    this.router.navigate(['../'], { relativeTo: this.route });
    this.store.dispatch(new teamActions.ClearSelectedTeam());
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.router.url.includes('edit')) {
      return true;
    } else {
      this.store.dispatch(new CloseRightPanel());
      return true;
    }
  }

  onEdit() {
    this.router.navigate(['edit'], {
      relativeTo: this.route
    });
  }

  goToFullScreen() {
    this.fullScreen.emit(true);
    this.setBreadcrumbs(this.teamID, 'Profile');
    this.router.navigate(['../', this.teamID, 'profile'], {relativeTo: this.route});
  }

  setBreadcrumbs( id?: string, templateName?: string): void {
    const breadcrumbs: MenuItem[] = [{label: 'Team Management', routerLink: '/team-management/' + id }];
    if (id && templateName === 'Profile') {
      breadcrumbs.push({label: 'Team Profile', routerLink: '/team-management/' + id + '/profile' });
    }
    this.appService.breadcrumbs = breadcrumbs;
  }

  onRowSelect(personEmpId) {
    this.router.navigateByUrl('/employees/' + personEmpId);
  }

  onTaskSelect(taskId) {
    this.router.navigateByUrl(`/taskmanagement/${taskId}`);
  }

}
