import {
  EmployeeDTO,
  TaskAssignmentDelegationDTO,
  PersonDTO,
  Source,
  RoleDTO,
  EmployeeTaskSchedule
} from './employees.dto';
import { Team } from '../team-management/team-management.model';
import { TeamRoleDTO } from '../team-management/team-management-dto';

export class Role {
  roleTypeName: string;

  static fromRoleDto( dto: RoleDTO ): Role {
    const role: Role = new Role();
    role.roleTypeName = dto.roleTypeName;
    return role;
  }
}

export class Person {
  title?: string;
  prefName?: string;
  firstName?: string;
  lastName?: string;
  id: number;

  static fromElasticSource( source: Source ): Person {
    const person: Person = new Person();
    person.id = Number(source.emplid);
    person.firstName = source.firstName;
    person.prefName = source.personDTO.prefName;
    person.lastName = source.lastName;
    person.title = source.personDTO.jobTitle;
    return person;
  }

  static fromPersonDTO( dto: PersonDTO ): Person {
    const person: Person = new Person();
    person.title = dto.title;
    person.prefName = dto.preferredName;
    person.firstName = dto.firstName;
    person.lastName = dto.lastName;
    person.id = Number(dto.personEmployeeID);
    return person;
  }
}

export class ScheduleDay {
  day: string;
  id: number;
  startTime: string;
  endTime: string;

  static fromEmpTaskSched(employeeTaskSchedule: EmployeeTaskSchedule): ScheduleDay {
    const sched: ScheduleDay = new ScheduleDay();
    sched.id = employeeTaskSchedule.employeeTaskScheduleID;
    sched.day = employeeTaskSchedule.employeeTaskScheduleDay;
    sched.startTime = employeeTaskSchedule.employeeTaskScheduleStartTime;
    sched.endTime = employeeTaskSchedule.employeeTaskScheduleEndTime;
    return sched;
  }

  toEmpTaskSched(personID: string): EmployeeTaskSchedule {
    return {
      employeeTaskScheduleID: this.id,
      employeeTaskScheduleDay: this.day,
      employeeTaskScheduleStartTime: this.startTime,
      employeeTaskScheduleEndTime: this.endTime,
      personID: personID
    };
  }
}

export class Delegation {
  id?: number;
  start: Date;
  end: Date;
  delegee: Person;

  constructor( delegee: Person, start: Date, end: Date ) {
    this.delegee = delegee;
    this.start = start;
    this.end = end;
    return this;
  }

  static fromTaskAssignmentDelegationDTO( taddto: TaskAssignmentDelegationDTO): Delegation {
    const deleg: Delegation = new Delegation(
      Person.fromPersonDTO(taddto.teamPersonDTO),
      taddto.delegationEffectiveTimestamp,
      taddto.delegationExpirationTimestamp
    );
    deleg.id = taddto.taskAssignmentDelegationID;
    return deleg;
  }

  toTaskAssignDelegDTO( personid: string): TaskAssignmentDelegationDTO {
    return {
      taskAssignmentDelegationID: this.id,
      delegatedPersonID: this.delegee.id.toString(),
      delegationEffectiveTimestamp: this.start,
      delegationExpirationTimestamp: this.end,
      delegatorPersonID: personid
    };
  }
}

export class Employee {
  emplid: number;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  extenstion: string;
  personEmployeeID: string;
  phone: string;
  preferredName: string;
  userName: string;
  teams: Team[];
  scheduleList: ScheduleDay[];
  delegations: Delegation[];
  roles: Role[];
  manager: Employee;
  profilePic: string;

  get fullName(): string {
    return (this.preferredName ? this.preferredName : this.firstName) + ' ' + this.lastName;
  }

  readonly isEmployee: boolean = true;

  get displayEmployee(): string {
  return this.fullName + ' (' + this.userName + ')';
  }

  static fromEmployeeDTO( dto: EmployeeDTO ): Employee {
    const emp: Employee = Employee.fromPersonDTO(dto.personDTO);
    emp.teams = dto.teamRoleDTOs ? dto.teamRoleDTOs.map((teamRoleDto: TeamRoleDTO) =>
      Team.fromTeamRoleDto(teamRoleDto)) : [];
    emp.delegations = dto.taskAssignmentDelegationDTOs ? dto.taskAssignmentDelegationDTOs.map( taddto =>
      Delegation.fromTaskAssignmentDelegationDTO(taddto)) : [];
    emp.manager = dto.personDTO.manager ? Employee.fromPersonDTO(dto.personDTO.manager) : undefined;
    emp.scheduleList = dto.employeeTaskScheduleList ? dto.employeeTaskScheduleList.map(ScheduleDay.fromEmpTaskSched) : [];
    return emp;
  }

  static fromElasticSource( source: Source ): Employee {
    const emp: Employee = new Employee();
    emp.emplid = Number(source.emplid);
    emp.firstName = source.firstName;
    emp.lastName = source.lastName;
    emp.preferredName = source.personDTO.prefName;
    emp.title = source.personDTO.jobTitle;
    emp.userName = source.userID;
    emp.manager = new Employee();
    emp.teams = source.teams ? source.teams.map(Team.fromTeamDto) : [];
    emp.roles = source.roles ? source.roles.map(Role.fromRoleDto) : [];
    return emp;
  }

  static fromPersonDTO( dto: PersonDTO ): Employee {
    const emp: Employee = new Employee();
    emp.emplid = Number(dto.personEmployeeID);
    emp.firstName = dto.firstName;
    emp.lastName = dto.lastName;
    emp.title = dto.title;
    emp.email = dto.email;
    emp.extenstion = dto.extension;
    emp.personEmployeeID = dto.personEmployeeID;
    emp.phone = dto.phone;
    emp.preferredName = dto.preferredName;
    emp.userName = dto.userName;
    return emp;
  }

  toSaveDTO(): EmployeeDTO {
    return {
      employeeTaskScheduleList: this.scheduleList ? this.scheduleList.map(sched => sched.toEmpTaskSched(this.personEmployeeID)) : [],
      personDTO: { personEmployeeID: this.personEmployeeID},
      scheduleValidationDTO: {},
      taskAssignmentDelegationDTOs: this.delegations ?
        this.delegations.map( deleg => deleg.toTaskAssignDelegDTO(this.personEmployeeID)) : [],
      teamRoleDTOs: []
    };
  }
}

export class TeamEmployee extends Employee {
  teamMemberPersonID?: number;
  teamAssignmentEffectiveTimestamp?: string;
  teamAssignmentExpirationTimestamp?: string;
}