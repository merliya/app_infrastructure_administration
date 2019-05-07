export const queries = {
  billingParty: {
    size: 5,
    _source: [
      'OrganizationName',
      'PartyID',
      'CustomerCode',
      'Address.AddressLine1',
      'Address.AddressLine2',
      'Address.CityName',
      'Address.StateName',
      'Address.CountryName',
      'Address.PostalCode',
      'ExpirationTimestamp',
      'OrganizationStatusTypeCode'
    ],
    query: {
      bool: {
        should: [
          {
            query_string: {
              fields: [
                'OrganizationName^6',
                'CustomerCode^3',
                'Address.AddressLine1^18',
                'Address.AddressLine2^18',
                'Address.CityName^15',
                'Address.StateName^12',
                'Address.PostalCode^9',
                'Address.CountryName',
                'OrganizationName'
              ],
              query: '<!insert value here!>*',
              default_operator: 'and'
            }
          }
        ],
        minimum_should_match: 1,
        must: [
          {
            query_string: {
              default_field: 'OrganizationStatusTypeCode.keyword',
              query: 'Approved'
            }
          },
          {
            nested: {
              path: 'partyroles',
              query: {
                match: {
                  'partyroles.PartyRoleTypeDescription.keyword': 'Bill To'
                }
              },
              inner_hits: {
                size: 1,
                _source: { includes: ['partyroles.PartyRoleTypeDescription'] }
              }
            }
          }
        ]
      }
    }
  },
  corporateAccount: {
    size: 0,
    _source: ['OrganizationName', 'Level'],
    query: {
      bool: {
        must: [
          {
            query_string: {
              default_field: 'Level.keyword',
              query: 'Ultimate Parent',
              split_on_whitespace: false
            }
          },
          {
            bool: {
              should: {}
            }
          }
        ]
      }
    },
    aggs: {
      unique: {
        terms: {
          field: 'OrganizationName.keyword',
          size: 7
        },
        aggs: {
          Level: {
            top_hits: {
              _source: {
                includes: ['OrganizationName', 'Level', 'OrganizationID']
              },
              size: 1
            }
          }
        }
      }
    }
  },
  destinationRamp: {
    _source: [
      'LocationName',
      'LocationCode',
      'LocationID',
      'Address.AddressLine1',
      'Address.AddressLine2',
      'Address.CityName',
      'Address.StateName',
      'Address.CountryName',
      'Address.PostalCode',
      'locationroles.LocationRoleTypeDescription',
      'Address.AddressID'
    ],
    size: 6,
    from: 0,
    query: {
      bool: {
        must: [
          {
            query_string: {
              fields: [
                'LocationName',
                'LocationCode',
                'Address.CityName',
                'Address.StateName'
              ],
              query: '<!insert value here!>*',
              default_operator: 'AND',
              analyze_wildcard: true
            }
          },
          {
            nested: {
              path: 'locationtypes',
              query: {
                query_string: {
                  default_field:
                    'locationtypes.LocationSubTypeDescription.keyword',
                  query: 'Ramp'
                }
              }
            }
          }
        ]
      }
    }
  },
  destinationSite: {
    size: 5,
    _source: [
      'LocationName',
      'LocationCode',
      'LocationID',
      'Address.AddressLine1',
      'Address.AddressLine2',
      'Address.CityName',
      'Address.StateName',
      'Address.CountryName',
      'Address.PostalCode',
      'locationroles.LocationRoleTypeDescription',
      'Address.AddressID'
    ],
    query: {
      bool: {
        should: [
          {
            query_string: {
              fields: ['LocationName^6', 'LocationCode^3'],
              query: '<!insert value here!>*',
              default_operator: 'and'
            }
          },
          {
            query_string: {
              fields: [
                'Address.AddressLine1^18',
                'Address.AddressLine2^18',
                'Address.CityName^15',
                'Address.StateName^12',
                'Address.PostalCode^9',
                'Address.CountryName'
              ],
              query: '<!insert value here!>*',
              default_operator: 'and'
            }
          }
        ],
        minimum_should_match: 1,
        must: [
          {
            nested: {
              path: 'locationroles',
              query: {
                query_string: {
                  fields: ['locationroles.LocationRoleTypeDescription'],
                  query: '(Receiver)',
                  split_on_whitespace: false
                }
              },
              inner_hits: {
                size: 1,
                _source: {
                  includes: ['locationroles.LocationRoleTypeDescription']
                }
              }
            }
          }
        ]
      }
    }
  },
  ldcLocation: {
    _source: [
      'LocationName',
      'LocationCode',
      'LocationID',
      'Address.AddressLine1',
      'Address.AddressLine2',
      'Address.CityName',
      'Address.StateName',
      'Address.CountryName',
      'Address.PostalCode',
      'locationroles.LocationRoleTypeDescription',
      'Address.AddressID'
    ],
    size: 6,
    from: 0,
    query: {
      bool: {
        must: [
          {
            query_string: {
              fields: [
                'LocationName',
                'LocationCode',
                'Address.CityName',
                'Address.StateName'
              ],
              query: '<!insert value here!>*',
              default_operator: 'AND',
              analyze_wildcard: true
            }
          },
          {
            nested: {
              path: 'locationtypes',
              query: {
                query_string: {
                  default_field: 'locationtypes.LocationSubTypeCode',
                  query: 'LDC'
                }
              }
            }
          }
        ]
      }
    }
  },
  lineOfBusiness: {
    size: 10,
    _source: [
      'OrganizationName',
      'Level',
      'OrganizationID',
      'OrganizationAliasName'
    ],
    query: {
      bool: {
        must: [
          {
            query_string: {
              default_field: 'Level.keyword',
              query: 'Business Line',
              split_on_whitespace: false
            }
          },
          {
            query_string: {
              fields: ['OrganizationName', 'OrganizationAliasName'],
              query: '<!insert value here!>*',
              default_operator: 'AND',
              analyze_wildcard: true
            }
          }
        ]
      }
    },
    aggs: {
      unique: {
        terms: {
          field: 'OrganizationName.keyword',
          size: 5
        },
        aggs: {
          Level: {
            top_hits: {
              _source: {
                includes: [
                  'OrganizationAliasName',
                  'OrganizationName',
                  'Level',
                  'OrganizationID'
                ]
              },
              size: 1
            }
          }
        }
      }
    }
  },
  originRamp: {
    _source: [
      'LocationName',
      'LocationCode',
      'LocationID',
      'Address.AddressLine1',
      'Address.AddressLine2',
      'Address.CityName',
      'Address.StateName',
      'Address.CountryName',
      'Address.PostalCode',
      'locationroles.LocationRoleTypeDescription',
      'Address.AddressID'
    ],
    size: 6,
    from: 0,
    query: {
      bool: {
        must: [
          {
            query_string: {
              fields: [
                'LocationName',
                'LocationCode',
                'Address.CityName',
                'Address.StateName'
              ],
              query: '<!insert value here!>*',
              default_operator: 'AND',
              analyze_wildcard: true
            }
          },
          {
            nested: {
              path: 'locationtypes',
              query: {
                query_string: {
                  default_field:
                    'locationtypes.LocationSubTypeDescription.keyword',
                  query: 'Ramp'
                }
              }
            }
          }
        ]
      }
    }
  },
  originSite: {
    size: 5,
    _source: [
      'LocationName',
      'LocationCode',
      'LocationID',
      'Address.AddressLine1',
      'Address.AddressLine2',
      'Address.CityName',
      'Address.StateName',
      'Address.CountryName',
      'Address.PostalCode',
      'locationroles.LocationRoleTypeDescription',
      'Address.AddressID'
    ],
    query: {
      bool: {
        should: [
          {
            query_string: {
              fields: ['LocationName^6', 'LocationCode^3'],
              query: '<!insert value here!>*',
              default_operator: 'and'
            }
          },
          {
            query_string: {
              fields: [
                'Address.AddressLine1^18',
                'Address.AddressLine2^18',
                'Address.CityName^15',
                'Address.StateName^12',
                'Address.PostalCode^9',
                'Address.CountryName'
              ],
              query: '<!insert value here!>*',
              default_operator: 'and'
            }
          }
        ],
        minimum_should_match: 1,
        must: [
          {
            nested: {
              path: 'locationroles',
              query: {
                query_string: {
                  fields: ['locationroles.LocationRoleTypeDescription'],
                  query: '(Shipper)',
                  split_on_whitespace: false
                }
              },
              inner_hits: {
                size: 1,
                _source: {
                  includes: ['locationroles.LocationRoleTypeDescription']
                }
              }
            }
          }
        ]
      }
    }
  }
};
