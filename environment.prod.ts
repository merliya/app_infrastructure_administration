export const environment = {
  production: true,
  envName: "prod",

  urls: {
    employeeService: {
      search: "elastic/infrastructure-employeeprofile/_doc/_search",
      findemployeedetailsbyid: "personnelscheduleservices/employee/findemployeedetailsbyid",
      updateemployee: "personnelscheduleservices/employee/updateemployeeprofile",
      findteams: "personnelteamservices/teams/search/findteams",
      securityLdapUsers: "ws_SecurityLDAP/user/users/"
    },
    teamManagment: {
      findTeamByNameContaining: 'personnelteamservices/teams/search/findByTeamNameContainingAndExpirationTimestampAfter',
      findTeamMembersByTeamIds: 'personnelteamservices/teams/findteammemberbyteamids'
    },
    taskManagementService: {
      createTaskAssignment: 'infrastructuretaskassignmentservices/taskassignments/createtaskassignment',
      search: 'elastic/infrastructure-taskassignment/_doc/_search',
      getTaskDetails: 'infrastructuretaskassignmentservices/taskassignments/fetchtaskassignment/',
      inactivateTask: 'infrastructuretaskassignmentservices/taskassignments/inactivatetaskassignment/',
      activateTask: 'infrastructuretaskassignmentservices/taskassignments/activatetaskassignment/',
      taskCategoryOptions : 'infrastructuretaskreferencedataservices/taskgroups/search/findByExpirationTimestampGreaterThan?projection=taskgroupprojection&expirationTimestamp=',
      roleTypeOptions: 'infrastructuretaskreferencedataservices/taskGroupRoleTypeAssociations/search/findByTaskGroupTaskGroupIDAndExpirationTimestampGreaterThan?projection=roletypeprojection&expirationTimestamp=',
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
        aandlResponsibilityType: '/admin/infrastructuretaskassignmentservices/taskCategories/search/findByTaskModuleTaskModuleCodeIn?taskModuleCode=CusLocProf'
      },
    }
  }
};
