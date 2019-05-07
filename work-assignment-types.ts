import { environment } from '../../../environments/environment';
import { queries } from './workAssignmentValueQueries';

const URLS = environment.urls.taskManagementService.workAssignmentTypeValue;

export enum HTTPMethod {
  GET = 'get',
  POST = 'post'
}

const defaultLabelValueMap = (input: string): WorkAssignmentMappedValue => ({label: input, value: input});

function formatAddress(address: any): string {
  let totalAddress = addWithCommaIf(address.AddressLine1);
  totalAddress += addWithCommaIf(address.AddressLine2);
  totalAddress += addWithCommaIf(address.CityName);
  totalAddress += addWithCommaIf(address.StateName);
  totalAddress += addWithCommaIf(address.CountryName);
  totalAddress += address.PostalCode || '';
  return totalAddress;

  function addWithCommaIf( line: string): string {
    return line ? line + ', ' : '';
  }
}

function formatLocationAddress( source: any ): string {
  let totalAddress = source.LocationName ? source.LocationName + ' ' : '';
  totalAddress += source.CustomerCode ? `(${source.LocationCode}), ` : '';
  totalAddress += formatAddress(source.Address);
  return totalAddress;
}

function formatOrganizationAddress( source: any ): string {
  let totalAddress = source.OrganizationName ? source.OrganizationName + ' ' : '';
  totalAddress += source.CustomerCode ? `(${source.CustomerCode}), ` : '';
  totalAddress += formatAddress(source.Address);
  return totalAddress;
}

