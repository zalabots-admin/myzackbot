

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource'

const client = generateClient<Schema>();

// Handle change for fields as user is typing
//pass event, setData Const, and activeItem index
export function handleDataInputChange( event:any, setData:React.Dispatch<React.SetStateAction<any[]>>, item:number ) {

    setData(( prevItems ) => {
        const updatedItems = [...prevItems];
        updatedItems[item] = { ...updatedItems[item], [event.target.name]: event.target.value };
        return updatedItems;
    });

};

// Handle change for fields as user is typing for filtered data sets
//pass event, setData Const, and id of the item to be updated
export function handleDataInputChangeFiltered( event:any, setData:React.Dispatch<React.SetStateAction<any[]>>, id:string ) {

    setData(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [event.target.name]: event.target.value } : item
      )
    );  

};

export function handleFormDataInputChange( event:any, setData:any, item:number ) {

    setData(( prevItems:any[] ) => {
        const updatedItems = [...prevItems];
        updatedItems[item] = { ...updatedItems[item], Value: event.target.value };
        return updatedItems;
    });

};

export function handleGetDataInputChange( event:any, setData:React.Dispatch<React.SetStateAction<any[]>> ) {

    setData(( prevItems ) => {
        const updatedItems = { ...prevItems };
        updatedItems[event.target.name] = event.target.value;
        return updatedItems;
    });

};

// Get all data for a specific request - Populates Draft Requests
export async function getRequestData( oId:string ) {

    var currentRequest = await client.models.Request.get({ id: oId },
    {
        selectionSet: ['id', 'AccountName', 'RequestedFor', 'createdAt', 'DueDate', 'RequestStatus', 'RequestType', 'FollowUpDate', 'DeliveryMethod', 'EmailResponse', 'AutoComplete', 'FollowUp',
            'Participants.id','Participants.FirstName','Participants.LastName','Participants.Email','Participants.ParticipantRole', 'Participants.EntityName', 'Participants.ParticipantType', 'Participants.RequestTask.Instructions',
            'Questions.id', 'Questions.Name', 'Questions.Description', 'Questions.Label', 'Questions.Order', 'Questions.Options', 'Questions.Type',
            'History.Event','History.Date','History.User','History.Description']
    } );

    if ( currentRequest.data && currentRequest.data.Participants !== undefined && currentRequest.data.Participants !== null ) {
        const participants = currentRequest.data.Participants.map(p => ({ ...p, Instructions: p.RequestTask?.Instructions ?? null}));
        return {
            ...currentRequest,
            data: {
                ...currentRequest.data,
                Participants: participants
            }
        };
    }
    return currentRequest;
};

// Get all tasks for organization - Populates Task Queue
export async function getTasksData( oId:string ) {

    const currentTasks = await client.models.RequestTasks.list({
        limit:500,
        filter: {OrganizationID: { eq: oId }},
        selectionSet: ['id', 'RequestID', 'Instructions', 'RequestTaskStatus', 'createdAt',
            'Request.AccountName', 'Request.RequestedFor', 'Request.DueDate', 
            'Participants.id','Participants.FirstName','Participants.LastName', 'Participants.EntityName','Participants.Email','Participants.ParticipantRole'
        ]
    });  

    currentTasks.data.map( ( task ) => {
        const filteredParticipants = task.Participants.filter( ( participant ) => participant.ParticipantRole === 'Recipient' );
        if ( filteredParticipants[0].EntityName === '' ) {
            (task as any).Assignee = filteredParticipants[0].FirstName + ' ' + filteredParticipants[0].LastName;
        } else {
            (task as any).Assignee = filteredParticipants[0].EntityName;
        }
    });

    return currentTasks.data;

};


export async function getRequestTaskData( oRequestId:string, oTaskId:string ) {

    const currentRequest = await client.models.Request.get({ id: oRequestId },
    {
        selectionSet: ['id', 'AccountName', 'RequestedFor', 'DueDate', 'RequestStatus', 'RequestType', 'FollowUpDate', 'DeliveryMethod', 
            'Questions.id', 'Questions.Name', 'Questions.Description', 'Questions.Label', 'Questions.Order', 'Questions.Options', 'Questions.Type',
            'Organization.id', 'Organization.Name', 'Organization.PrimaryColor', 'Organization.SecondaryColor', 'Organization.Logo']
    } );
    
    const currentTask = await client.models.RequestTasks.get({ id: oTaskId },
    {
        selectionSet: ['RequestTaskStatus', 
            'Responses.id', 'Responses.Name', 'Responses.Value', 'Responses.IsDocument',
            'Participants.id','Participants.FirstName','Participants.LastName','Participants.Email','Participants.ParticipantRole']
    } );

    const enrichedRequest = {
        ...currentRequest,
        data: {
            ...(currentRequest.data as any),
            RequestTask: currentTask.data
        }
    };

    return enrichedRequest;

};

