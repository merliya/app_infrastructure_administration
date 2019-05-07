// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  envName: 'not_prod',

  urls: {
    employeeService: {
      search: 'elastic/infrastructure-employeeprofile/_doc/_search',
      findemployeedetailsbyid: 'personnelscheduleservices/employee/findemployeedetailsbyid',
      updateemployee: 'personnelscheduleservices/employee/updateemployeeprofile',
      findteams: 'personnelteamservices/teams/search/findteams',
      securityLdapUsers: 'ws_SecurityLDAP/user/users/'
    },
    teamManagment: {
      findTeamByNameContaining: 'personnelteamservices/teams/search/findByTeamNameContainingAndExpirationTimestampAfter',
      findTeamMembersByTeamIds: 'personnelteamservices/teams/findteammemberbyteamids',
      search: 'personnelteamservices/teams/search/findteams?',
      getTeamDetail: 'personnelteamservices/teams/fetchteam?',
      createTeam: 'personnelteamservices/teams/createteam',
      updateTeam: 'personnelteamservices/teams/updateteam',
      getfilters: 'personnelemployeeprofileindex/employeeprofiles/_search',
      getTaskCategories: 'infrastructuretaskreferencedataservices/taskgroups/findalltaskgroups',
      inactivateTeam: 'personnelteamservices/teams/inactivateteam',
      activateTeam: 'personnelteamservices/teams/activateteam/',
    },
    taskManagementService: {
      createTaskAssignment: 'infrastructuretaskassignmentservices/taskassignments/createtaskassignment',
      search: 'elastic/infrastructure-taskassignment/_doc/_search',
      getTaskDetails: 'infrastructuretaskassignmentservices/taskassignments/fetchtaskassignment/',
      inactivateTask: 'infrastructuretaskassignmentservices/taskassignments/inactivatetaskassignment/',
      activateTask: 'infrastructuretaskassignmentservices/taskassignments/activatetaskassignment/',
      // tslint:disable-next-line:max-line-length
      taskCategoryOptions : 'infrastructuretaskreferencedataservices/taskgroups/search/findByExpirationTimestampGreaterThan?projection=taskgroupprojection&expirationTimestamp=',
      // tslint:disable-next-line:max-line-length
      roleTypeOptions: 'infrastructuretaskreferencedataservices/taskGroupRoleTypeAssociations/search/findByTaskGroupTaskGroupIDAndExpirationTimestampGreaterThan?projection=roletypeprojection&expirationTimestamp=',
      // tslint:disable-next-line:max-line-length
      workAssignmentTypeOptions: 'infrastructuretaskreferencedataservices/taskGroupTaskResponsibilityTypeAssociations/search/findByTaskGroupTaskGroupIDAndExpirationTimestampGreaterThan?expirationTimestamp=',
      updateTask: 'infrastructuretaskassignmentservices/taskassignments/updatetaskassignment',
      workAssignmentTypeValue: {
        applicationSupportArea: '/admin/referencedataservices/applicationDomains',
        billingParty: 'elastic/masterdata-account-details/doc/_search',
        businessUnit: '/admin/referencedataservices/serviceOfferingBusinessUnitTransitModeAssociations/search/fetchBusinessUnitCode',
        corporateAccount: 'elastic/masterdata-account-hierarchy/_search',
        deliveryServiceType: '/admin/ordermanagementreferencedataservices/serviceTypes',
        destinationCapacityArea: '/admin/masterdatageographyservices/areas/search/findbyareatype',
        destinationMarketingArea: '/admin/masterdatageographyservices/areas/search/findbymarketingarea',
        destinationRamp: 'elastic/masterdata-location-details/doc/_search',
        destinationSite: 'elastic/masterdata-location-details/doc/_search',
        lDCLocation: 'elastic/masterdata-location-details/doc/_search',
        lineOfBusiness: 'elastic/masterdata-account-hierarchy/_search',
        operationalGroup: 'ordermanagementintegrationservices/fleetCodes/findAllFleetCodes',
        originCapacityArea: '/admin/masterdatageographyservices/areas/search/findbyareatype',
        originMarketingArea: '/admin/masterdatageographyservices/areas/search/findbymarketingarea',
        originRamp: 'elastic/masterdata-location-details/doc/_search',
        originSite: 'elastic/masterdata-location-details/doc/_search',
        serviceOffering: '/admin/referencedataservices/serviceOfferings',
        // tslint:disable-next-line:max-line-length
        aandlResponsibilityType: '/admin/infrastructuretaskassignmentservices/taskCategories/search/findByTaskModuleTaskModuleCodeIn?taskModuleCode=CusLocProf'
      },
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
