import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamAddEditComponent } from './team-addEdit.component';
import { PanelModule } from 'primeng/panel';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfirmationService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TeamManagementService } from '../team-management.service';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MessageService } from 'primeng/components/common/messageservice';
import { of } from 'rxjs';
import { TeamDetail, TeamMemberSaveDTO } from '../team-management.model';

describe('TeamManagementAddEditTeamComponent', () => {
  let component: TeamAddEditComponent;
  let fixture: ComponentFixture<TeamAddEditComponent>;
  let teamManagementService: TeamManagementService;
  let confirmationService: ConfirmationService;
  let store: MockStore<{
    teamManagementState: {
      panelOpen: boolean;
      loading: boolean;
      selectedTeam: TeamDetail;
    };
  }>;
  let router: Router;
  let route: ActivatedRoute;
  const initialState = {
    teamManagementState: { panelOpen: true, loading: false, selectedTeam: null }
  };
  const MINIMUM_MEMBERS = 2;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AutoCompleteModule,
        ButtonModule,
        CalendarModule,
        OverlayPanelModule,
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
        HttpClientTestingModule,
        RouterTestingModule
      ],
      declarations: [TeamAddEditComponent],
      providers: [
        ConfirmationService,
        HttpTestingController,
        MessageService,
        ConfirmationService,
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            url: of('/')
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamAddEditComponent);
    component = fixture.componentInstance;
    component.teamForm.reset();
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    route = TestBed.get(ActivatedRoute);
    store.setState(initialState);
    component.loading = false;
    teamManagementService = fixture.debugElement.injector.get(
      TeamManagementService
    );
    confirmationService = fixture.debugElement.injector.get(
      ConfirmationService
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a member to the list of members', () => {
    const initialCount = component.teamMemberListToArray.length;
    component.addMember();
    expect(component.teamMemberListToArray.length).toBe(initialCount + 1);
  });

  it('should remove a member at a given index in the list of members', () => {
    for (let i = 0; i < 3; i++) {
      component.addMember();
      component.teamMemberListToArray.at(i).value.memberInfo = i;
    }
    component.removeMember(1);
    expect(component.teamMemberListToArray.at(1).value).toEqual({
      memberInfo: 2
    });
  });

  it('should add a blank member and team leader to an empty list of members', () => {
    const mockLeader = { emplId: 1234 };
    component.teamForm.get('teamLeader').patchValue(mockLeader);
    component.changeLeader();
    expect(component.teamMemberListToArray.length).toBe(MINIMUM_MEMBERS);
    expect(component.teamMemberListToArray.at(0).value.memberInfo.emplId).toBe(
      mockLeader.emplId
    );
  });

  it('should not duplicate a leader in the list of members', () => {
    const mockLeader = { emplId: 1234 };
    component.teamForm.get('teamLeader').patchValue(mockLeader);
    component.changeLeader();
    component.changeLeader();
    expect(component.teamMemberListToArray.length).toBe(MINIMUM_MEMBERS);
    expect(component.teamMemberListToArray.at(0).value.memberInfo.emplId).toBe(
      mockLeader.emplId
    );
  });

  it('should require a team name', () => {
    expect(component.teamForm.get('teamName').valid).toBe(false);
  });

  it('should require a team leader', () => {
    expect(component.teamForm.get('teamLeader').valid).toBe(false);
  });

  it('should require at least two team members', () => {
    component.addMember();
    expect(component.teamMemberListToArray.errors.minlength).toEqual({
      requiredLength: 2,
      actualLength: 1
    });
  });

  it('should close the right panel on if the form is clean', () => {
    spyOn(component, 'onClose');
    expect(component.canDeactivate()).toBe(true);
  });

  it('should indicate matches on leader in form', () => {
    const mockLeader = { emplId: '1234' };
    const mockMember = { emplId: '5678' };

    component.teamForm.get('teamLeader').patchValue(mockLeader);
    expect(component.isLeader(mockLeader.emplId)).toBe(true);
    expect(component.isLeader(mockMember.emplId)).toBe(false);
  });

  it('should map members in form to add dto', () => {
    component.mode = 'add';
    const expectedResult: TeamMemberSaveDTO = new TeamMemberSaveDTO();
    expectedResult.personEmployeeID = '1234';
    expectedResult.teamMemberName = 'John Doe';
    expectedResult.addedAsLeader = false;
    const mockMember = {
      memberInfo: {
        emplId: '1234',
        nameAndUsername: 'John Doe'
      }
    };

    expect(component.mapToTeamMemberSaveDTO(mockMember)).toEqual(
      expectedResult
    );
  });
});