// Get all data for a specific request - Populates Request View
export async function getRequestViewData( oRequestId:string ) {

    const currentRequest = await client.models.Request.get({ id: oRequestId },
    {
        selectionSet: ['id', 'AccountName', 'RequestedFor', 'DueDate', 'RequestStatus', 'RequestType', 'FollowUpDate', 'createdAt',
            'Questions.id', 'Questions.Name', 'Questions.Type', 'Questions.Order',
            'History.Event','History.Date','History.User','History.Description', 'History.RequestTaskID']
    } );
    const currentTasks = await client.models.RequestParticipants.list({
        filter: {
            RequestID: { eq: oRequestId },
            ParticipantRole: { eq: 'Recipient' }
        },
        selectionSet: [
            'id', 'FirstName', 'LastName', 'EntityName', 'Email', 'ParticipantRole','RequestTask.RequestTaskStatus', 'RequestTask.Instructions', 'RequestTask.id', 'RequestTask.Responses.id', 'RequestTask.Responses.Name', 'RequestTask.Responses.Value', 'RequestTask.Responses.IsDocument'
        ]
    });


    const enrichedRequest = {
        ...currentRequest,
        data: {
            ...(currentRequest.data as any),
            RequestTasks: currentTasks.data
        }
    };

    return enrichedRequest;

};

// Get all data for a specific task - Populates Task View
export async function getTaskViewData( oTaskId:string ) {

    const currentTask = await client.models.RequestTasks.get({ id: oTaskId },
    {
        selectionSet: ['id', 'RequestID', 'Instructions', 'RequestTaskStatus', 'createdAt',
            'Request.AccountName', 'Request.RequestedFor', 'Request.DueDate', 'Request.RequestStatus', 'Request.RequestType', 'Request.FollowUpDate',
            'Participants.id','Participants.FirstName','Participants.LastName', 'Participants.EntityName','Participants.Email','Participants.ParticipantRole',
            'Responses.id', 'Responses.Name', 'Responses.Value', 'Responses.IsDocument',
            'Request.Questions.id', 'Request.Questions.Name', 'Request.Questions.Type', 'Request.Questions.Order',
            'Request.History.Event','Request.History.Date','Request.History.User','Request.History.Description', 'Request.History.RequestTaskID'
        ]

    } );

        const filteredParticipants = currentTask.data?.Participants.filter( ( participant ) => participant.ParticipantRole === 'Recipient' );
        if ( filteredParticipants && filteredParticipants[0].EntityName === '' ) {
            (currentTask.data as any).Assignee = filteredParticipants[0].FirstName + ' ' + filteredParticipants[0].LastName;
        } else {
            (currentTask.data as any).Assignee = filteredParticipants ? filteredParticipants[0].EntityName : '';
        }


    return currentTask;

};

// Get all forms and items for organization - Populates Create Request Request Builder
export async function getRequestFormsAndItemsData( oId:string ) {

    const currentFormAndItems = await client.models.Organization.get({ id: oId }, {
        selectionSet: [
            'id', 'Name',
            'Items.id', 'Items.Name', 'Items.Type', 'Items.Label', 'Items.Description', 'Items.Options', 'Items.Layout', 'Items.DocumentId',
            'Forms.id', 'Forms.Name', 'Forms.Type', 'Forms.Description',
            'Forms.FormItems.id', 'Forms.FormItems.Name', 'Forms.FormItems.Type', 'Forms.FormItems.Label', 'Forms.FormItems.Description', 'Forms.FormItems.Options', 'Forms.FormItems.Layout', 'Forms.FormItems.DocumentId', 'Forms.FormItems.Order'
            ]
    });

    return currentFormAndItems.data;

};

// Create a history event for a request or task
export async function createHistoryEvent( oEvent:string, oUser:string, oDescription:string, oRequestId:string, oTaskId:string ) {

    const item = {
        Event: oEvent,
        User: oUser,
        Date: new Date().toISOString(),
        Description: oDescription,
        RequestID: oRequestId,
    };
    if (oEvent === 'Task') {
        (item as any).RequestTaskID = oTaskId;
    }
    const historyEvent = await client.models.RequestHistory.create(item);

    return historyEvent;
};

// Format date to MM/DD/YYYY
export function formatDate( dateString:string ) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

// Format UTC time to local time with AM/PM
export function formatToLocalTime( utcString:string ) {
    const date = new Date( utcString ); 
    return date.toLocaleString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
};
