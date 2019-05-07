import { TeamDTO, TeamRoleDTO } from "../team-management/team-management-dto";

/**
 * These classes are purely for easy marshalling from the service.
 * DO NOT use them elsewhere in the app.
 * Use classes from employees.model instead.
 */
export class EmployeeDTO {
  employeeTaskScheduleList: EmployeeTaskSchedule[];
  personDTO: PersonDTO;
  scheduleValidationDTO: ScheduleValidationDTO;
  taskAssignmentDelegationDTOs: TaskAssignmentDelegationDTO[];
  teamRoleDTOs: TeamRoleDTO[];
}

export class Source {
  emplid: string;
  firstName: string;
  lastName: string;
  personDTO: SourcePersonDTO;
  roles: RoleDTO[];
  taskAssignments: TaskAssignment[];
  teams: TeamDTO[];
  userID: string;
}

export class EmployeeTaskSchedule {
  employeeTaskScheduleDay: string;
  employeeTaskScheduleEndTime: string;
  employeeTaskScheduleID: number;
  employeeTaskScheduleStartTime: string;
  personID: string;
}

export class PersonDTO {
  email?: string;
  extension?: string;
  firstName?: string;
  lastName?: string;
  personEmployeeID: string;
  phone?: string;
  preferredName?: string;
  title?: string;
  userName?: string;
  manager?: PersonDTO;
}

export class SourcePersonDTO {
  jobTitle?: string;
  managerEmplId?: string;
  managerName?: string;
  prefName?: string;
}

class ScheduleValidationDTO {}

export class TaskAssignmentDelegationDTO {
  delegatedPersonID: string;
  delegationEffectiveTimestamp: Date;
  delegationExpirationTimestamp: Date;
  delegatorPersonID: string;
  taskAssignmentDelegationID: number;
  teamPersonDTO?: PersonDTO;
}

export class RoleDTO {
  roleTypeName: string;
}

export class TaskAssignment {
  roleTypeCode: string[];
  taskAssignmentID: number;
  taskAssignmentName: string;
  taskAssignmentResponsibilityGroupDTO: TaskAssignmentResponsibilityGroupDTO[];
  taskGroupID: number;
  taskGroupName: string;
}

class TaskAssignmentResponsibilityGroupDTO { }