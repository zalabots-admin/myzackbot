
import React, { useEffect, useState } from 'react';
import { getRequestData, createHistoryEvent, handleDataInputChange, handleGetDataInputChange, handleDataInputChangeFiltered, getRequestFormsAndItemsData } from '../../functions/data'
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource.ts'
import { DndContext, DragEndEvent, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers';
import { arrayMove, } from '@dnd-kit/sortable';
import BeatLoader from "react-spinners/BeatLoader";
import DataInputs from '../data-objects/DataInputs'
import Input from '../data-objects/Input';
import Select from '../data-objects/Select';
import { DraggableListItem } from '../RequestItems'
import Editor from '../admin-portal/Editor.tsx';
import  SearchBar from '../SearchBar'
import CollapsibleSection from '../../components/Collapsible';
import ToggleSwitch from '../../components/Toggle';
import SideBar from '../SideBar';
import { IconButtonMedium } from '../../components/Buttons';

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
console.log('form added', original);
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

    function handleViewSidebar() {

        setSideBarOpen(!sidebarOpen);

    };

    function addParticipant( oType:string ) {

        const copyRequestParticipants = [...requestParticipants];
        copyRequestParticipants.push( { id:'T' + uuidv4(), FirstName: '', LastName: '', Email: '', ParticipantRole: oType })
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

    const sensors = useSensors(
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
    );

    useEffect(() => { 
        if ( props.oOpenTabs[props.oCurrentTab].status != 'New' ) {
            getRequest( props.oOpenTabs[props.oCurrentTab].id );
        };
        getItems();

    },[props.oUser]);


  return (
    
    <div className="col12 component-layout-columns" style={{ '--gridColumns': '30% 1fr' } as React.CSSProperties} >
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
        <div>
            <div className='overflow-scroll' style={{height:'725px', padding:'20px'}}>
                <CollapsibleSection title="Request Details" defaultOpen>
                    <Input oKey='AccountName' oType='text' oLabel="Account Name:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.AccountName} />
                    <Input oKey='RequestedFor' oType='text' oLabel="Information Is Requested For:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.RequestedFor} />
                    {/*<Input oKey='RequestedForNumber' oType='text' oLabel="Requested For Number" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.RequestedForNumber} />*/}
                    <Input oKey='DueDate' oType='date' oLabel="Due Date:" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.DueDate} />
                    {/*<ToggleSwitch label='Send Follow-Up Reminder' checked={followUp} onChange={handleToggle} onColor='#4E6E5D' offColor='#CCCCCC' />
                    { followUp ? (
                        <Input oKey='FollowUpDate' oType='date' oLabel="Follow Up Date" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.FollowUpDate} />
                    ) : (
                        <></>
                    )}*/}
                </CollapsibleSection>
                <CollapsibleSection title="Delivery Options">
                    <Select oKey='DeliveryMethod' oLabel='Delivery Type:' oOptions={[/*'Manual',*/'Standard']} oSize='col12' isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestData)} oData={requestData.DeliveryMethod} />                  
                    { requestData.DeliveryMethod === 'Standard' ? (
                        <>
                            <div className='col12 align-center-left' style={{marginBottom:'15px'}}>
                                <div className='col10 align-center-left' style={{height:'40px'}}><h4>Request Recipients</h4></div>
                                <div className='col2 align-center-right'>
                                    <IconButtonMedium
                                        oAction={() => addParticipant('Recipient')}
                                        oTitle="Add Recipient"
                                        oIcon="fa-classic fa-thin fa-user-circle-plus"
                                    />
                                </div>
                            </div>
                            {requestParticipants.filter(participant => participant.ParticipantRole === 'Recipient').map( ( participant, index ) => (
                                <div key={index} className='col12 align-center-center' style={{backgroundColor:'#F4F4F4', border:'1px solid #CCCCCC', padding:'10px', marginBottom:'10px', borderRadius:'5px'}}>
                                    <div className='col2 align-center-center' style={{fontSize:'36pt'}}>
                                        <i className={"fa-classic fa-thin fa-user text-3xl m-4 cursor-pointer hover:text-[#D58936]"}></i>
                                    </div>
                                    <div className='col10 align-center-center'>
                                        <Input oKey='FirstName' oType='text' oLabel="First Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.FirstName} />
                                        <Input oKey='LastName' oType='text' oLabel="Last Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.LastName} />
                                        <Input oKey='Email' oType='text' oLabel="Email" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.Email} />
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <></>
                    )}                    
                </CollapsibleSection>
                <CollapsibleSection title="Response Options">
                    <ToggleSwitch label='Email Response on Submit' checked={emailResponse} onChange={handleToggleEmailResponse} onColor='#4E6E5D' offColor='#CCCCCC' />
                    <ToggleSwitch label='Auto Complete Request' checked={autoComplete} onChange={handleToggleAutoComplete} onColor='#4E6E5D' offColor='#CCCCCC' />
                    {requestParticipants.filter(participant => participant.ParticipantRole === 'Receiver').map( ( participant, index ) => (
                                <div key={index} className='col12 align-center-center' style={{backgroundColor:'#F4F4F4', border:'1px solid #CCCCCC', padding:'10px', marginBottom:'10px', borderRadius:'5px'}}>
                                    <div className='col2 align-center-center' style={{fontSize:'36pt'}}>
                                        <i className={"fa-classic fa-thin fa-user text-3xl m-4 cursor-pointer hover:text-[#D58936]"}></i>
                                    </div>
                                    <div className='col10 align-center-center'>
                                        <Input oKey='FirstName' oType='text' oLabel="First Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.FirstName} />
                                        <Input oKey='LastName' oType='text' oLabel="Last Name" oSize="col6" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.LastName} />
                                        <Input oKey='Email' oType='text' oLabel="Email" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setRequestParticipants, participant.id)} oData={participant.Email} />
                                    </div>
                                </div>
                            ))}
                </CollapsibleSection>

            </div>
        </div>
        <DndContext sensors={sensors} modifiers={[restrictToFirstScrollableAncestor]} onDragEnd={handleDragEnd}>
            <div className="col12 section-layout component-layout-rows" style={{ '--gridRows': '100px 1fr', height: '725px' } as React.CSSProperties} >
                <div className='col12 align-top-left'>
                    
                    <div className='col4 align-top-left' style={{marginBottom:'15px'}}>
                        <div style={{marginBottom:'20px'}}><h3>Request Builder</h3></div>
                        <div className='col12 align-top-center'>
                            <SearchBar
                                oSearchedValue={searchedValue}
                                oSetSearchedValue={setSearchedValue}
                            />
                        </div>
                    </div>
                        <div className='col8 align-center-right' style={{paddingRight:'20px'}}>
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
                <div className="col12 component-layout-columns overflow-scroll" style={{ '--gridColumns': '35% 1fr',height: '100%' } as React.CSSProperties} >
                    <div>
                        { loading ? (
                            <div className='col12 align-center-center'>
                                <BeatLoader color = "#D58936" />
                            </div>
                        ) : (
                            <div>
                                {itemData.filter((row:any) => row.Name.toString().toLowerCase().includes(searchedValue.toString().toLowerCase())).map(( item:any ) => (
                                    <DraggableListItem oKey={item.id} oName={item.Name} oType={item.Type} oActive={true} />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className='col12 align-top'>
                        <Editor oItems={requestQuestions} oSetItems={setRequestQuestions} oIsEditable={true} oClick={setRequestQuestions} oSetActive={setActiveItem} oOpenSidePanel={handleViewSidebar} />
                    </div>
                </div>
                <div className="col12 component-layout-rows" style={{ '--gridRows': '88% 10%' } as React.CSSProperties} >


                </div>
            </div>
        </DndContext>
    </div>
  );
}

export default CreateRequest;