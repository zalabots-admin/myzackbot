
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
import Document from '../data-objects/Document.tsx';
import { DraggableListItem } from '../RequestItems'
import ZackbotEditor from '../admin-portal/Editor.tsx';
import  SearchBar from '../SearchBar'
import ToggleSwitch from '../../components/Toggle';
import SideBar from '../SideBar';
import { IconButtonMedium, SmallButton } from '../../components/Buttons';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Papa from "papaparse";

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
    //const [emailResponse, setEmailResponse] = useState( false );
    //const [autoComplete, setAutoComplete] = useState( false );
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
            //setAutoComplete( true );
        }
        if ( currentRequest.data.EmailResponse ) {
            //setEmailResponse( true );
        }
        setRequestData( currentRequest.data );
        const sortedParticipants = (currentRequest.data as any)?.Participants?.sort((a: any, b: any) => a['FirstName'].localeCompare(b['FirstName']));
        setRequestParticipants( sortedParticipants ?? [] );
        const sortedItems = (currentRequest.data as any)?.Questions?.sort((a: any, b: any) => Number(a.Order) - Number(b.Order));
        setRequestQuestions( sortedItems ?? [] );
    }

    function handleViewSidebar() {

        setSideBarOpen(!sidebarOpen);

    };

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
                console.log("JSON result:", result.data);
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

    function deleteParticipant( oId:string ) {

        const copyParticipants = [...requestParticipants];
        const index = copyParticipants.findIndex(participant => participant.id === oId);
        if ( copyParticipants[index].id.startsWith('T') ) {
            setRequestParticipants((prevItems:any) => prevItems.filter((item:any) => item.id !== oId));
        } else {
            setRequestParticipants((prevItems:any) =>
                prevItems.map((item:any) =>
                item.id === oId ? { ...item, deleted: true } : item
                )
            );
        }
       // setRequestParticipants(copyParticipants);

    }

    function addParticipant( oType:string ) {

        const copyRequestParticipants = [...requestParticipants];
        copyRequestParticipants.push( { id:'T' + uuidv4(), FirstName: '', LastName: '', EntityName: '', Email: '', ParticipantRole: oType, ParticipantType: 'Individual' } )
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

    function duplicateParticipant( oType:string ) {

        const copyRequestParticipants = [...requestParticipants];
        const requestRecipients = copyRequestParticipants.filter(participant => participant.ParticipantRole === oType);

        const index = requestRecipients.length-1;
        const newRecipient = { ...requestRecipients[index], id: 'T' + uuidv4() };
        copyRequestParticipants.push( newRecipient )
        setRequestParticipants( copyRequestParticipants );

    }

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
                    const task = await client.models.RequestTasks.create({ RequestID: requestId, RequestTaskStatus: 'New', Instructions: participant.Instructions });
                    const taskId = task.data?.id;
                    createHistoryEvent('Task', 'ZackBot', 'Task Created', requestId ? requestId : '', taskId ? taskId : '');
                    await client.models.RequestParticipants.create({ RequestID: requestId, RequestTaskID: taskId, FirstName: participant.FirstName, LastName: participant.LastName, EntityName: participant.EntityName, Email: participant.Email, ParticipantRole: participant.ParticipantRole, ParticipantType: participant.ParticipantType });
                } else {
                    await client.models.RequestParticipants.create({ RequestID: requestId, FirstName: participant.FirstName, LastName: participant.LastName, EntityName: participant.EntityName, Email: participant.Email, ParticipantRole: participant.ParticipantRole, ParticipantType: participant.ParticipantType });
                }
            } else if ( participant.deleted ) {
                if ( participant.ParticipantRole === 'Recipient' ) {
                    await client.models.RequestTasks.delete({ id: participant.RequestTaskID });
                };
                await client.models.RequestParticipants.delete({ id: participant.id });
            } else {
                await client.models.RequestParticipants.update({ id: participant.id, FirstName: participant.FirstName, LastName: participant.LastName, EntityName: participant.EntityName, Email: participant.Email, ParticipantRole: participant.ParticipantRole, ParticipantType: participant.ParticipantType});
                await client.models.RequestTasks.update({ id: participant.RequestTaskID, Instructions: participant.Instructions });
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
    
    <div className="grid grid-cols-[30%_1fr]" >
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
{/*Request Details*/}
        <div className='p-4'>
            <section className="w-full bg-white p-6 rounded shadow lg:overflow-y-auto h-full border border-gray-300 mb-6">
                <Input oKey='AccountName' oType='text' oLabel="Account Name:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.AccountName} />
                <Input oKey='RequestedFor' oType='text' oLabel="Information Is Requested For:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.RequestedFor} />
                <Input oKey='DueDate' oType='date' oLabel="Due Date:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.DueDate} />
                <Select oKey='DeliveryMethod' oLabel='Delivery Type:' oOptions={['Manual','Standard']} oSize='col12' isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.DeliveryMethod} />
                <ToggleSwitch label='Email Response on Submit' checked={requestData.EmailResponse} onChange={handleToggleEmailResponse} onColor='#4E6E5D' offColor='#CCCCCC' />
                <ToggleSwitch label='Auto Complete Request' checked={requestData.AutoComplete} onChange={handleToggleAutoComplete} onColor='#4E6E5D' offColor='#CCCCCC' />
                <ToggleSwitch label='Send Follow-Up Reminder' checked={requestData.FollowUp} onChange={handleToggleFollowUp} onColor='#4E6E5D' offColor='#CCCCCC' />
                { requestData.FollowUp && (
                    <Input oKey='FollowUpDate' oType='date' oLabel="Follow Up Date" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.FollowUpDate} />
                )}
            </section>
        </div>
        <div className='p-4'>
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
                        { requestData.EmailResponse && (
                            <Tab className="react-tabs__tab w-[150px] text-center">Responses</Tab>
                        )}
                    </TabList>
{/*Questions*/}
                    <TabPanel className="react-tabs__tab-panel h-full" forceRender={true}>
                        <div className='p-4 h-[525px] overflow-y-auto'>
                            <DndContext onDragEnd={handleDragEnd}>
                                <div className="grid grid-cols-[35%_1fr] gap-4" >
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
                                    <div className="h-full">
                                        <ZackbotEditor oItems={requestQuestions} oSetItems={setRequestQuestions} oIsEditable={true} oClick={setRequestQuestions} oSetActive={setActiveItem} oOpenSidePanel={handleViewSidebar} />
                                    </div>
                                </div>
                            </DndContext>
                        </div>
                    </TabPanel>
{/*Tasks*/}  
                    { requestData.DeliveryMethod === 'Standard' && (
                        <TabPanel className="react-tabs__tab-panel flex-1 h-full">
                            <div className="grid grid-rows-[125px_1fr] w-full" >
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
                                                oIcon="fa-sharp fa-thin fa-download"
                                            />
                                        </div>
                                        <div className="flex justify-end items-center w-[30%]">
                                            { requestParticipants.filter(participant => participant.ParticipantRole === 'Recipient').length > 0 && (
                                                <SmallButton
                                                    oAction={() => duplicateParticipant('Recipient')}
                                                    oText="Duplicate Task"
                                                />
                                            )}
                                            <SmallButton
                                                oAction={() => addParticipant('Recipient')}
                                                oText="Add Task"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 h-[400px] overflow-y-auto">
                                    {requestParticipants.filter(participant => participant.ParticipantRole === 'Recipient' && !participant.deleted).map( ( participant, index ) => (
                                        <div key={index} className="w-full flex items-center bg-[#F4F4F4] border border-gray-300 p-2 mb-2 rounded">
                                            <div className="w-[8%] h-full flex flex-col items-center justify-center">
                                                <p>Task</p>
                                                <h2>{index + 1}</h2>
                                            </div>
                                            <div className="w-[60%] flex items-center">
                                                <div className="w-[65%] flex items-center">
                                                    {participant.ParticipantType === 'Individual' ? (
                                                        <>
                                                            <div className="w-[25%] flex flex-row items-center justify-center">
                                                                <i className={"fa-classic fa-thin fa-user text-3xl cursor-pointer text-[#005566]"} title="Individual Task"></i>
                                                                <i className={"fa-classic fa-thin fa-building text-3xl cursor-pointer text-[#DADADA]  hover:text-[#D58936]"} title="Entity Task" onClick={() => {handleParticipantTypeChange(participant.id, 'Entity')}}></i>
                                                            </div>
                                                            <div className="w-[75%] flex flex-row items-center justify-center">
                                                                <Input oKey='FirstName' oType='text' oLabel="First Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.FirstName} />
                                                                <Input oKey='LastName' oType='text' oLabel="Last Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.LastName} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-[25%] flex flex-row items-center justify-center">
                                                                <i className={"fa-classic fa-thin fa-user text-3xl cursor-pointer text-[#DADADA] hover:text-[#D58936]"} title="Individual Task" onClick={() => {handleParticipantTypeChange(participant.id, 'Individual')}}></i>
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
                                            <div className="w-[28%] flex items-center justinfy-center">
                                                 <Input oKey='Instructions' oType='text' oLabel="Unique Task Instructions" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.Instructions} />
                                            </div>
                                            <div className="w-[4%] h-full flex flex-col items-center justify-center">
                                                <i className={"fa-classic fa-thin fa-xmark text-2xl cursor-pointer text-[#005566]  hover:text-[#D58936]"} title="Delete Task" onClick={() => {deleteParticipant(participant.id)}}></i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabPanel>
                    )}
{/*Responses*/}     
                    { requestData.EmailResponse && (
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
                                                <h2>{index + 1}</h2>
                                            </div>
                                            <div className="w-[88%] flex items-center">
                                                <div className="w-[65%] flex items-center">
                                                    {participant.ParticipantType === 'Individual' ? (
                                                        <>
                                                            <div className="w-[25%] flex flex-row items-center justify-center">
                                                                <i className={"fa-classic fa-thin fa-user text-3xl cursor-pointer text-[#005566]"} title="Individual Task"></i>
                                                                <i className={"fa-classic fa-thin fa-building text-3xl cursor-pointer text-[#DADADA]  hover:text-[#D58936]"} title="Entity Task" onClick={() => {handleParticipantTypeChange(participant.id, 'Entity')}}></i>
                                                            </div>
                                                            <div className="w-[75%] flex flex-row items-center justify-center">
                                                                <Input oKey='FirstName' oType='text' oLabel="First Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.FirstName} />
                                                                <Input oKey='LastName' oType='text' oLabel="Last Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.LastName} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-[25%] flex flex-row items-center justify-center">
                                                                <i className={"fa-classic fa-thin fa-user text-3xl cursor-pointer text-[#DADADA] hover:text-[#D58936]"} title="Individual Task" onClick={() => {handleParticipantTypeChange(participant.id, 'Individual')}}></i>
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
                                            <div className="w-[4%] h-full flex flex-col items-center justify-center">
                                                <i className={"fa-classic fa-thin fa-xmark text-2xl cursor-pointer text-[#005566]  hover:text-[#D58936]"} title="Delete Task" onClick={() => {deleteParticipant(participant.id)}}></i>
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