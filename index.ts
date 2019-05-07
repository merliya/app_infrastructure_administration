import { createSelector, createFeatureSelector } from "@ngrx/store";
import { State } from './team-management.reducer';

const getTeamManagementFeatureState = createFeatureSelector<State>('teamManagementState');

export const getPanelOpen = createSelector(
  getTeamManagementFeatureState,
  state => state.panelOpen
);

export const getSelectedTeam = createSelector(
  getTeamManagementFeatureState,
  state => state.selectedTeam
);

export const getError = createSelector(
  getTeamManagementFeatureState,
  state => state.error
);

export const getLoading = createSelector(
  getTeamManagementFeatureState,
  state => state.loading
)