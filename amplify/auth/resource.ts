import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    givenName: {
      mutable: true,
      required: true,
    },
    familyName: {
      mutable: true,
      required: true,
    },
    "custom:OrganizationId": {
      dataType: "String",
      mutable: true,
    }
  },

    
  groups: ["ADMINS", "USERS"],

});