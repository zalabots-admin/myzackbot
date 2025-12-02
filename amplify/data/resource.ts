

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
      Requests: a.hasMany('Request', 'OrganizationID'),
      Items: a.hasMany('Items', 'OrganizationID'),
      Forms: a.hasMany('Forms', 'OrganizationID'),
      Users: a.hasMany('Users', 'OrganizationID'),
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
      EmailResponse: a.boolean(),
      AutoComplete: a.boolean(),
      DeliveryMethod: a.string(),
      DueDate: a.string(),
      RequestStatus: a.string(),
      FollowUpDate: a.string(),
      Organization: a.belongsTo('Organization', 'OrganizationID'),
      History: a.hasMany('RequestHistory', 'RequestID'),
      Participants: a.hasMany('RequestParticipants', 'RequestID'),
      RequestTasks: a.hasMany('RequestTasks', 'RequestID'),
      Questions: a.hasMany('RequestQuestions', 'RequestID'),
    }).authorization(allow => [allow.publicApiKey()]),
    RequestTasks: a
    .model({
      RequestID: a.string().required(),
      Instructions: a.string(),
      RequestTaskStatus: a.string(),
      Request: a.belongsTo('Request', 'RequestID'),
      History: a.hasMany('RequestHistory', 'RequestTaskID'),
      Participants: a.hasMany('RequestParticipants', 'RequestTaskID'),
      Responses: a.hasMany('RequestResponses', 'RequestTaskID'),
    }).authorization(allow => [allow.publicApiKey()]),
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
      index('ParticipantRole').sortKeys(['RequestID'])
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



