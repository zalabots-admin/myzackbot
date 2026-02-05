

import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Organization: a
    .model({
      Name: a.string().required(),
      ContactFirstName: a.string(),
      ContactLastName: a.string(),
      ContactEmail: a.string(),
      Address1: a.string(),
      Address2: a.string(),
      City: a.string(),
      State: a.string(),
      ZipCode: a.string(),
      PrimaryColor: a.string(),
      SecondaryColor: a.string(),
      Logo: a.string(),
      NewRequestTemplate: a.string(),
      FollowUpTemplate: a.string(),
      EmailContent: a.string(),
      Requests: a.hasMany('Request', 'OrganizationID'),
      Items: a.hasMany('Items', 'OrganizationID'),
      Forms: a.hasMany('Forms', 'OrganizationID'),
      Users: a.hasMany('Users', 'OrganizationID'),
      Notifications: a.hasMany('Notifications', 'OrganizationID'),
    }).authorization((allow) => [allow.publicApiKey()]),
    Items: a
    .model({
      OrganizationID: a.string().required(),
      Name: a.string().required(),
      Type: a.string().required(),
      Label: a.string().required(),
      Description: a.string(),
      Options: a.string(),
      Layout: a.string(),
      DocumentId: a.string(),
      Organization: a.belongsTo('Organization', 'OrganizationID'),
    }).authorization((allow) => [allow.publicApiKey()]),
    Forms: a
    .model({
      OrganizationID: a.string().required(),
      Name: a.string().required(),
      Type: a.string().required(),
      Description: a.string(),
      FormItems: a.hasMany('FormItems', 'FormID'),
      Organization: a.belongsTo('Organization', 'OrganizationID'),
    }).authorization((allow) => [allow.publicApiKey()]),
    FormItems: a
    .model({
      FormID: a.string().required(),
      Name: a.string().required(),
      Type: a.string().required(),
      Label: a.string().required(),
      Description: a.string(),
      Options: a.string(),
      Layout: a.string(),
      DocumentId: a.string(),
      Order: a.integer(),
      Form: a.belongsTo('Forms', 'FormID'),
    }).authorization((allow) => [allow.publicApiKey()]),
    Request: a
    .model({
      OrganizationID: a.string().required(),
      RequestedFor: a.string(),
      AccountName: a.string(),
      RequestType: a.string(),
      FollowUp: a.boolean(),
      EmailResponse: a.boolean(),
      AutoComplete: a.boolean(),
      DeliveryMethod: a.string(),
      DueDate: a.string(),
      RequestStatus: a.string(),
      FollowUpType: a.string(),
      FollowUpDate: a.string(),
      Organization: a.belongsTo('Organization', 'OrganizationID'),
      History: a.hasMany('RequestHistory', 'RequestID'),
      Participants: a.hasMany('RequestParticipants', 'RequestID'),
      RequestTasks: a.hasMany('RequestTasks', 'RequestID'),
      Questions: a.hasMany('RequestQuestions', 'RequestID'),
      Notifications: a.hasMany('Notifications', 'RequestID'),
    })
    .secondaryIndexes(index => [
      index('FollowUpDate').sortKeys(['RequestStatus'])
    ])
    .authorization(allow => [allow.publicApiKey()]),
    RequestTasks: a
    .model({
      OrganizationID: a.string().required(),
      RequestID: a.string().required(),
      Instructions: a.string(),
      RequestTaskStatus: a.string(),
      Request: a.belongsTo('Request', 'RequestID'),
      History: a.hasMany('RequestHistory', 'RequestTaskID'),
      Participants: a.hasMany('RequestParticipants', 'RequestTaskID'),
      Responses: a.hasMany('RequestResponses', 'RequestTaskID'),
      Notifications: a.hasMany('Notifications', 'RequestTaskID'),
    })
    .secondaryIndexes(index => [
      index('RequestTaskStatus').sortKeys(['RequestID']),
    ])
    .authorization(allow => [allow.publicApiKey()]),
    RequestParticipants: a
    .model({
      RequestID: a.string(),
      RequestTaskID: a.string(),
      EntityName: a.string(),
      FirstName: a.string(),
      LastName: a.string(),
      Email: a.string(),
      ParticipantType: a.string(),
      ParticipantRole: a.string(),
      Request: a.belongsTo('Request', 'RequestID'),
      RequestTask: a.belongsTo('RequestTasks', 'RequestTaskID'),
    })
    .secondaryIndexes(index => [
      index('ParticipantRole').sortKeys(['RequestID']),
      index('ParticipantRole').sortKeys(['RequestTaskID'])
    ])
    .authorization(allow => [allow.publicApiKey()]),
    RequestQuestions: a
    .model({
      RequestID: a.string(),
      Name: a.string(),
      Type: a.string(),
      Label: a.string(),
      Description: a.string(),
      Options: a.string(),
      Layout: a.string(),
      DocumentId: a.string(),
      Order: a.integer(),
      Request: a.belongsTo('Request', 'RequestID'),
    }).authorization(allow => [allow.publicApiKey()]),
    RequestResponses: a
    .model({
      RequestID: a.string(),
      RequestTaskID: a.string(),
      Name: a.string(),
      Value: a.string(),
      IsDocument: a.boolean(),
      RequestTask: a.belongsTo('RequestTasks', 'RequestTaskID'),
    }).authorization(allow => [allow.publicApiKey()]),
    RequestHistory: a
    .model({
      RequestID: a.string(),
      RequestTaskID: a.string(),
      Event: a.string(),
      Date: a.string(),
      User: a.string(),
      Description: a.string(),
      Request: a.belongsTo('Request', 'RequestID'),
      RequestTask: a.belongsTo('RequestTasks', 'RequestTaskID'),
    }).authorization(allow => [allow.publicApiKey()]),
    Users: a
    .model({
      OrganizationID: a.string().required(),
      FirstName: a.string(),
      LastName: a.string(),
      Role: a.string(),
      Active: a.boolean(),
      Organization: a.belongsTo('Organization', 'OrganizationID'),
    })  
    .authorization(allow => [allow.publicApiKey()]),
    Notifications: a
    .model({
      OrganizationID: a.string().required(),
      RequestID: a.string().required(),
      RequestTaskID: a.string(),
      Type: a.string(),
      Message: a.string(),
      Read: a.boolean(),
      Date: a.string(),
      Organization: a.belongsTo('Organization', 'OrganizationID'),
      Request: a.belongsTo('Request', 'RequestID'),
      RequestTask: a.belongsTo('RequestTasks', 'RequestTaskID'),
    })  
    .authorization(allow => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});



