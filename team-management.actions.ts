import { Action } from '@ngrx/store';
import { TeamDetail } from '../team-management.model';

export enum ActionTypes {
    OpenRightPanel = '[Right Panel] Open',
    CloseRightPanel = '[Right Panel] Close',
    LoadSelectedTeam = '[Team] Load Team',
    ClearSelectedTeam = '[Team] Clear Team',
    LoadSuccess = '[Team] Load Success',
    LoadFail = '[Team] Load Fail'
}

export class CloseRightPanel implements Action {
    readonly type = ActionTypes.CloseRightPanel;
}

export class OpenRightPanel implements Action {
    readonly type = ActionTypes.OpenRightPanel;
}

export class LoadSelectedTeam implements Action {
    readonly type = ActionTypes.LoadSelectedTeam;

    constructor(public payload: string) { }
}

export class ClearSelectedTeam implements Action {
    readonly type = ActionTypes.ClearSelectedTeam;
}

export class LoadSuccess implements Action {
  readonly type = ActionTypes.LoadSuccess;

  constructor(public payload: TeamDetail) { }
}

export class LoadFail implements Action {
  readonly type = ActionTypes.LoadFail;

  constructor(public payload: string) { }
}

export type TeamManagementActions = CloseRightPanel
                                  | OpenRightPanel
                                  | LoadSelectedTeam
                                  | ClearSelectedTeam
                                  | LoadSuccess
                                  | LoadFail;
