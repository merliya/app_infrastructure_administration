import { Injectable } from '@angular/core';
import { TeamManagementService } from '../team-management.service';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';

import * as teamActions from './team-management.actions';
import { Observable, of } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';

@Injectable()
export class TeamEffects {
  constructor(
    private teamManagementService: TeamManagementService,
    private actions$: Actions
  ) {}

  @Effect()
  loadSelectedTeam$: Observable<Action> = this.actions$.pipe(
    ofType(teamActions.ActionTypes.LoadSelectedTeam),
    map((action: teamActions.LoadSelectedTeam) => action.payload),
    mergeMap(teamId => {
      return this.teamManagementService.getTeamDetails(teamId).pipe(
        map(teamDetails => new teamActions.LoadSuccess(teamDetails)),
        catchError(err => of(new teamActions.LoadFail(err)))
      );
    })
  );
}
