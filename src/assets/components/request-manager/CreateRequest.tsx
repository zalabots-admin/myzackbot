
import { useEffect, useState } from 'react';
import { getRequestData, createHistoryEvent, handleGetDataInputChange, handleDataInputChangeFiltered, getRequestFormsAndItemsData } from '../../functions/data'
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource.ts'
import { DndContext, DragEndEvent, /*useSensor, useSensors, MouseSensor, TouchSensor*/ } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { arrayMove, } from '@dnd-kit/sortable';
import BeatLoader from "react-spinners/BeatLoader";
import DataInputs from '../data-objects/DataInputs'
import Input from '../data-objects/Input';
import Select from '../data-objects/Select';
import Document from '../data-objects/Document.tsx';
import { DraggableListItem } from '../RequestItems'
import ZackbotEditor from '../Editor.tsx';
import  SearchBar from '../SearchBar'
import ToggleSwitch from '../../components/Toggle';
import RightSidePanel from '../SideBar';
import { IconButtonMedium, SmallButton, StandardButton } from '../../components/Buttons';
import { Tab, Panel } from '../Tabs.tsx';
import Papa from "papaparse";
import { Slide, ToastContainer, toast } from 'react-toastify';


interface Prop {
  oUser: any;
  oCloseTab: any;
  oOpenTabs: any;
  oActiveIndex: number;
  oCurrentTab: number;
  oSetOpenTabs: any;
  oPanelId: string;
}

const typeSelect = ['Text Field|text','Date Field|date','Number Field|number','Dropdown Menu|select', 'File Upload|file']
//const followUpSelect = ['Weekly (Begining of Week)|Weekly-Start','Weekly (End of Week)|Weekly-End','One & Three Days Out|Three/One','Daily|Daily', 'On This Date|Date']
const client = generateClient<Schema>();

