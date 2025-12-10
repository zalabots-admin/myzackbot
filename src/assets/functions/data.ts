

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
}

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

}

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
            'id', 'FirstName', 'LastName', 'Email', 'ParticipantRole','RequestTask.RequestTaskStatus', 'RequestTask.id', 'RequestTask.Responses.id', 'RequestTask.Responses.Name', 'RequestTask.Responses.Value', 'RequestTask.Responses.IsDocument'
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
}

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
}

export function formatDate( dateString:string ) {
    const date = new Date( dateString );
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString( undefined, options );
}

export function formatToLocalTime( utcString:string ) {
    const date = new Date( utcString ); 
    return date.toLocaleString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}
