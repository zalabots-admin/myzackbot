
import { useEffect, useState } from 'react';
import { getRequestData, createHistoryEvent, handleDataInputChange, handleGetDataInputChange, handleDataInputChangeFiltered, getRequestFormsAndItemsData } from '../../functions/data'
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource.ts'
import { DndContext, DragEndEvent, /*useSensor, useSensors, MouseSensor, TouchSensor*/ } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { arrayMove, } from '@dnd-kit/sortable';
import BeatLoader from "react-spinners/BeatLoader";
import DataInputs from '../data-objects/DataInputs'
import Input from '../data-objects/Input';
import Select from '../data-objects/Select';
import { DraggableListItem } from '../RequestItems'
import Editor from '../admin-portal/Editor.tsx';
import  SearchBar from '../SearchBar'
import ToggleSwitch from '../../components/Toggle';
import SideBar from '../SideBar';
import { IconButtonMedium, SmallButton } from '../../components/Buttons';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import '../../styles/SideBar.css'

interface Prop {
  oUser: any;
  oCloseTab: any;
  oOpenTabs: any;
  oActiveIndex: number;
  oCurrentTab: number;
  oSetOpenTabs: any;
}

const typeSelect = ['Text Field|text','Date Field|date','Number Field|number','Dropdown Menu|select', 'File Upload|file']
const client = generateClient<Schema>();

