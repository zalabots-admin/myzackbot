
import { useEffect, useState } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { generateClient } from 'aws-amplify/data';
import type { Schema, } from '../../../amplify/data/resource'
import { LogOutButton, NavigationButton, StaticNavigationButton, StandardButton } from '../components/Buttons';
import HeaderLogo from '../images/ZBT_Logo_Default.png'
import { Tab, Panel } from '../components/Tabs';
import { v4 as uuid } from "uuid";
import AdminPortal from '../components/admin-portal/AdminPortal';
import RequestQueue from '../components/request-manager/RequestQueue';
import TasksQueue from '../components/request-manager/TaskQueue';
import CreateRequest from '../components/request-manager/CreateRequest';
import ViewRequest from '../components/request-manager/ViewRequest';
import ViewTask from '../components/request-manager/ViewTask';

interface Prop {
    oSignOut: any
    oSetShowLogIn: any;
    oSetMainLayout: any;
}   

const client = generateClient<Schema>();

function ZackBot( { oSignOut, oSetShowLogIn, oSetMainLayout }: Prop ) {

    const [menuOpen, setMenuOpen] = useState(false);
    const [activeItem, setActiveItem] = useState( {'Request Queue':true, 'Tasks Queue':false, 'Admin Portal':false} ); //Currently active navigation item
    const [currentUserDetails, setCurrentUserDetails] = useState({firstName:'', lastName:'', emailAddress:'', OrgId:'', Role:''});
    const [activeTab, setActiveTab] = useState(0);
    const [activeTabId, setActiveTabId] = useState('1');
    const [tabs, setTabs] = useState([{id: '1', name: 'Request Queue', show:true, status: 'N/A', type: 'queue'}, {id: '2', name: 'Tasks Queue', show:false, status: 'N/A', type: 'queue'}]); // Tabs for open requests and queues
    const [eventData, setEventData] = useState<any>( [] ); // Event data from subscriptions

    const getUserAttributes = async () => {
        
        const userAttributes = await fetchUserAttributes();
        const userDetails = {
            firstName: userAttributes.given_name!, 
            lastName: userAttributes.family_name!, 
            emailAddress: userAttributes.email!,
            OrgId: userAttributes['custom:OrganizationId']!,
            Role: ''
        } 
        const currentUser = await client.models.Users.get({ id: userAttributes.email! });
        userDetails.Role = currentUser.data?.Role ?? '';
        setCurrentUserDetails( userDetails );

    };

    function setNavigationItem( oItem:string ) {

        const newTabs = [...tabs];

        let newActiveItem;
        if ( oItem === 'Admin Portal' ) {
            newActiveItem = { 'Request Queue':false, 'Tasks Queue':false, 'Admin Portal':true };
            newTabs.filter( ( tab ) => tab.name === 'Request Queue' )[0].show = false;
            newTabs.filter( ( tab ) => tab.name === 'Tasks Queue' )[0].show = false;
            setTabs( newTabs );
        } else {
            newActiveItem = { ... activeItem, 'Admin Portal': false };
            if ( newActiveItem[oItem as keyof typeof newActiveItem] === true ) { //Item is currently active, so deactivate it
                newTabs.filter( ( tab ) => tab.name === oItem )[0].show = false;
                newActiveItem[oItem as keyof typeof newActiveItem] = false;
                if ( oItem === 'Tasks Queue' ) { // Switch to Request Queue
                    setActiveTab( 0 );
                    setActiveTabId( '1' );
                } else { // Switch to Tasks Queue
                    setActiveTab( 1) ;
                    setActiveTabId( '2' );
                }
            } else { //Item is currently inactive, so activate it   
                newActiveItem[oItem as keyof typeof newActiveItem] = true;
                newTabs.filter( ( tab ) => tab.name === oItem )[0].show = true;
                setActiveTab( tabs.findIndex( ( tab ) => tab.name === oItem ) );
                setActiveTabId( newTabs.find( ( tab ) => tab.name === oItem )!.id );
            }
            setTabs( newTabs );
        };

        setActiveItem( newActiveItem );

    };

    function clickTab( index:number, id:string ) {

        setActiveTab( index );
        setActiveTabId( id );

    }

    function createNewRequest() {

        const newTabId = uuid();
        setTabs( prevItems => [...prevItems, {id: newTabId, name: 'New Request', status: 'New', show:true, type: 'request'}] );
        setActiveTab( tabs.length );
        setActiveTabId( newTabId );

    };

    async function openRequest( oId:string, oName:string, oStatus:string, oType:string ) {

        const existingTab = tabs.find( ( tab ) => tab.id === oId );
        if ( existingTab ) {
            setTabs( prevItems => prevItems.map( tab => tab.id === oId ? { ...tab, show:true, status: oStatus } : tab ) );
            setActiveTab( tabs.findIndex( ( tab ) => tab.id === oId ) );
            setActiveTabId( tabs.find( ( tab ) => tab.id === oId )!.id );
            return;
        } else {
            setTabs( prevItems => [...prevItems, {id: oId, name: oName, status: oStatus, show:true, type: oType}] );
            setActiveTab( tabs.length );
            setActiveTabId( oId );
        } 

    };

    function closeTab() {

        const updatedTabs = [...tabs];
        updatedTabs[activeTab].show = false;
        setTabs( updatedTabs );

        for ( let i = activeTab - 1; i >= 0; i-- ) {
            if ( updatedTabs[i].show ) {
                setActiveTab( i );
                setActiveTabId( updatedTabs[i].id );
                return;
            }
        }

        for ( let j = activeTab + 1; j < updatedTabs.length; j++ ) {
            if ( updatedTabs[j].show ) {
                setActiveTab( j );
                setActiveTabId( updatedTabs[j].id );
                return;
            }
        }

        setActiveTab( 0 );
        setActiveTabId( updatedTabs[0].id );
        
    };

    function createSubscriptions() {

        client.models.Request.onCreate().subscribe({
            next: (data) => { const newEvent = { event: 'New',data: JSON.stringify(data)}
            setEventData( newEvent )
            }
        });

        client.models.Request.onUpdate().subscribe({
        next: (data) => {
            if ( data != null && data != undefined ) {
            const newEvent = { event: 'Update',data: JSON.stringify(data)}
            setEventData( newEvent )
            }
        }
        });

        client.models.Request.onDelete().subscribe({
        next: (data) => {
            if ( data != null && data != undefined ) {
            const newEvent = { event: 'Delete',data: JSON.stringify(data)}
            setEventData( newEvent )
            }
        }
        });

    }

    Hub.listen('auth', ({ payload }) => {
    switch (payload.event) {
        case 'signedOut':
        oSetShowLogIn( true );
        oSetMainLayout( 'lg:w-[40%] lg:h-full h-1/2 flex items-center justify-center' );
        break;
    }
    });

    useEffect(() => {

        getUserAttributes();
        oSetShowLogIn( false );
        oSetMainLayout( 'w-full overflow-hidden' );
        createSubscriptions();

    },[]);

    return (

        <div className="min-h-0 w-full flex flex-col h-dvh">
            {/* Top bar */}
            <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white shadow-md w-full lg:h-[60px]">
                <div className="flex items-center space-x-3">
                    <img className="h-8 lg:h-10" src={HeaderLogo} alt='ZackBot Logo' />
                    <p className="text-[#EB7100] text-2xl lg:text-3xl">ZACK<span className="font-bold">BOT</span></p>
                </div>

                {/* Hamburger button - visible on mobile */}
                <button
                className="sm:hidden p-2 focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
                >
                {/* Simple hamburger icon */}
                <div className="w-6 h-0.5 bg-black mb-1"></div>
                <div className="w-6 h-0.5 bg-black mb-1"></div>
                <div className="w-6 h-0.5 bg-black"></div>
                </button>

                {/* Menu links - visible on larger screens */}
                <div className="hidden lg:flex space-x-6">
                    {( !activeItem['Tasks Queue']) && !activeItem['Admin Portal'] ? (
                        <StaticNavigationButton
                            oTitle="Request Queue"
                            oIcon="fa-sharp fa-regular fa-comments-question-check"
                        />
                    ) : (
                        <NavigationButton
                        oAction={() => {setNavigationItem( 'Request Queue' )}}
                        oTitle="Request Queue"
                        oIcon="fa-sharp fa-regular fa-comments-question-check"
                        oState={activeItem}
                    />
                    )}
                    {( !activeItem['Request Queue']) && !activeItem['Admin Portal'] ? (
                        <StaticNavigationButton
                            oTitle="Tasks Queue"
                            oIcon="fa-sharp fa-regular fa-clipboard-list-check"
                        />
                    ) : (
                    <NavigationButton
                        oAction={() => {setNavigationItem( 'Tasks Queue' )}}
                        oTitle="Tasks Queue"
                        oIcon="fa-sharp fa-regular fa-clipboard-list-check"
                        oState={activeItem}
                    />
                    )}
                    { currentUserDetails.Role === 'admin' && (
                        <NavigationButton
                            oAction={() => {setNavigationItem( 'Admin Portal' )}}
                            oTitle="Admin Portal"
                            oIcon="fa-sharp fa-regular fa-screwdriver-wrench"
                            oState={activeItem}
                        />
                    )}
                    <i className={"fa-thin fa-thin fa-pipe text-3xl lg:text-2xl text-gray-500"}></i>
                    <LogOutButton
                        oAction={oSignOut}
                        oTitle="Log Out"
                        oIcon="fa-sharp fa-solid fa-right-from-bracket"
                    />
                </div>
            </div>
            {/* Rest of the page */}
            <div id="main" className="flex-1 flex flex-col min-h-0 m-4 overflow-hidden">
                {/*Request Dashboard*/}
                {(activeItem['Request Queue'] || activeItem['Tasks Queue']) && 
                    <>
                        <div className='w-full flex items-center justify-center my-2'>
                            <div className='w-full flex items-center justify-center lg:w-3/4 lg:justify-start'>
                                <p className="h2 text-3xl">Request Dashboard</p>
                            </div>
                            <div className='hidden lg:w-1/4 lg:flex lg:items-center lg:justify-end'>
                                <StandardButton
                                    oAction={createNewRequest}
                                    oText="Create New Request"
                                />
                            </div>
                        </div>
                        <div id="tabs" className="flex flex-row bg-white">
                            {tabs.map((tab, index) => (
                                <Tab oAction={() => clickTab(index,tab.id)} oIndex={index} oText={tab.name} oIsActive={activeTab === index} oState={tab.show}/*oState={activeItem[tab.name as keyof typeof activeItem]}*/ />
                            ))}
                            <div className="border-b border-gray-300 flex-grow "></div>
                        </div>
                        <div id="panels" className="flex-1 flex min-h-0 p-4">
                            {tabs.map( (panel) => (
                                <>
                                    {panel.name === 'Request Queue' ? (
                                        <Panel oIsActive={activeTabId === '1'} oIndex={'1'} oState={true}>
                                            <RequestQueue 
                                                oUserOrg={currentUserDetails.OrgId}
                                                oOpenRequest={openRequest}
                                                oEvent={eventData}
                                            />
                                        </Panel>
                                    ) : (
                                        <>
                                            {panel.name === 'Tasks Queue' ? (
                                                <Panel oIsActive={activeTabId === '2'} oIndex={'2'} oState={true}>
                                                    <TasksQueue 
                                                        oUserOrg={currentUserDetails.OrgId}
                                                        oOpenRequest={openRequest}
                                                        //oEvent={eventData}
                                                    />
                                                </Panel>
                                            ) : (
                                                <Panel oIsActive={activeTabId === panel.id} oIndex={panel.id} oState={panel.show} >
                                                    {panel.status === 'New' || panel.status === 'Draft'? (
                                                        <CreateRequest 
                                                            oUser={currentUserDetails}
                                                            oCloseTab={closeTab}
                                                            oOpenTabs={tabs}
                                                            oActiveIndex={activeTab}
                                                            oCurrentTab={activeTab}
                                                            oSetOpenTabs={setTabs}
                                                            oPanelId={panel.id}
                                                        />
                                                    ) : (
                                                        <>
                                                            {panel.type === 'request' ? (
                                                                <ViewRequest 
                                                                    oUser={currentUserDetails}
                                                                    oCloseTab={closeTab}
                                                                    oOpenTabs={tabs}
                                                                    oActiveTabId={activeTabId}
                                                                    oCurrentTab={activeTab}
                                                                />
                                                            ) : (
                                                                <ViewTask
                                                                    oUser={currentUserDetails}
                                                                    oCloseTab={closeTab}
                                                                    oOpenTabs={tabs}
                                                                    oActiveTabId={activeTabId}
                                                                    oCurrentTab={activeTab}
                                                                />
                                                            )}
                                                        </>
                                                        
                                                
                                                    )}
                                                </Panel>
                                            )}
                                        </>
                                    )}
                                </>
                            ))}
                        </div>
                    </>
                }
                {/*Administrator's Portal*/}
                {activeItem['Admin Portal'] && 
                    <>
                        <div className='w-full flex items-center justify-center my-2'>
                            <div className='w-full flex items-center justify-start'>
                                <p className="h2 text-3xl">Administrator's Portal</p>
                            </div>
                        </div>
                        <AdminPortal 
                            oUserOrg={currentUserDetails.OrgId}
                        />
                    </>
                }
            </div>
        </div>

    );

}

export default ZackBot;