import { ValidatorFn, FormArray, FormGroup, FormControl, ValidationErrors } from '@angular/forms';

export class TaskManagementValidators {
  static noDuplicateValuePairsValidator: ValidatorFn = (array: FormArray): ValidationErrors | null => {
    if (array.untouched || array.length < 2) { return null; }
    TaskManagementValidators.clearArrayErrors(array);
    const comparisonMethod: Function = (array.at(0) as FormGroup).contains('assignee') ?
                                        TaskManagementValidators.compareAssignTos :
                                        TaskManagementValidators.compareWorkAssignments;
    let groupAtHand: FormGroup;
    let hasDuplicates: boolean;
    for (let i = 0; i < array.length; i++) {
      groupAtHand = (array.at(i) as FormGroup);
      for (let j = i + 1; j < array.length; j++) {
        const tempGroup = (array.at(j) as FormGroup);
        if (comparisonMethod(groupAtHand, tempGroup)) {
          hasDuplicates = true;
          groupAtHand.setErrors({duplicate: true});
          tempGroup.setErrors({duplicate: true});
        }
      }
    }
    return hasDuplicates ? {hasDuplicates: true} : null;
  }

  static unusedTeamValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
    const responsibleTeams = formGroup.get('responsibleTeams');
    const assignToList = formGroup.get('assignToList') as FormArray;
    if (responsibleTeams.dirty && responsibleTeams.value.length > 1 && assignToList.controls.length > 0) {
      const unusedResponsibleTeams = [];
      responsibleTeams.value.forEach( responsibleTeam => {
        let responsibleTeamInAssignees = false;
        assignToList.controls.forEach( team => {
          if (!responsibleTeamInAssignees && team.value.assignee
              && team.value.assignee.id.indexOf('Team-' + responsibleTeam.teamID) !== -1) {
            responsibleTeamInAssignees = true;
          }
        });
        if (!responsibleTeamInAssignees) {
          unusedResponsibleTeams.push(responsibleTeam.teamName);
        }
      });
      if (unusedResponsibleTeams.length < 1) {
        responsibleTeams.setErrors(null);
        return null;
      } else {
        const unusedTeam = unusedResponsibleTeams.join(', ');
        const label = 'No members of ' + unusedTeam + ' have been assigned to this task.';
        return {unusedTeam: {value: responsibleTeams.value, name: label}};
      }
    }
    return null;
  }

  private static clearArrayErrors(array: FormArray) {
    array.controls.forEach((group: FormGroup) => {
      Object.values(group.controls).forEach((control: FormControl) => {
        if (!control.hasError('required')) {
          control.setErrors(null);
        }
      });
      group.setErrors(null);
    });
    array.setErrors(null);
  }

  private static compareAssignTos(groupA: FormGroup, groupB: FormGroup): boolean {
    const theSame = (groupA.get('assignee').value === groupB.get('assignee').value) &&
            (groupA.get('roleType').value === groupB.get('roleType').value);
    if (theSame) {
      groupA.get('assignee').setErrors({duplicate: true});
      groupA.get('roleType').setErrors({duplicate: true});
      groupB.get('assignee').setErrors({duplicate: true});
      groupB.get('roleType').setErrors({duplicate: true});
    }
    return theSame;
  }

  private static compareWorkAssignments(groupA: FormGroup, groupB: FormGroup): boolean {
    const theSame = (groupA.get('type').value && groupB.get('type').value) &&
            (groupA.get('value').value && groupB.get('value').value) &&
            (groupA.get('type').value.associationId === groupB.get('type').value.associationId) &&
            (groupA.get('value').value.value === groupB.get('value').value.value);
    if (theSame) {
      groupA.get('type').setErrors({duplicate: true});
      groupA.get('value').setErrors({duplicate: true});
      groupB.get('type').setErrors({duplicate: true});
      groupB.get('value').setErrors({duplicate: true});
    }
    return theSame;
  }
}