function CreateRequest(props: Prop) {

    const [requestData, setRequestData] = useState<any>( { DeliveryMethod: 'Standard', RequestType: 'Standard' } );
    const [requestTasks, setRequestTasks] = useState<any[]>( [] );
    const [requestParticipants, setRequestParticipants] = useState<any[]>( [] );
    const [requestQuestions, setRequestQuestions] = useState<any[]>( [] );
    const [itemData, setItemData] = useState<any[]>( [{id:'1', Name:'Custom Question', Type:'custom'}] );
    const [searchedValue, setSearchedValue] = useState( "" );
    const [loading, setLoading] = useState( true );
    const [sidebarOpen, setSideBarOpen] = useState( false );
    const [activeItem, setActiveItem] = useState( '' );
    const [tabs, setTabs] = useState([{id: '1', name: 'Questions', show:true}, {id: '2', name: 'Tasks', show:true, status: 'N/A'}, {id: '3', name: 'Responses', show:false, status: 'N/A'}]); // Tabs for request builder
    const [activeTab, setActiveTab] = useState(0);
    const [activeTabId, setActiveTabId] = useState('1');
    const notify = () => toast("Request Saved Successfully!");


    async function getItems() {

        const allRequestItems: any = await getRequestFormsAndItemsData( props.oUser.OrgId );
        const RequestItems: any[] = [...itemData]

        allRequestItems.Items.map( ( item: any ) => {
            RequestItems.push( item );
        });
        allRequestItems.Forms.map( ( form: any ) => {
            RequestItems.push( form );
        });

        const sortedItems = RequestItems.filter((item: any) => item.Type != 'custom').sort((a: any, b: any) => a['Name'].localeCompare(b['Name']));
        const customItems = RequestItems.filter((item: any) => item.Type === 'custom');
        setItemData( [...customItems, ...sortedItems] );
        setLoading( false );

    };

    async function getRequest( oId:string )  {

        const currentRequest: any = await getRequestData( oId );

        if ( currentRequest.data.EmailResponse ) {
            setTabs( prevItems => prevItems.map( tab => tab.name === 'Responses' ? { ...tab, show:true } : tab ) );
        }
        setRequestData( currentRequest.data );
        const sortedParticipants = (currentRequest.data as any)?.Participants?.sort((a: any, b: any) => a['FirstName'].localeCompare(b['FirstName']));
        setRequestParticipants( sortedParticipants ?? [] );
        const sortedItems = (currentRequest.data as any)?.Questions?.sort((a: any, b: any) => Number(a.Order) - Number(b.Order));
        setRequestQuestions( sortedItems ?? [] );
        const sortedTasks = (currentRequest.data as any)?.RequestTasks?.sort((a: any, b: any) => Number(a.Number) - Number(b.Number));
        setRequestTasks( sortedTasks ?? [] );

    }

    function handleViewSidebar() {

        setSideBarOpen(!sidebarOpen);

    };

    function clickTab( index:number, id:string ) {

        setActiveTab( index );
        setActiveTabId( id );

    }

    function handleDragEnd ( event: DragEndEvent ) {
        
        const { active, over } = event;
        var clone: any = {};

        if (!over) return;
        if (over.id === 'canvas') {
            const original = itemData.find((item) => item.id === active.id);
            if (original) {
                if (original.Type === 'form') {
                    const formItems:any = [...requestQuestions];
                    original.FormItems.sort((a: any, b: any) => a['Order'] - b['Order']).map((formItem: any) => {
                        clone = {
                            id: 'Temp' + uuidv4(),
                            Name: formItem.Name,
                            Type: formItem.Type,
                            Label: formItem.Label,
                            Description: formItem.Description,
                            Options: formItem.Options,
                            Layout: formItem.Layout,
                            DocumentId: formItem.DocumentId,
                            Order: requestQuestions.length + 1,
                            ItemID: formItem.ItemID
                        };
                        formItems.push(clone);
                    });
                        setRequestQuestions(formItems);
                } else if ( original.Type === 'custom' ) {
                    clone = {
                        id: 'Temp' + uuidv4(),
                        Name: original.Name,
                        Type: 'text',
                        Label: '',
                        Description: '',
                        Options: '',
                        Layout: '',
                        DocumentId: '',
                        Order: requestQuestions.length + 1,
                        ItemID: 'custom'
                    }
                    setActiveItem( clone.id );
                    handleViewSidebar();
                    setRequestQuestions((prev:any) => [...prev, clone]);
                } else {
                    clone = {
                        id: 'Temp' + uuidv4(),
                        Name: original.Name,
                        Type: original.Type,
                        Label: original.Label,
                        Description: original.Description,
                        Options: original.Options,
                        Layout: original.Layout,
                        DocumentId: original.DocumentId,
                        Order: requestQuestions.length + 1,
                        ItemID: original.id
                    };
                    setActiveItem( clone.id );
                    setRequestQuestions((prev:any) => [...prev, clone]);
                }
                
            }
        } else if (active.id !== over.id) {
            const oldIndex = requestQuestions.findIndex((i) => i.id === active.id);
            const newIndex = requestQuestions.findIndex((i) => i.id === over.id);
            setRequestQuestions(arrayMove(requestQuestions, oldIndex, newIndex));
        };
    }

    function handleToggleFollowUp(checked: boolean) {
    
        if ( checked === false ) {
            const updatedRequestData = { ...requestData, FollowUpDate: "", FollowUp: false };
             setRequestData( updatedRequestData );
        } else {
            const updatedRequestData = { ...requestData, FollowUp: true };
            setRequestData( updatedRequestData );
        }
       
    };

    function handleToggleEmailResponse(checked: boolean) {
 
        if ( checked === false ) {
            requestParticipants.filter(participant => participant.ParticipantRole === 'Receiver').map( async ( participant ) => {
                if ( !participant.id.startsWith('Temp') ) {
                    await client.models.RequestParticipants.delete({ id: participant.id });
                } 
            });
            setRequestParticipants(prev =>
                prev.filter(p => p.ParticipantRole !== 'Receiver')
            );
            const updatedTabs = [...tabs];
            const responseTabIndex = updatedTabs.findIndex(tab => tab.name === 'Responses');
            if (responseTabIndex !== -1) {
                updatedTabs[responseTabIndex].show = false;
                setTabs(updatedTabs);
                if (activeTabId === updatedTabs[responseTabIndex].id) {
                    setActiveTab(0);
                    setActiveTabId(updatedTabs[0].id);
                }
            }
        } else {
            addParticipant( 'Receiver', '' );
            const updatedTabs = [...tabs];
            const responseTabIndex = updatedTabs.findIndex(tab => tab.name === 'Responses');
            if (responseTabIndex !== -1) {
                updatedTabs[responseTabIndex].show = true;
                setTabs(updatedTabs);
                //setActiveTab( responseTabIndex );
                //setActiveTabId( updatedTabs[responseTabIndex].id );
            }
        }

        const updatedRequestData = { ...requestData, EmailResponse: checked };
        setRequestData( updatedRequestData );

  
    }

    function handleToggleAutoComplete(checked: boolean) {

        //setAutoComplete(checked);
        const updatedRequestData = {
            ...requestData,
            AutoComplete: checked,
        };
        setRequestData( updatedRequestData );

    }   

    function handleParticipantTypeChange( oId:string, oType:string ) {

        const copyParticipants = [...requestParticipants];
        const index = copyParticipants.findIndex(participant => participant.id === oId);
        copyParticipants[index].ParticipantType = oType;
        setRequestParticipants(copyParticipants);

    }

    async function handleDocumentChange( event:any ) {

        if ( event.size > 0 && event.size < 5242880 ) {
            Papa.parse(event, {
            header: true,        // Treat first row as keys
            skipEmptyLines: true,
            dynamicTyping: true, // Convert numbers automatically
            complete: ( result:any ) => {
                for ( let i = 0; i < result.data.length; i++ ) {
                    if ( result.data[i].EntityName !== '' && result.data[i].EntityName != null ) {
                        result.data[i].ParticipantType = 'Entity';
                    } else {
                        result.data[i].ParticipantType = 'Individual';
                    }
                    result.data[i].id = 'T' + uuidv4();
                    result.data[i].ParticipantRole = 'Recipient';
                }
                setRequestParticipants(result.data);
            },
            error: ( error:any ) => {
                console.error("Parse error:", error);
            }
            });
        } else {
            alert('File size exceeds 5MB limit. Please select a smaller file.');
        };

    }

    async function handleDownload() {
        
        const fileUrl = import.meta.env.VITE_DOC_URL + 'zackbot-documents/ZBT_TaskUpload_Template.csv' ; // your file URL
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = 'ZBT_TaskUpload_Template.csv'; // suggested filename
        link.click();
        window.URL.revokeObjectURL(url);

    };

    function addRequestTask() {

        const newTaskId = 'Temp' + uuidv4();
        const copyRequestTasks = [...requestTasks];
        copyRequestTasks.push( { id: newTaskId, Instructions: '', Number: copyRequestTasks.length + 1 } )
        setRequestTasks( copyRequestTasks );
        addParticipant( 'Recipient', newTaskId );
    };

    function duplicateRequestTask( oTask:string ) {

        const newTaskId = 'Temp' + uuidv4();
        const copyRequestTasks = [...requestTasks];
        const tasksToDuplicate = copyRequestTasks.filter(task => task.id === oTask ) 
        setRequestTasks((prev:any) => [...prev, ...tasksToDuplicate.map((task:any) => ({ ...task, id: newTaskId, Number: prev.length + 1 }))]);
        const recipientsToDuplicate = requestParticipants.filter(participant => participant.RequestTaskID === oTask);
        recipientsToDuplicate.map( recipient => {
            duplicateParticipant( recipient.id, newTaskId );
        });
    }

    function deleteRequestTask(oId: string) {

        const copyRequestTasks = [...requestTasks];
        const recipientsToDelete = requestParticipants.filter(participant => participant.RequestTaskID === oId);
        const index = copyRequestTasks.findIndex(task => task.id === oId);

        if (copyRequestTasks[index].id.startsWith('Temp')) {
            setRequestTasks((prevItems: any) => {
                const filtered = prevItems.filter((item: any) => item.id !== oId);
                return filtered.map((item: any, i: number) => ({ ...item, Number: i + 1 }));
            });
        } else {
            setRequestTasks((prevItems: any) => {
                const updated = prevItems.map((item: any) =>
                    item.id === oId ? { ...item, deleted: true } : item
                );
                // Only renumber non-deleted items, keep deleted items in place
                let counter = 1;
                return updated.map((item: any) => 
                    item.deleted ? item : { ...item, Number: counter++ }
                );
            });
        }

        recipientsToDelete.forEach(recipient => {
            deleteParticipant(recipient.id);
        });
    }

    function addParticipant( oType:string, oTask:string,) {

        const copyRequestParticipants = [...requestParticipants];
        if ( oType === 'Recipient' ) {
            copyRequestParticipants.push( { id:'Temp' + uuidv4(), FirstName: '', LastName: '', EntityName: '', Email: '', ParticipantRole: oType, ParticipantType: 'Individual', RequestTaskID: oTask } )
        } else {
            copyRequestParticipants.push( { id:'Temp' + uuidv4(), FirstName: '', LastName: '', EntityName: '', Email: '', ParticipantRole: oType, ParticipantType: 'Individual' } )
        }
        setRequestParticipants( copyRequestParticipants );
        
        if ( oType === 'Recipient' ) {
            const copyRecipients = copyRequestParticipants.filter(participant => participant.ParticipantRole === 'Recipient')
            const copyRequestData = { ...requestData };
            if ( copyRecipients.length > 1 ) {
                copyRequestData.RequestType = 'Batch';
            } else {
                copyRequestData.RequestType = 'Standard';
            }
            setRequestData( copyRequestData );
        }

    };

    function duplicateParticipant( oRecipient:string, oTask?:string  ) {

        const newParticipantId = 'Temp' + uuidv4();
        const copyRequestParticipants = [...requestParticipants];
        const participantsToDuplicate = copyRequestParticipants.filter(participant => participant.id === oRecipient )
        setRequestParticipants((prev:any) => [...prev, ...participantsToDuplicate.map((participant:any) => ({ ...participant, id: newParticipantId, RequestTaskID: oTask ? oTask : participant.RequestTaskID }))]);

    }

    function deleteParticipant( oId:string ) {

        const copyParticipants = [...requestParticipants];
        const index = copyParticipants.findIndex(participant => participant.id === oId);
        if ( copyParticipants[index].id.startsWith('Temp') ) {
            setRequestParticipants((prevItems:any) => prevItems.filter((item:any) => item.id !== oId));
        } else {
            setRequestParticipants((prevItems:any) =>
                prevItems.map((item:any) =>
                item.id === oId ? { ...item, deleted: true } : item
                )
            );
        }

    };

    async function saveRequest(oStatus: string) {

        var request: string | any = {};
        if (requestData.id === undefined) {
            request = await client.models.Request.create({ ...requestData, RequestStatus: oStatus, OrganizationID: props.oUser.OrgId });
        } else {
            request = await client.models.Request.update({ ...requestData, RequestStatus: oStatus });
        }
        const requestId = request.data?.id;
        if (oStatus === 'Active') {
            await createHistoryEvent('Request', props.oUser.firstName + ' ' + props.oUser.lastName, 'Request Created for ' + requestData.AccountName, requestId ?? '', '', '', 'Request Created' );
        }
        const copyRequestTasks = [...requestTasks];
        const copyParticipants = [...requestParticipants];

        // ✅ await all task operations
        await Promise.all(copyRequestTasks.map(async (task) => {

            // ✅ capture original ID before slicing for participant matching
            const originalTaskId = task.id;

            if (task.id.startsWith('Temp')) {
                task.id = task.id.slice(4);
                const newTask = await client.models.RequestTasks.create({ id: task.id, OrganizationID: props.oUser.OrgId, RequestID: requestId, RequestTaskStatus: 'New', Instructions: task.Instructions, Number: task.Number });
                const taskId = newTask.data?.id;
                await createHistoryEvent('Task', 'ZackBot', 'Task ' + (task.Instructions === '' ? '' : '(' + task.Instructions + ')') + ' Created for ' + requestData.AccountName + "'s Request", requestId ?? '', task.id, '', 'Task Created' );

                // ✅ match on originalTaskId (still has 'Temp' prefix), slice participant id only
                await Promise.all(copyParticipants
                    .filter(p => p.RequestTaskID === originalTaskId && p.ParticipantRole === 'Recipient')
                    .map(async (participant) => {
                        if (participant.id.startsWith('Temp')) {
                            participant.id = participant.id.slice(4);
                            participant.RequestTaskID = taskId;
                            await client.models.RequestParticipants.create({ id: participant.id, RequestID: requestId, RequestTaskID: taskId, FirstName: participant.FirstName, LastName: participant.LastName, EntityName: participant.EntityName, Email: participant.Email, ParticipantRole: participant.ParticipantRole, ParticipantType: participant.ParticipantType, Status: 'New' });
                        } else if (participant.deleted) {
                            await client.models.RequestParticipants.delete({ id: participant.id });
                        } else {
                            await client.models.RequestParticipants.update({ id: participant.id, FirstName: participant.FirstName, LastName: participant.LastName, EntityName: participant.EntityName, Email: participant.Email, ParticipantRole: participant.ParticipantRole, ParticipantType: participant.ParticipantType });
                        }
                    })
                );

            } else if (task.deleted) {
                await client.models.RequestTasks.delete({ id: task.id });

                await Promise.all(copyParticipants
                    .filter(p => p.RequestTaskID === originalTaskId && p.ParticipantRole === 'Recipient')
                    .map(async (participant) => {
                        if (!participant.id.startsWith('Temp')) {
                            await client.models.RequestParticipants.delete({ id: participant.id });
                        }
                    })
                );

            } else {
                await client.models.RequestTasks.update({ id: task.id, Instructions: task.Instructions, Number: task.Number });

                await Promise.all(copyParticipants
                    .filter(p => p.RequestTaskID === originalTaskId && p.ParticipantRole === 'Recipient')
                    .map(async (participant) => {
                        if (participant.id.startsWith('Temp')) {
                            participant.id = participant.id.slice(4);
                            participant.RequestTaskID = task.id;
                            await client.models.RequestParticipants.create({ id: participant.id, RequestID: requestId, RequestTaskID: task.id, FirstName: participant.FirstName, LastName: participant.LastName, EntityName: participant.EntityName, Email: participant.Email, ParticipantRole: participant.ParticipantRole, ParticipantType: participant.ParticipantType, Status: 'New' });
                        } else if (participant.deleted) {
                            await client.models.RequestParticipants.delete({ id: participant.id });
                        } else {
                            await client.models.RequestParticipants.update({ id: participant.id, FirstName: participant.FirstName, LastName: participant.LastName, EntityName: participant.EntityName, Email: participant.Email, ParticipantRole: participant.ParticipantRole, ParticipantType: participant.ParticipantType });
                        }
                    })
                );
            }
        }));

        // ✅ await non-recipient participants
        await Promise.all(copyParticipants
            .filter(p => p.ParticipantRole === 'Receiver')
            .map(async (participant) => {
                if (participant.id.startsWith('Temp')) {
                    participant.id = participant.id.slice(4);
                    await client.models.RequestParticipants.create({ id: participant.id, RequestID: requestId, FirstName: participant.FirstName, LastName: participant.LastName, EntityName: participant.EntityName, Email: participant.Email, ParticipantRole: participant.ParticipantRole, ParticipantType: participant.ParticipantType, Status: 'New' });
                } else if (participant.deleted) {
                    await client.models.RequestParticipants.delete({ id: participant.id });
                } else {
                    await client.models.RequestParticipants.update({ id: participant.id, FirstName: participant.FirstName, LastName: participant.LastName, EntityName: participant.EntityName, Email: participant.Email, ParticipantRole: participant.ParticipantRole, ParticipantType: participant.ParticipantType });
                }
            })
        );

        // ✅ await questions
        const copyRequestQuestions = [...requestQuestions];
        await Promise.all(copyRequestQuestions.map(async (item, index) => {
            if (item.id.startsWith('Temp')) {
                item.id = item.id.slice(4);
                await client.models.RequestQuestions.create({ ...item, RequestID: requestId, Order: index + 1 });
            } else if (item.deleted) {
                await client.models.RequestQuestions.delete({ id: item.id });
            } else {
                await client.models.RequestQuestions.update({ ...item, Order: index + 1 });
            }
        }));

        setRequestQuestions(copyRequestQuestions);
        setRequestParticipants(copyParticipants);
        setRequestTasks(copyRequestTasks);
        setRequestData({ ...requestData, id: requestId, RequestStatus: oStatus });

        if (oStatus === 'Active') {
            await client.models.MessageQueue.create({ RecordID: requestId, Type: 'Request', Event: 'New_Request', OrganizationID: props.oUser.OrgId });
            props.oCloseTab(props.oCurrentTab);
        } else {
            notify();
            props.oSetOpenTabs((prevItems: any) => {
                const updatedItems = [...prevItems];
                updatedItems[props.oCurrentTab] = { ...updatedItems[props.oCurrentTab], name: requestData.RequestedFor, status: oStatus };
                return updatedItems;
            });
        }

        //await client.models.Request.update({ id: requestId, RequestStatus: oStatus });
    };

    async function deleteDraftRequest() {

        await client.models.Request.delete({ id: requestData.id });
        props.oCloseTab( props.oCurrentTab );
        
    };

    /*const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
            distance: 5, // require 5px movement before drag starts
            },
        }),

        useSensor(TouchSensor, {
            activationConstraint: {
            delay: 150,     // press-and-hold for 150ms
            tolerance: 5,   // allow 5px movement during delay
            },
        })
    );*/

    useEffect(() => { 

        if ( props.oOpenTabs[props.oCurrentTab].status != 'New' ) {
            getRequest( props.oOpenTabs[props.oCurrentTab].id );
        };
        getItems();

    },[props.oUser]);

    useEffect(() => {

        if ( requestData.DeliveryMethod === 'Standard' ) {
        const updatedTabs = [...tabs];
            const responseTabIndex = updatedTabs.findIndex(tab => tab.name === 'Tasks');
            if (responseTabIndex !== -1) {
                updatedTabs[responseTabIndex].show = true;
                setTabs(updatedTabs);
                if (activeTabId === updatedTabs[responseTabIndex].id) {
                    setActiveTab(0);
                    setActiveTabId(updatedTabs[0].id);
                }
            }
        } else {
            const updatedTabs = [...tabs];
            const responseTabIndex = updatedTabs.findIndex(tab => tab.name === 'Tasks');
            if (responseTabIndex !== -1) {
                updatedTabs[responseTabIndex].show = false;
                setTabs(updatedTabs);
            }
        }
    }, [requestData.DeliveryMethod]);


  return (
    
    <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
        {/*Request Details*/}
        <div className="flex-1 flex flex-col min-h-0 w-1/4 p-4 pr-2">
            <section className="flex-1 flex flex-col bg-white p-6 rounded shadow overflow-y-auto border border-gray-300">
                <Input oKey="AccountName" oType="text" oLabel="Account Name:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.AccountName} />
                <Input oKey="RequestedFor" oType="text" oLabel="Information Is Requested For:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.RequestedFor} />
                <Input oKey="DueDate" oType="date" oLabel="Due Date:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.DueDate} />
                <Select oKey="DeliveryMethod" oLabel="Delivery Type:" oOptions={['Manual','Standard']} oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.DeliveryMethod} />
                <ToggleSwitch label="Email Task Response on Submit" checked={requestData.EmailResponse} onChange={handleToggleEmailResponse} onColor="#4E6E5D" offColor="#CCCCCC" />
                <ToggleSwitch label="Auto Complete Request When All Tasks Are Completed" checked={requestData.AutoComplete} onChange={handleToggleAutoComplete} onColor="#4E6E5D" offColor="#CCCCCC" />
                <ToggleSwitch label="Send Task Assignee Follow-Up Reminder" checked={requestData.FollowUp} onChange={handleToggleFollowUp} onColor="#4E6E5D" offColor="#CCCCCC" />
                {/*{ requestData.FollowUp && (
                    <Select oKey="FollowUpType" oLabel="Follow Up Cadence:" oOptions={followUpSelect} oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.FollowUpType} />
                )}
                { requestData.FollowUpType === 'Date' && (
                    <Input oKey="FollowUpDate" oType="date" oLabel="Follow Up Date:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.FollowUpDate} />
                )}*/}
                {requestData.FollowUp && (
                    <Input oKey="FollowUpDate" oType="date" oLabel="Follow Up Date:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.FollowUpDate} />
                )}
            </section>
        </div>
        {/*Request Builder*/}
        <div className='flex flex-col min-h-0 w-3/4 p-4 pl-2'>
            <section className="flex-1 flex flex-col bg-white px-6 py-4 rounded shadow overflow-y-auto border border-gray-300">
                {/*Header & Buttons*/}
                <div className="flex justify-start items-center mb-2">
                    <div className="w-[80%] flex items-center">
                        <p className="h2 text-xl">Request Builder</p>
                    </div>
                    <div className="w-[20%] flex justify-end items-center">
                        
                        { requestData.RequestStatus === 'Draft' && (
                            <IconButtonMedium
                                oAction={deleteDraftRequest}
                                oTitle="Delete Request"
                                oIcon="fa-sharp fa-regular fa-trash"
                            />
                        )}
                        <IconButtonMedium
                            oAction={() => {saveRequest( 'Active' )}}
                            oTitle="Send Request"
                            oIcon="fa-sharp fa-regular fa-paper-plane-top"
                        />
                        <IconButtonMedium
                            oAction={() => {saveRequest( 'Draft' )}}
                            oTitle="Save Request"
                            oIcon="fa-sharp fa-regular fa-floppy-disk"
                        />
                        <IconButtonMedium
                            oAction={() => {props.oCloseTab( props.oCurrentTab )}}
                            oTitle="Close Request"
                            oIcon="fa-sharp fa-regular fa-xmark"
                        />
                    </div> 
                </div>
                <div id="tabs" className="flex flex-row bg-white">
                    {tabs.map((tab, index) => (
                        <Tab oAction={() => clickTab(index,tab.id)} oIndex={index} oText={tab.name} oIsActive={activeTab === index} oState={tab.show} oCustomClass="w-[125px] text-center" />
                    ))}
                    <div className="border-b border-gray-300 flex-grow "></div>
                </div>
                <div id="panels" className="flex-1 flex min-h-0 p-4">
                    <Panel oIsActive={activeTabId === '1'} oIndex={'1'} oState={tabs.find(tab => tab.id === '1')?.show}>
                        <div id="panel-Questions" className='flex-1 flex flex-col min-h-0 overflow-hidden p-4'>
                            <DndContext onDragEnd={handleDragEnd}>
                                <div className="flex-1 flex flex-row min-h-0 gap-4 p-4overflow-y-auto overflow-x-hidden" >
                                    { loading ? (
                                        <div className='h-full w-full flex justify-center items-center'>
                                            <BeatLoader color = "#EB7100" />
                                        </div>
                                    ) : (
                                        <div className='flex-1 flex flex-col w-1/3'>
                                            <div className='w-full'>
                                                <SearchBar
                                                    oSearchedValue={searchedValue}
                                                    oSetSearchedValue={setSearchedValue}
                                                />
                                            </div>
                                            <div>
                                                {itemData.filter((row:any) => row.Name.toString().toLowerCase().includes(searchedValue.toString().toLowerCase())).map(( item:any ) => (
                                                    <DraggableListItem oKey={item.id} oName={item.Name} oType={item.Type} oActive={true} oDescription={item.Description} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-col w-2/3">
                                      
                                            <ZackbotEditor oItems={requestQuestions} oSetItems={setRequestQuestions} oIsEditable={true} oClick={setRequestQuestions} oSetActive={setActiveItem} oOpenSidePanel={handleViewSidebar} />
                                        
                                    </div>
                                </div>
                            </DndContext>
                        </div>
                    </Panel>
                    <Panel oIsActive={activeTabId === '2'} oIndex={'2'} oState={tabs.find(tab => tab.id === '2')?.show}>
                        <div id="panel-Tasks" className='flex-1 flex flex-col min-h-0 overflow-hidden'>
                            <div className="flex-1 flex flex-col min-h-0 p-4">
                                <div className="p-2">
                                    <p>Upload Multiple Tasks Using the Upload Template or Individually Add Tasks Using the 'Add Task' Button</p>
                                    <div className="flex items-center w-full">
                                        <div className="flex justify-start w-[60%]">
                                            <Document isRequired={false}  oSize="col12" isEditable={true} oChange={(e) => handleDocumentChange(e)}  oData={{ UploadText: 'Drag & Drop or Click to Upload (5MB Limit)', DocumentId: '1', Label: '',  }}  />
                                        </div>
                                        <div className="flex justify-start w-[10%]">
                                            <IconButtonMedium
                                                oAction={handleDownload}
                                                oTitle="Download Template"
                                                oIcon="fa-sharp fa-regular fa-download"
                                            />
                                        </div>
                                        <div className="flex justify-end items-center w-[30%]">
                                            <SmallButton
                                                oAction={() => addRequestTask()}
                                                oText="Add Task"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col p-2 overflow-y-auto">
                                    
                                    {requestTasks.filter(task => !task.deleted).map( ( task, index ) => {
                                        task.Number = index + 1;
                                        return (
                                            <div key={task.id} className="w-full flex items-center bg-[#00556620] border border-gray-300 p-4 mb-2 rounded shadow">
                                                <div className="w-[10%] h-full flex flex-col items-center justify-start pt-2 text-[#005566]">
                                                    <p>Task</p>
                                                    <p className='text-2xl font-bold'>{task.Number}</p>
                                                </div>
                                                <div className="w-[80%] h-full flex flex-col items-start justify-start gap-4">
                                                    <Input oKey='Instructions' oType='text' oLabel="Unique Task Instructions" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestTasks, task.id)} oData={task.Instructions} />
                                                    {requestParticipants.filter(participant => participant.RequestTaskID === task.id && !participant.deleted).map( ( participant, index ) => (
                                                        <div key={participant.id} className="w-full flex items-center bg-gray-100 border border-gray-300 p-2 mt-2 rounded shadow">
                                                            <div className="w-[12%] flex flex-row items-center justify-start pl-2">Recipient {index + 1}:</div>
                                                            <div className="w-[85%] flex flex-row items-center justify-center gap-2">
                                                                {participant.ParticipantType === 'Individual' ? (
                                                                    <>
                                                                        <div className="w-[18%] flex flex-row items-center justify-center">
                                                                            <i className={"fa-classic fa-regular fa-user text-3xl cursor-pointer text-[#005566]"} title="Individual Task"></i>
                                                                            <i className={"fa-classic fa-regular fa-building text-3xl cursor-pointer text-[#DADADA]  hover:text-[#EB7100]"} title="Entity Task" onClick={() => {handleParticipantTypeChange(participant.id, 'Entity')}}></i>
                                                                        </div>
                                                                        <div className="w-[55%] flex flex-row items-center justify-center">
                                                                            <Input oKey='FirstName' oType='text' oLabel="First Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.FirstName} />
                                                                            <Input oKey='LastName' oType='text' oLabel="Last Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.LastName} />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="w-[18%] flex flex-row items-center justify-center">
                                                                            <i className={"fa-classic fa-regular fa-user text-3xl cursor-pointer text-[#DADADA] hover:text-[#EB7100]"} title="Individual Task" onClick={() => {handleParticipantTypeChange(participant.id, 'Individual')}}></i>
                                                                            <i className={"fa-classic fa-regular fa-building text-3xl cursor-pointer text-[#005566]"} title="Entity Task"></i>
                                                                        </div>
                                                                        <div className="w-[55%] flex flex-row items-center justify-center">
                                                                            <Input oKey='EntityName' oType='text' oLabel="Entity Name" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.EntityName} />
                                                                        </div>
                                                                    </>
                                                                )}
                                                                <div className="w-[45%] flex flex-row items-center justify-center">
                                                                    <Input oKey='Email' oType='text' oLabel="Email" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.Email} />
                                                                </div>
                                                            </div>
                                                            <div className="w-[5%] flex flex-row items-center justify-end pr-2">
                                                                <i className={"fa-sharp fa-regular fa-xmark text-2xl cursor-pointer text-[#005566]  hover:text-[#EB7100]"} title="Remove Recipient" onClick={() => {deleteParticipant(participant.id)}}></i>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="w-[10%] h-full flex flex-col items-center justify-start gap-2">
                                                    <IconButtonMedium
                                                        oAction={() => {addParticipant('Recipient',task.id)}}
                                                        oTitle="Add Recipient"
                                                        oIcon="fa-classic fa-regular fa-user-circle-plus"
                                                    />
                                                    <IconButtonMedium
                                                        oAction={() => {duplicateRequestTask(task.id)}}
                                                        oTitle="Duplicate Task"
                                                        oIcon="fa-sharp fa-regular fa-clone-plus"
                                                    />
                                                    <IconButtonMedium
                                                        oAction={() => {deleteRequestTask(task.id)}}
                                                        oTitle="Delete Task"
                                                        oIcon="fa-sharp fa-regular fa-xmark"
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </Panel>
                    <Panel oIsActive={activeTabId === '3'} oIndex={'3'} oState={tabs.find(tab => tab.id === '3')?.show}>
                        <div id="panel-Responses" className="flex-1 flex flex-col min-h-0 overflow-hidden w-full" >
                            <div className="flex justify-between items-center w-full p-4">
                                <p>Response Recipients Will Receive Completed Task Responses via Email.</p>
                                <SmallButton
                                    oAction={() => addParticipant('Receiver', '')}
                                    oText="Add Recipient"
                                />
                            </div>
                            <div className="flex-1 flex flex-col p-2 overflow-y-auto">
                                {requestParticipants.filter(participant => participant.ParticipantRole === 'Receiver' && !participant.deleted).map( ( participant, index ) => (
                                    <div key={index} className="w-full flex items-center bg-[#00556620] border border-gray-300 p-4 mb-2 rounded shadow">
                                        <div className="w-[8%] h-full flex flex-col items-center justify-center text-[#005566]">
                                            <p>Recipient</p>
                                            <p className="text-3xl font-bold">{index + 1}</p>
                                        </div>
                                        <div className="w-[88%] flex items-center">
                                            <div className="w-[65%] flex items-center">
                                                {participant.ParticipantType === 'Individual' ? (
                                                    <>
                                                        <div className="w-[25%] flex flex-row items-center justify-center">
                                                            <i className={"fa-classic fa-regular fa-user text-3xl cursor-pointer text-[#005566]"} title="Individual Task"></i>
                                                            <i className={"fa-classic fa-regular fa-building text-3xl cursor-pointer text-gray-400 hover:text-[#EB7100]"} title="Entity Task" onClick={() => {handleParticipantTypeChange(participant.id, 'Entity')}}></i>
                                                        </div>
                                                        <div className="w-[75%] flex flex-row items-center justify-center">
                                                            <Input oKey='FirstName' oType='text' oLabel="First Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.FirstName} />
                                                            <Input oKey='LastName' oType='text' oLabel="Last Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.LastName} />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-[25%] flex flex-row items-center justify-center">
                                                            <i className={"fa-classic fa-regular fa-user text-3xl cursor-pointer text-gray-400 hover:text-[#EB7100]"} title="Individual Task" onClick={() => {handleParticipantTypeChange(participant.id, 'Individual')}}></i>
                                                            <i className={"fa-classic fa-regular fa-building text-3xl cursor-pointer text-[#005566]"} title="Entity Task"></i>
                                                        </div>
                                                        <div className="w-[75%] flex flex-row items-center justify-center">
                                                            <Input oKey='EntityName' oType='text' oLabel="Entity Name" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.EntityName} />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="w-[35%] flex items-center">
                                                <Input oKey='Email' oType='text' oLabel="Email" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.Email} />
                                            </div>
                                        </div>
                                        <div className="w-[4%] h-full flex flex-col items-center justify-center">
                                            <i className={"fa-sharp fa-regular fa-xmark text-2xl cursor-pointer text-[#005566]  hover:text-[#EB7100]"} title="Delete Task" onClick={() => {deleteParticipant(participant.id)}}></i>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Panel>
                </div>
            </section>
        </div>
        {sidebarOpen && 
            <RightSidePanel isOpen={sidebarOpen}>
                <div className="flex flex-col h-full">
                    <div className="flex flex-col h-[125px] w-full">
                        <div className='font-bold mb-2 text-[#EB7100] text-4xl'>Question Manager</div>
                        <div className='font-bold text-[#EB7100] text-xl'>Edit Question Details</div>
                    </div>
                    <div className="flex-1">
                        {requestQuestions.length > 0 && (
                            <>
                                <Select oKey="Type" oLabel="Data Type" oOptions={typeSelect}  oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestQuestions, activeItem)} oData={requestQuestions.find(q => q.id === activeItem)?.Type} />
                                <Input oKey="Name" oType="text" oLabel="Name" oSize="col12" oDescription="Internal reference only in the Request Builder" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestQuestions, activeItem)} oData={requestQuestions.find(q => q.id === activeItem)?.Name} />
                                <Input oKey="Label" oType="text" oLabel="Label" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestQuestions, activeItem)} oData={requestQuestions.find(q => q.id === activeItem)?.Label} />
                                <Input oKey="Description" oType="text" oLabel="Description" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestQuestions, activeItem)} oData={requestQuestions.find(q => q.id === activeItem)?.Description} />
                                { requestQuestions.find(q => q.id === activeItem)?.Type === "select" && (
                                    <>
                                        <Input oKey='Options' oType='text' oLabel='Enter Options' oSize='col12' oDescription='Seperate each value with a comma. For ex: Option 1,Option 2,Option 3' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestQuestions, activeItem)} oData={requestQuestions.find(q => q.id === activeItem)?.Options} />
                                    </>
                                )}
                                <div className="col12" style={{marginTop:'25px'}}>
                                    <div className="col12">Question Preview</div>
                                    <div className="col12 align-top-center">
                                        <DataInputs oData={requestQuestions.find(q => q.id === activeItem)} oChange='' oEditable={true} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex h-[100px] items-center justify-center w-full">
                        <StandardButton 
                            oAction={handleViewSidebar}
                            oText='Save & Close'
                        />
                    </div>
                </div>
            </RightSidePanel>
        }
        <ToastContainer
            position='bottom-left'
            transition={Slide}/>
    </div>
    
  );
}

export default CreateRequest;