function CreateRequest(props: Prop) {

    const [requestData, setRequestData] = useState<any>( { DeliveryMethod: 'Standard', RequestType: 'Standard' } );
    const [requestParticipants, setRequestParticipants] = useState<any[]>( [] );
    const [requestQuestions, setRequestQuestions] = useState<any[]>( [] );
    const [itemData, setItemData] = useState<any[]>( [{id:'1', Name:'Custom Question', Type:'custom'}] );
    const [searchedValue, setSearchedValue] = useState( "" );
    const [loading, setLoading] = useState( true );
    //const [followUp, setFollowUp] = useState( false );
    const [emailResponse, setEmailResponse] = useState( false );
    const [autoComplete, setAutoComplete] = useState( false );
    const [sidebarOpen, setSideBarOpen] = useState( false );
    const [activeItem, setActiveItem] = useState( 0 );


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
        /*if ( (currentRequest.data as any)?.FollowUpDate != '' && (currentRequest.data as any)?.FollowUpDate != null ) {
            setFollowUp( true );
        }*/

        if ( currentRequest.data.AutoComplete ) {
            setAutoComplete( true );
        }
        if ( currentRequest.data.EmailResponse ) {
            setEmailResponse( true );
        }
        setRequestData( currentRequest.data );
        const sortedParticipants = (currentRequest.data as any)?.Participants?.sort((a: any, b: any) => a['FirstName'].localeCompare(b['FirstName']));
        setRequestParticipants( sortedParticipants ?? [] );
        const sortedItems = (currentRequest.data as any)?.Questions?.sort((a: any, b: any) => Number(a.Order) - Number(b.Order));
        setRequestQuestions( sortedItems ?? [] );
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
                            id: 'T' + uuidv4(),
                            Name: formItem.Name,
                            Type: formItem.Type,
                            Label: formItem.Label,
                            Description: formItem.Description,
                            Options: formItem.Options,
                            Layout: formItem.Layout,
                            DocumentId: formItem.DocumentId,
                            Order: requestQuestions.length + 1
                        };
                        formItems.push(clone);
                    });
                        setRequestQuestions(formItems);
                } else if ( original.Type === 'custom' ) {
                    clone = {
                        id: 'T' + uuidv4(),
                        Name: original.Name,
                        Type: 'text',
                        Label: '',
                        Description: '',
                        Options: '',
                        Layout: '',
                        DocumentId: '',
                        Order: requestQuestions.length + 1
                    }
                    setActiveItem( requestQuestions.length );
                    handleViewSidebar();
                    setRequestQuestions((prev:any) => [...prev, clone]);
                } else {
                    clone = {
                        id: 'T' + uuidv4(),
                        Name: original.Name,
                        Type: original.Type,
                        Label: original.Label,
                        Description: original.Description,
                        Options: original.Options,
                        Layout: original.Layout,
                        DocumentId: original.DocumentId,
                        Order: requestQuestions.length + 1
                    };
                    setRequestQuestions((prev:any) => [...prev, clone]);
                }
                
            }
        } else if (active.id !== over.id) {
            const oldIndex = requestQuestions.findIndex((i) => i.id === active.id);
            const newIndex = requestQuestions.findIndex((i) => i.id === over.id);
            setRequestQuestions(arrayMove(requestQuestions, oldIndex, newIndex));
        };
    }

    /*function handleToggleFollowUp(checked: boolean) {
    
        setEmailResponse(checked);
        const updatedRequestData = {
            ...requestData,
            FollowUpDate: "",
        };
        setRequestData( updatedRequestData );

    };*/

    function handleToggleEmailResponse(checked: boolean) {
 
        if ( checked === false ) {
            requestParticipants.filter(participant => participant.ParticipantRole === 'Receiver').map( async ( participant ) => {
                if ( !participant.id.startsWith('T') ) {
                    await client.models.RequestParticipants.delete({ id: participant.id });
                } 
            });
            setRequestParticipants(prev =>
            prev.filter(p => p.ParticipantRole !== 'Receiver')
        );

        } else {
            addParticipant( 'Receiver' );
        }

        setEmailResponse(checked);
        const updatedRequestData = {
            ...requestData,
            EmailResponse: checked,
        };
        setRequestData( updatedRequestData );
  
    }

    function handleToggleAutoComplete(checked: boolean) {

        setAutoComplete(checked);
        const updatedRequestData = {
            ...requestData,
            AutoComplete: checked,
        };
        setRequestData( updatedRequestData );

    }   

    function handleTaskTypeChange( oId:string, oType:string ) {

        const copyParticipants = [...requestParticipants];
        const index = copyParticipants.findIndex(participant => participant.id === oId);
        copyParticipants[index].ParticipantType = oType;
        setRequestParticipants(copyParticipants);

    }

    function deleteTask( oId:string ) {

        const copyParticipants = [...requestParticipants];
        const index = copyParticipants.findIndex(participant => participant.id === oId);
        copyParticipants.splice(index, 1);
        setRequestParticipants(copyParticipants);

    }

    function handleViewSidebar() {

        setSideBarOpen(!sidebarOpen);

    };

    function addParticipant( oType:string ) {

        const copyRequestParticipants = [...requestParticipants];
        
        if ( oType === 'Recipient' ) {
            copyRequestParticipants.push( { id:'T' + uuidv4(), EntityName: '', Email: '', ParticipantRole: oType, ParticipantType: 'Individual' } )
        } else {
            copyRequestParticipants.push( { id:'T' + uuidv4(), FirstName: '', LastName: '', Email: '', ParticipantRole: oType })
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

    async function saveRequest( oStatus: string) {

        var request: string | any = {};
        if (requestData.id === undefined ) {
            request = await client.models.Request.create({ ...requestData, RequestStatus: 'New', OrganizationID: props.oUser.OrgId });
        } else {
            request = await client.models.Request.update({ ...requestData, RequestStatus: 'New' });
        }
        const requestId = request.data?.id;
        const copyParticipants = [...requestParticipants];
        copyParticipants.map( async ( participant ) => {

            if ( participant.id.startsWith('T') ) {
                participant.id = participant.id.slice(1);
                if ( participant.ParticipantRole === 'Recipient' ) {
                    const task = await client.models.RequestTasks.create({ RequestID: requestId, RequestTaskStatus: 'New' });
                    const taskId = task.data?.id;
                    createHistoryEvent('Task', 'ZackBot', 'Task Created', requestId ? requestId : '', taskId ? taskId : '');
                    await client.models.RequestParticipants.create({ ...participant, RequestID: requestId, RequestTaskID: taskId });
                } else {
                    await client.models.RequestParticipants.create({ ...participant, RequestID: requestId });
                }

            } else {
                await client.models.RequestParticipants.update({...participant});
            }
        });

        const copyRequestQuestions = [...requestQuestions];
        copyRequestQuestions.map( async ( item, index ) => {
            if ( item.id.startsWith('T') ) {
                item.id = item.id.slice(1);
                await client.models.RequestQuestions.create( {...item, RequestID: requestId, Order: index + 1} );
            } else if ( item.deleted ) {
                await client.models.RequestQuestions.delete({ id: item.id });
            } else {
                await client.models.RequestQuestions.update( {...item, Order: index + 1} );
            }
            
        });

        setRequestQuestions( copyRequestQuestions );
        setRequestParticipants( copyParticipants );
        setRequestData( {...requestData, id: requestId, RequestStatus: oStatus} );

        if ( oStatus === 'Requested' ) {
            await createHistoryEvent('Request', props.oUser.firstName + ' ' + props.oUser.lastName, 'Request Created', requestId ? requestId : '', '');
            props.oCloseTab( props.oCurrentTab );
        } else {
            props.oSetOpenTabs(( prevItems:any ) => {
                const updatedItems = [...prevItems];
                updatedItems[props.oCurrentTab] = { ...updatedItems[props.oCurrentTab], name: requestData.RequestedFor };
                return updatedItems;
            });
        }

        await client.models.Request.update({ id: requestId, RequestStatus: oStatus });

    }

    async function deleteDraftRequest() {

        await client.models.Request.delete({ id: requestData.id });
        props.oCloseTab( props.oCurrentTab );
        
    }

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


  return (
    
    <div className="grid grid-cols-[30%_1fr] h-full" >
        <SideBar isOpen={sidebarOpen}>
            <div className="flex flex-col h-full">
                <div className="flex flex-col h-[125px] w-full">
                    <div className='font-bold mb-2 text-[#005566] text-4xl'>Question Manager</div>
                    <div className='font-bold text-[#005566] text-xl'>Edit Question Details</div>
                </div>
                <div className="flex-1">
                    {requestQuestions.length > 0 && (
                        <>
                            <Select oKey='Type' oLabel='Data Type' oOptions={typeSelect}  oSize='col12' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, setRequestQuestions, activeItem)} oData={requestQuestions[activeItem].Type} />
                            <Input oKey='Name' oType='text' oLabel='Name' oSize='col12' oDescription='Internal reference only in the Request Builder' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, setRequestQuestions, activeItem)} oData={requestQuestions[activeItem].Name} />
                            <Input oKey='Label' oType='text' oLabel="Label" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, setRequestQuestions, activeItem)} oData={requestQuestions[activeItem].Label} />
                            <Input oKey='Description' oType='text' oLabel='Description' oSize='col12' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, setRequestQuestions, activeItem)} oData={requestQuestions[activeItem].Description} />
                            { requestQuestions[activeItem].Type === "select" && (
                                <>
                                    <Input oKey='Options' oType='text' oLabel='Enter Options' oSize='col12' oDescription='Seperate each value with a comma. For ex: Option 1,Option 2,Option 3' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, setRequestQuestions, activeItem)} oData={requestQuestions[activeItem].Options} />
                                </>
                            )}
                            <div className="col12" style={{marginTop:'25px'}}>
                                <div className='col12'>Question Preview</div>
                                <div className="col12 align-top-center">
                                    <DataInputs oData={requestQuestions[activeItem]} oChange='' oEditable={true} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex h-[100px] items-center justify-center w-full">
                    <button className="standard" style={{bottom:'25'}} onClick={handleViewSidebar}>Save & Close</button>
                </div>
            </div>
        </SideBar>
        <div className='p-4 h-full'>
            <section className="w-full bg-white p-6 rounded shadow lg:overflow-y-auto h-fit border border-gray-300 mb-6">
                <Input oKey='AccountName' oType='text' oLabel="Account Name:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.AccountName} />
                <Input oKey='RequestedFor' oType='text' oLabel="Information Is Requested For:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.RequestedFor} />
                <Input oKey='DueDate' oType='date' oLabel="Due Date:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.DueDate} />
                <Select oKey='DeliveryMethod' oLabel='Delivery Type:' oOptions={['Manual','Standard']} oSize='col12' isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.DeliveryMethod} />
                <ToggleSwitch label='Email Response on Submit' checked={emailResponse} onChange={handleToggleEmailResponse} onColor='#4E6E5D' offColor='#CCCCCC' />
                <ToggleSwitch label='Auto Complete Request' checked={autoComplete} onChange={handleToggleAutoComplete} onColor='#4E6E5D' offColor='#CCCCCC' />
                {/*<ToggleSwitch label='Send Follow-Up Reminder' checked={followUp} onChange={handleToggle} onColor='#4E6E5D' offColor='#CCCCCC' />
                { followUp ? (
                    <Input oKey='FollowUpDate' oType='date' oLabel="Follow Up Date" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.FollowUpDate} />
                ) : (
                    <></>
                )}*/}
            </section>
        </div>
        <div className='p-4 h-full'>
            <section className="grid grid-rows-[50px_1fr] w-full bg-white p-6 rounded shadow h-full border border-gray-300 mb-6">
                <div className="flex justify-start items-center mb-4">
            <div className="w-[80%] flex items-center">
                <h3>Request Builder</h3>
            </div>
            <div className="w-[20%] flex justify-end items-center">
                <IconButtonMedium
                    oAction={() => {props.oCloseTab( props.oCurrentTab )}}
                    oTitle="Close Request"
                    oIcon="fa-sharp fa-thin fa-xmark"
                />
                { requestData.RequestStatus === 'Draft' && (
                    <IconButtonMedium
                        oAction={deleteDraftRequest}
                        oTitle="Delete Request"
                        oIcon="fa-sharp fa-thin fa-trash"
                    />
                )}
                <IconButtonMedium
                    oAction={() => {saveRequest( 'Draft' )}}
                    oTitle="Save Request"
                    oIcon="fa-sharp fa-thin fa-floppy-disk"
                />
                <IconButtonMedium
                    oAction={() => {saveRequest( 'Requested' )}}
                    oTitle="Send Request"
                    oIcon="fa-sharp fa-thin fa-paper-plane-top"
                />
            </div> 
                </div>
                <Tabs className="w-full h-full">
                    <TabList>
                        <Tab className="react-tabs__tab w-[150px] text-center">Questions</Tab>
                        { requestData.DeliveryMethod === 'Standard' && (
                            <Tab className="react-tabs__tab w-[150px] text-center">Tasks</Tab>
                        )}
                        { emailResponse && (
                            <Tab className="react-tabs__tab w-[150px] text-center">Responses</Tab>
                        )}
                    </TabList>
                    <TabPanel className="react-tabs__tab-panel h-full" forceRender={true}>
                        <div className='p-4 h-[500px] overflow-y-auto'>
                            <DndContext onDragEnd={handleDragEnd}>
                                <div className="grid grid-cols-[35%_1fr] gap-4 h-full" >
                                    <div>
                                        { loading ? (
                                            <div className='h-full w-full flex justify-center items-center'>
                                                <BeatLoader color = "#D58936" />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className='w-full'>
                                                    <SearchBar
                                                        oSearchedValue={searchedValue}
                                                        oSetSearchedValue={setSearchedValue}
                                                    />
                                                </div>
                                                <div>
                                                    {itemData.filter((row:any) => row.Name.toString().toLowerCase().includes(searchedValue.toString().toLowerCase())).map(( item:any ) => (
                                                        <DraggableListItem oKey={item.id} oName={item.Name} oType={item.Type} oActive={true} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Editor oItems={requestQuestions} oSetItems={setRequestQuestions} oIsEditable={true} oClick={setRequestQuestions} oSetActive={setActiveItem} oOpenSidePanel={handleViewSidebar} />
                                    </div>
                                </div>
                            </DndContext>
                        </div>
                    </TabPanel>
                    { requestData.DeliveryMethod === 'Standard' && (
                        <TabPanel className="react-tabs__tab-panel flex-1 h-full">
                            <div className="grid grid-rows-[75px_1fr] w-full" >
                                <div className="flex justify-end items-center w-full">
                                    <SmallButton
                                        oAction={() => addParticipant('Recipient')}
                                        oText="Add Task"
                                    />
                                </div>
                                <div className="p-2 h-[450px] overflow-y-auto">
                                    {requestParticipants.filter(participant => participant.ParticipantRole === 'Recipient').map( ( participant, index ) => (
                                        <div key={index} className="w-full flex items-center bg-[#F4F4F4] border border-gray-300 p-2 mb-2 rounded">
                                            <div className="w-[5%] h-full flex flex-col items-center justify-center">
                                                <p>Task</p>
                                                <h2 className="">{index + 1}</h2>
                                            </div>
                                            <div className="w-[60%] flex items-center">
                                                <div className="w-[65%] flex items-center">
                                                    {participant.ParticipantType === 'Individual' ? (
                                                        <>
                                                            <div className="w-[25%] flex flex-row items-center justify-center">
                                                                <i className={"fa-classic fa-thin fa-user text-3xl cursor-pointer text-[#005566]"} title="Individual Task"></i>
                                                                <i className={"fa-classic fa-thin fa-building text-3xl cursor-pointer text-[#DADADA]  hover:text-[#D58936]"} title="Entity Task" onClick={() => {handleTaskTypeChange(participant.id, 'Entity')}}></i>
                                                            </div>
                                                            <div className="w-[75%] flex flex-row items-center justify-center">
                                                                <Input oKey='FirstName' oType='text' oLabel="First Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.FirstName} />
                                                                <Input oKey='LastName' oType='text' oLabel="Last Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.LastName} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-[25%] flex flex-row items-center justify-center">
                                                                <i className={"fa-classic fa-thin fa-user text-3xl cursor-pointer text-[#DADADA] hover:text-[#D58936]"} title="Individual Task" onClick={() => {handleTaskTypeChange(participant.id, 'Individual')}}></i>
                                                                <i className={"fa-classic fa-thin fa-building text-3xl cursor-pointer text-[#005566]"} title="Entity Task"></i>
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
                                            <div className="w-[30%] flex items-center justinfy-center">
                                                 <Input oKey='Instructions' oType='text' oLabel="Instructions" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.Instructions} />
                                            </div>
                                            <div className="w-[5%] h-full flex flex-col items-center justify-center">
                                                <i className={"fa-classic fa-thin fa-xmark text-2xl cursor-pointer text-[#005566]  hover:text-[#D58936]"} title="Delete Task" onClick={() => {deleteTask(participant.id)}}></i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabPanel>
                    )}
                    { emailResponse && (
                        <TabPanel className="react-tabs__tab-panel flex-1 h-full">
                            <div className="grid grid-rows-[75px_1fr] w-full" >
                                <div className="flex justify-end items-center w-full">
                                    <SmallButton
                                        oAction={() => addParticipant('Receiver')}
                                        oText="Add Recipient"
                                    />
                                </div>
                                <div className="p-2 h-[450px] overflow-y-auto">
                                    {requestParticipants.filter(participant => participant.ParticipantRole === 'Receiver').map( ( participant, index ) => (
                                        <div key={index} className="w-full flex items-center bg-[#F4F4F4] border border-gray-300 p-2 mb-2 rounded">
                                            <div className="w-[8%] h-full flex flex-col items-center justify-center">
                                                <p>Recipient</p>
                                                <h2 className="">{index + 1}</h2>
                                            </div>
                                            <div className="w-[60%] flex items-center">
                                                <div className="w-[65%] flex items-center">
                                                    {participant.ParticipantType === 'Individual' ? (
                                                        <>
                                                            <div className="w-[25%] flex flex-row items-center justify-center">
                                                                <i className={"fa-classic fa-thin fa-user text-3xl cursor-pointer text-[#005566]"} title="Individual Task"></i>
                                                                <i className={"fa-classic fa-thin fa-building text-3xl cursor-pointer text-[#DADADA]  hover:text-[#D58936]"} title="Entity Task" onClick={() => {handleTaskTypeChange(participant.id, 'Entity')}}></i>
                                                            </div>
                                                            <div className="w-[75%] flex flex-row items-center justify-center">
                                                                <Input oKey='FirstName' oType='text' oLabel="First Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.FirstName} />
                                                                <Input oKey='LastName' oType='text' oLabel="Last Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.LastName} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-[25%] flex flex-row items-center justify-center">
                                                                <i className={"fa-classic fa-thin fa-user text-3xl cursor-pointer text-[#DADADA] hover:text-[#D58936]"} title="Individual Task" onClick={() => {handleTaskTypeChange(participant.id, 'Individual')}}></i>
                                                                <i className={"fa-classic fa-thin fa-building text-3xl cursor-pointer text-[#005566]"} title="Entity Task"></i>
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
                                            <div className="w-[30%] flex items-center justinfy-center">
                                                 <Input oKey='Instructions' oType='text' oLabel="Instructions" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.Instructions} />
                                            </div>
                                            <div className="w-[3%] h-full flex flex-col items-center justify-center">
                                                <i className={"fa-classic fa-thin fa-xmark text-2xl cursor-pointer text-[#005566]  hover:text-[#D58936]"} title="Delete Task" onClick={() => {deleteTask(participant.id)}}></i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabPanel>
                    )}
                </Tabs>
            </section>
        </div>
    </div>
    
  );
}

export default CreateRequest;