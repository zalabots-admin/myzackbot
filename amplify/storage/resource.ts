

import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'Documents',
  access: (allow) => ({
    'organization-logos/*': [
      allow.authenticated.to(['read','write']),
      allow.guest.to(['read'])
    ],
    'organization-documents/*': [
      allow.authenticated.to(['read','write']),
      allow.guest.to(['read'])
    ],
    'request-documents/*': [
      allow.authenticated.to(['read','write']),
      allow.guest.to(['read','write'])
    ]
  })
});