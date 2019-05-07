import { CommonModule } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ConfirmationService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/components/common/messageservice';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { SharedModule } from '../../shared/shared.module';
import { TeamAddEditComponent } from '../team-addEdit/team-addEdit.component';
import { TeamManagementComponent } from '../team-management.component';
import { TeamManagementService } from '../team-management.service';
import { TeamManagementDetailComponent } from './team-management-detail.component';
import { RouterModule } from '@angular/router';

describe('TeamManagementDetailComponent', () => {
  let component: TeamManagementDetailComponent;
  let fixture: ComponentFixture<TeamManagementDetailComponent>;
  let teamManagementService: TeamManagementService;
  let confirmationService: ConfirmationService;
  let store: MockStore<{ teamManagementState: { panelOpen: boolean, loading: boolean }}>;
  const initialState = { teamManagementState: { panelOpen: true, loading: false }}

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TeamManagementDetailComponent, TeamAddEditComponent, TeamManagementComponent ],
      imports: [
        RouterModule,
        CommonModule,
        HttpClientTestingModule,
        AutoCompleteModule,
        ButtonModule,
        CalendarModule,
        OverlayPanelModule,
        SharedModule,
        ProgressSpinnerModule,
        PanelModule,
        TableModule,
        InputTextModule,
        DropdownModule,
        ConfirmDialogModule,
        MessageModule,
        ReactiveFormsModule,
        AutoCompleteModule,
        FormsModule,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        HttpTestingController,
        MessageService,
        TeamManagementService,
        ConfirmationService,
        provideMockStore({ initialState })
      ]
  });
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(TeamManagementDetailComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    component.loading = false;
    teamManagementService = fixture.debugElement.injector.get(TeamManagementService);
    confirmationService = fixture.debugElement.injector.get(ConfirmationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('bodyHasNoErrors should return true if response body array has zerro or more than an one element', () => {
    expect(component.bodyHasNoErrors([{}, {}])).toBeTruthy();
    expect(component.bodyHasNoErrors([])).toBeTruthy();
  });

  it('bodyHasNoErrors method should return false if the error object inside teamValidationDTO object is non null', () => {
    expect(component.bodyHasNoErrors([{ teamValidationDTO: { errors: 'Error' } }])).toBeFalsy();
  });

  it('bodyHasNoErrors method should return false if the error object inside teamValidationDTO object is empty or null or missing', () => {
    expect(component.bodyHasNoErrors([{ teamValidationDTO: { errors: '' } }])).toBeTruthy();
    expect(component.bodyHasNoErrors([{ teamValidationDTO: { errors: null } }])).toBeTruthy();
    expect(component.bodyHasNoErrors([{ teamValidationDTO: {} }])).toBeTruthy();
  });

  it('inactivate method should ask for confirmation first', () => {
    component.loading = true;
    spyOn(confirmationService, 'confirm');
    component.inactivateTeam();
    expect(confirmationService.confirm).toHaveBeenCalled();
  });

  it('activate method should ask for confirmation first', () => {
    component.loading = true;
    spyOn(confirmationService, 'confirm');
    component.activateTeam();
    expect(confirmationService.confirm).toHaveBeenCalled();
  });

});

