import { Component, OnInit, ViewChild } from '@angular/core';
import { RightPanelHelper } from '../shared/data-panel/RightPanelHelper';
import { Employee, Role, Delegation, ScheduleDay } from './employees.model';
import { EmployeesService, EmployeeSearchResult } from './employees.service';
import { DataPanelColumn } from '../shared/data-panel/data-panel.component';
import { switchMap, filter, throwIfEmpty } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Filter, ElasticFilter } from '../shared/filter-panel/filter/filter.model';
import { MessageService } from 'primeng/components/common/messageservice';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { iif, Subject, EmptyError } from 'rxjs';
import { TaskDelegationComponent } from './task-delegation/task-delegation.component';
import { FormComponent } from '../shared/FormComponent';
import { AppService } from '../app.service';
import { Team } from '../team-management/team-management.model';

@Component({
  selector: 'admin-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {

  @ViewChild(TaskDelegationComponent)
  taskDelegationComponent: FormComponent;


  schedule: {emplId: number, scheduleList: ScheduleDay[]};
  rightPanelHelper: RightPanelHelper;
  employees: Employee[];
  columns: DataPanelColumn[] = [
    {field: 'fullName', header: 'Full Name'},
    {field: 'title', header: 'Title'},
    {field: 'teams', header: 'Team Name'},
    {field: 'roles', header: 'Role'}
  ];
  filters: Filter[];
  selectedEmp: Employee;
  selectedEmpManager: Employee;
  values: TableEmployee[];
  totalRecords: number;
  fullscreen: boolean;
  mostRecentSearch: string = '';
  tableSize: number = 25;
  userPanelIsLoading: boolean;
  onSearch$: Subject<any>;
  childComponents: FormComponent[];
  selectedEmplId: number;
  delegations: Delegation[];
  activeFilters: ElasticFilter[] = [];
  firstRecord: number = 0;

  constructor( private employeesService: EmployeesService,
               private appService: AppService,
               private confirmationService: ConfirmationService,
               private messageService: MessageService,
               private route: ActivatedRoute,
               private router: Router ) {
    this.rightPanelHelper = new RightPanelHelper();
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        iif(() => params.has('id'),
          this.employeesService.getEmployee(Number(params.get('id'))),
          this.employeesService.searchForUsers( this.mostRecentSearch, this.firstRecord, this.tableSize, this.activeFilters)
        )
      )
    ).subscribe((result: Employee | EmployeeSearchResult) => {
      if (this.isEmployee(result)) {
        this.fullscreen = true;
        this.selectedEmp = result;
        this.selectedEmplId = result.emplid;
        this.delegations = result.delegations;
        this.employeesService.getProfilePicture(result).subscribe( pic => {
          this.selectedEmp.profilePic = pic ? 'data:image/png;base64,' + pic : 'assets/images/nouser.png';
        });
        this.setBreadcrumbs(result.emplid);
      } else {
        this.fullscreen = false;
        this.searchForUsersSubscribe((<EmployeeSearchResult>result));
        this.buildSearchSubject();
        this.filters = this.buildFilters();
        this.childComponents = [
          this.taskDelegationComponent
        ];
        this.setBreadcrumbs();
        if (this.selectedEmp) { this.rightPanelHelper.setOpen(); };
      }
    });
  }

  isEmployee( res: Employee | EmployeeSearchResult): res is Employee {
    return (<Employee>res).isEmployee === true;
  }

  setBreadcrumbs( id?: number ): void {
    const breadcrumbs: MenuItem[] = [{label: 'User Management', routerLink: '/employees'}];
    if (id) {
      breadcrumbs.push({label: this.selectedEmp.fullName, routerLink: '/employees/' + id });
    }
    this.appService.breadcrumbs = breadcrumbs;
  }

  mapEmployeesForTable( employees: Employee[] ): TableEmployee[] {
    return employees.map( (emp: Employee) => {
      return {
        id: emp.emplid,
        userName: emp.userName,
        managerid: emp.manager.emplid,
        fullName: emp.fullName,
        title: emp.title,
        teams: emp.teams.map( (team: Team) => team.name).join(', '),
        roles: emp.roles.map( (role: Role) => role.roleTypeName).join(', ')
      };
    });
  }

  searchForUsersSubscribe( results: EmployeeSearchResult ) {
    this.employees = results.employees;
    this.totalRecords = results.hitCount;
    this.values = this.mapEmployeesForTable(results.employees);
  }

  buildFilters(): Filter[] {
    return [
      this.buildPreferredNameFilter(),
      this.buildLastNameFilter(),
      this.buildTitleFilter(),
      this.buildTeamFilter(),
      this.buildRoleFilter()
    ];
  }

  buildPreferredNameFilter(): ElasticFilter {
    return new ElasticFilter(
      'First Name', 'personDTO.prefName', // We're displaying this as first name, but in the code it's always preferredName
      (event) => this.employeesService.searchForPreferredNames(event.query)
    );
  }

  buildLastNameFilter(): ElasticFilter {
    return new ElasticFilter(
      'Last Name', 'lastName',
      (event) => this.employeesService.searchForLastNames(event.query)
    );
  }

  buildTitleFilter(): ElasticFilter {
    return new ElasticFilter(
      'Title', 'personDTO.jobTitle',
      (event) => this.employeesService.searchForTitles(event.query)
    );
  }

  buildTeamFilter(): ElasticFilter {
    return new ElasticFilter(
      'Teams', 'teams.teamName',
      (event) => this.employeesService.searchForTeamNames(event.query)
    );
  }

  buildRoleFilter(): ElasticFilter {
    return new ElasticFilter(
      'Roles', 'roles.roleTypeName',
      (event) => this.employeesService.searchForRoleNames(event.query)
    );
  }

  onRowSelect( tableEmp: TableEmployee ) {
    if (this.selectedEmp && tableEmp.id === this.selectedEmp.emplid) { return; }
    this.userPanelIsLoading = true;
    this.selectedEmp = null;
    this.loadEmployee(tableEmp.id);
  }

  loadEmployee( id: number ) {
    this.employeesService.getEmployee( id ).pipe(
      filter(emp => !!emp.emplid),
      throwIfEmpty()
    ).subscribe(emp => {
      this.schedule = {emplId: emp.emplid, scheduleList: emp.scheduleList};
      this.selectedEmplId = emp.emplid;
      this.delegations = emp.delegations;
      this.selectedEmp = emp;
      this.selectedEmp.profilePic = 'assets/images/nouser.png';
      this.employeesService.getProfilePicture(emp).subscribe( pic => {
        this.selectedEmp.profilePic = pic ? 'data:image/png;base64,' + pic : 'assets/images/nouser.png';
      });
      this.userPanelIsLoading = false;
    }, (err: Error | EmptyError) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error Retrieving User',
        detail: (err instanceof EmptyError) ? 'User was not found.' : err.message
      });
      this.rightPanelHelper.setClosed();
    });
  }

  onPageChange( event: any): void {
    this.tableSize = event.rows;
    this.firstRecord = event.first;
    this.onSearch$.next(this.mostRecentSearch);
  }

  goToFullscreen(): void {
    this.router.navigate(['./' + this.selectedEmp.emplid], { relativeTo: this.route });
  }

  buildSearchSubject() {
    this.onSearch$ = new Subject<any>();
    this.onSearch$.pipe(
      switchMap(query => this.employeesService.searchForUsers(query, this.firstRecord, this.tableSize, this.activeFilters))
    ).subscribe(emps => this.searchForUsersSubscribe(emps));
  }

  onSearch(event: string) {
    this.firstRecord = 0;
    this.mostRecentSearch = event;
    this.onSearch$.next(event);
  }

  onFilter( filters: Filter[]) {
    this.firstRecord = 0;
    this.activeFilters = (filters as ElasticFilter[]);
    this.onSearch$.next(this.mostRecentSearch);
  }

  cancel(): void {
    if (this.childComponents.every( component => component.pristineAndUntouched)) {
      this.childComponents.forEach( comp => comp.clear());
      this.rightPanelHelper.setClosed();
    } else {
      this.confirmationService.confirm({
        message: 'You are about to lose all changes. Do you want to proceed?',
        accept: () => {
          this.childComponents.forEach( comp => comp.clear());
          this.rightPanelHelper.setClosed();
        },
        reject: () => {}
      });
    }
  }

  saveUser(): void {
    if (this.childComponents.every(component => component.pristineAndUntouched)) {
      return this.messageService.add({ severity: 'info', summary: 'No Changes', detail: 'Nothing has been changed that needs saving.'});
    }

    let userForSaving: Employee = new Employee();
    userForSaving.personEmployeeID = this.selectedEmp.personEmployeeID;

    for ( let component of this.childComponents ) {
      if (component.invalid) { return; } //Child form is invalid, we shouldn't save anything
      userForSaving = component.save(userForSaving);
    };

    this.employeesService.saveEmployee( userForSaving ).subscribe( _ => {
      this.messageService.add({ severity: 'success', summary: 'Employee Saved', detail: 'Your changes have been saved successfully.'});
    }, err => {
      this.messageService.add({ severity: 'error', summary: 'Did Not Save', detail: `There was an error saving this user: ${err.message}`});
    }, () => {
      this.childComponents.forEach( comp => comp.clear());
      this.loadEmployee(this.selectedEmplId);
    });
  }

  onSaved() {
    this.childComponents.forEach( comp => comp.clear());
    this.loadEmployee(this.selectedEmplId);
  }
}

interface TableEmployee {
  id: number;
  managerid?: number;
  userName: string;
  fullName: string;
  title: string;
  teams: string;
  roles: string;
}