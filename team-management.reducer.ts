import { Action } from '@ngrx/store';
import { ActionTypes, TeamManagementActions } from './team-management.actions';
import { TeamDetail } from '../team-management.model';

export interface State {
  panelOpen: boolean;
  selectedTeam: TeamDetail;
  error: string;
  loading: boolean;
}

export const initialState: State = {
  panelOpen: false,
  selectedTeam: null,
  error: '',
  loading: false
};

export function teamManagementReducer(
  state = initialState,
  action: TeamManagementActions
): State {
  switch (action.type) {
    case ActionTypes.OpenRightPanel: {
      return {
        ...state,
        panelOpen: true
      };
    }

    case ActionTypes.CloseRightPanel: {
      return {
        ...state,
        panelOpen: false
      };
    }

    case ActionTypes.ClearSelectedTeam: {
      return {
        ...state,
        selectedTeam: null
      }
    }

    case ActionTypes.LoadSuccess: {
      return {
        ...state,
        selectedTeam: action.payload,
        error: '',
        loading: false
      }
    }

    case ActionTypes.LoadFail: {
      return {
        ...state,
        selectedTeam: null,
        error: action.payload,
        loading: false
      }
    }

    case ActionTypes.LoadSelectedTeam: {
      return {
        ...state,
        loading: true
      }
    }

    default: {
      return state;
    }
  }
}