export const workAssignmentTypes: WorkAssignmentType[] = [
  {
    name: 'A&L Responsibility Type',
    code: 'CCIRespTyp',
    service: {
      destination: URLS.aandlResponsibilityType,
      method: HTTPMethod.GET,
      response_map: (res: any) => res._embedded.taskCategories
    },
    mapLabelValue: (element: any) => ({
      label: element.taskCategoryDescription,
      value: element.taskCategoryCode
    }),
    dropdown: true
  },
  {
    name: 'Agreement Owner',
    code: 'AgmntOwner',
    mapLabelValue: defaultLabelValueMap
  },
  {
    name: 'Application Support Area',
    code: 'AppSupArea',
    service: {
      destination: URLS.applicationSupportArea,
      method: HTTPMethod.GET,
      response_map: (res: any) => res._embedded.applicationDomains
    },
    mapLabelValue: (element: any) => ({
      label: element.applicationDomainDescription,
      value: element.applicationDomainCode
    }),
    dropdown: true
  },
  {
    name: 'Billing Party',
    code: 'BillParty',
    service: {
      destination: URLS.billingParty,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.billingParty;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: formatOrganizationAddress(element._source),
      value: element._id
    })
  },
  {
    name: 'Business Unit',
    code: 'BusUnit',
    service: {
      destination: URLS.businessUnit,
      method: HTTPMethod.GET,
      response_map: (res: any) => res._embedded.serviceOfferingBusinessUnitTransitModeAssociations
    },
    mapLabelValue: (element: any) => ({
      label: element.financeBusinessUnitServiceOfferingAssociation.financeBusinessUnitCode,
      value: element.financeBusinessUnitServiceOfferingAssociation.financeBusinessUnitCode
    }),
    dropdown: true
  },
  {
    name: 'Corporate Account',
    code: 'CorprtAcct',
    service: {
      destination: URLS.corporateAccount,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.corporateAccount;
        const query_string: QueryString = Number.isNaN(Number.parseInt(input, 10)) ?
                            new QueryString(input + '*', 'OrganizationName', 'AND', true) :
                            new QueryString(input, 'OrganizationID', 'AND', true);
        queryObj.query.bool.must[1].bool.should = { query_string: query_string};
        return queryObj;
      },
      response_map: (res: any) => res.aggregations.unique.buckets
    },
    mapLabelValue: (element: any) => ({
      label: element.key,
      value: element.Level.hits.hits[0]._source.OrganizationID
    })
  },
  {
    name: 'Delivery Service Type',
    code: 'DelServTyp',
    service: {
      destination: URLS.deliveryServiceType,
      method: HTTPMethod.GET,
      response_map: (res: any) => res._embedded.serviceTypes
    },
    mapLabelValue: (element: any) => ({
      label: element.serviceTypeDescription,
      value: element.serviceTypeCode
    }),
    dropdown: true
  },
  {
    name: 'Destination Capacity Area',
    code: 'DestCapcAr',
    service: {
      destination: URLS.destinationCapacityArea,
      method: HTTPMethod.GET,
      query_string: (query: string) => `?areaName=${query}&areaType=capacity&projection=area`,
      response_map: (res: any) => res._embedded.areas
    },
    mapLabelValue: (element: any) => ({
      label: element.marketingArea + ' - ' + element.buisnessUnit,
      value: element.id
    })
  },
  {
    name: 'Destination Marketing Area',
    code: 'DestMarkAr',
    service: {
      destination: URLS.destinationMarketingArea,
      method: HTTPMethod.GET,
      query_string: (input: string) => `?areaName=${input}`,
      response_map: (res: any) => res._embedded.areas
    },
    mapLabelValue: (element: any) => ({
      label: element.marketingArea + ', ' + element.buisnessUnit,
      value: element.id
    })
  },
  {
    name: 'Destination Ramp',
    code: 'DestRamp',
    service: {
      destination: URLS.destinationRamp,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.destinationRamp;
        queryObj.query.bool.must[0].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: formatLocationAddress(element._source),
      value: element._source.LocationID
    })
  },
  {
    name: 'Destination Site',
    code: 'DestSite',
    service: {
      destination: URLS.destinationSite,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.destinationSite;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        queryObj.query.bool.should[1].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: formatLocationAddress(element._source),
      value: element._id
    })
  },
  {
    name: 'Dispatch',
    code: 'Dispatch',
    mapLabelValue: defaultLabelValueMap
  },
  {
    name: 'LDC Location',
    code: 'LDCLocatn',
    service: {
      destination: URLS.lDCLocation,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.ldcLocation;
        queryObj.query.bool.must[0].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: formatLocationAddress(element._source),
      value: element._id
    })
  },
  {
    name: 'Line Of Business',
    code: 'LOB',
    service: {
      destination: URLS.lineOfBusiness,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.lineOfBusiness;
        queryObj.query.bool.must[1].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: element._source.OrganizationName,
      value: element._source.OrganizationID
    })
  },
  {
    name: 'Operational Group',
    code: 'OpratnlGrp',
    service: {
      destination: URLS.operationalGroup,
      method: HTTPMethod.GET,
      query_string: (input: string) => `?fleetcode=${input}&rowCount=25&start=0&end=20`,
      response_map: (res: any) => res
    },
    mapLabelValue: (element: any) => ({
      label: element.id,
      value: element.id
    })
  },
  {
    name: 'Origin Capacity Area',
    code: 'OrgnCapcAr',
    service: {
      destination: URLS.originCapacityArea,
      method: HTTPMethod.GET,
      query_string: (query: string) => `?areaName=${query}&areaType=capacity&projection=area`,
      response_map: (res: any) => res._embedded.areas
    },
    mapLabelValue: (element: any) => ({
      label: element.marketingArea + ',' + element.buisnessUnit,
      value: element.id
    })
  },
  {
    name: 'Origin Marketing Area',
    code: 'OrgnMarkAr',
    service: {
      destination: URLS.originMarketingArea,
      method: HTTPMethod.GET,
      query_string: (input: string) => `?areaName=${input}`,
      response_map: (res: any) => res._embedded.areas
    },
    mapLabelValue: (element: any) => ({
      label: element.marketingArea + ', ' + element.buisnessUnit,
      value: element.id
    })
  },
  {
    name: 'Origin Ramp',
    code: 'OrgnRamp',
    service: {
      destination: URLS.originRamp,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.originRamp;
        queryObj.query.bool.must[0].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: formatLocationAddress(element._source),
      value: element._id
    })
  },
  {
    name: 'Origin Site',
    code: 'OrgnSite',
    service: {
      destination: URLS.originSite,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.originSite;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        queryObj.query.bool.should[1].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: formatLocationAddress(element._source),
      value: element._id
    })
  },
  {
    name: 'Rail Carrier',
    code: 'RailCarr',
    mapLabelValue: defaultLabelValueMap
  },
  {
    name: 'Ramp Group',
    code: 'RampGroup',
    mapLabelValue: defaultLabelValueMap
  },
  {
    name: 'Regional Distribution Center',
    code: 'RgnlDstCtr',
    mapLabelValue: defaultLabelValueMap
  },
  {
    name: 'Routing Group ID',
    code: 'RoutGrpID',
    mapLabelValue: defaultLabelValueMap
  },
  {
    name: 'Service Offering',
    code: 'ServOffrng',
    service: {
      destination: URLS.serviceOffering,
      method: HTTPMethod.GET,
      response_map: (res: any) => res._embedded.serviceOfferings
    },
    mapLabelValue: (element: any) => ({
      label: element.serviceOfferingDescription,
      value: element.serviceOfferingCode
    }),
    dropdown: true
  },
  {
    name: 'Tractor',
    code: 'Tractor',
    mapLabelValue: defaultLabelValueMap
  },
  {
    name: 'Truck Carrier',
    code: 'TrukCarier',
    mapLabelValue: defaultLabelValueMap
  },
  {
    name: 'Utilization Status',
    code: 'UtilztnSts',
    mapLabelValue: defaultLabelValueMap
  },
];

export interface WorkAssignmentType {
  name: string;
  code: string;
  service?: WorkAssignmentTypeService;
  dropdown?: boolean;
  values?: WorkAssignmentMappedValue[];
  mapLabelValue?: (obj: any) => WorkAssignmentMappedValue;
}

export interface WorkAssignmentMappedValue {
  label: string;
  value: any;
}

export interface WorkAssignmentTypeService {
  destination: string;
  query_string?: (query: string) => string;
  request_body?: (query: string) => Object;
  response_map: (response: any) => any;
  method: HTTPMethod;
}

class QueryString {
  default_field: string;
  query: string;
  default_operator: string;
  analyze_wildcard: boolean;

  constructor(query: string, defaultField?: string, defaultOperator: string = 'AND', analyzeWildcard: boolean = true) {
    this.default_field = defaultField;
    this.query = query;
    this.default_operator = defaultOperator;
    this.analyze_wildcard = analyzeWildcard;
    return this;
  }
}