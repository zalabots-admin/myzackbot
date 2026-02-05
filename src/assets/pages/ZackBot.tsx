
import React, { useEffect, useState } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { generateClient } from 'aws-amplify/data';
import type { Schema, } from '../../../amplify/data/resource'
import { LogOutButton, NavigationButton, StaticNavigationButton, StandardButton } from '../components/Buttons';
import HeaderLogo from '../images/ZBT_Logo_Default.png'
import { Tab, Panel } from '../components/Tabs';
import { v4 as uuid } from "uuid";
import RequestQueue from '../components/request-manager/RequestQueue';
import TasksQueue from '../components/request-manager/TaskQueue';
import CreateRequest from '../components/request-manager/CreateRequest';
import ViewRequest from '../components/request-manager/ViewRequest';
import ViewTask from '../components/request-manager/ViewTask';
import ItemBuilder from '../components/admin-portal/ItemBulder';
import FormBuilder from '../components/admin-portal/FormBuilder';
import Organization from '../components/admin-portal/Organization';
import Branding from '../components/admin-portal/Branding';
import ListUsers from '../components/admin-portal/Users';
import RightSidePanel from '../components/SideBar';

interface Prop {
    oSignOut: any
    oSetShowLogIn: any;
    oSetMainLayout: any;
}   

const client = generateClient<Schema>();

function ZackBot( { oSignOut, oSetShowLogIn, oSetMainLayout }: Prop ) {

    const [menuOpen, setMenuOpen] = useState(false);
    const [activeItem, setActiveItem] = useState( {'Request Queue':true, 'Tasks Queue':false, 'Admin Portal':false, 'Notifications':true} ); //Currently active navigation item
    const [currentUserDetails, setCurrentUserDetails] = useState({firstName:'', lastName:'', emailAddress:'', OrgId:'', Role:''});
    const [activeTab, setActiveTab] = useState(0);
    const [activeTabId, setActiveTabId] = useState('1');
    const [requestTabs, setRequestTabs] = useState([{id:'1', name:'Request Queue', show:true, status:'N/A', type:'queue'}, {id:'2', name:'Tasks Queue', show:false, status:'N/A', type:'queue'}]); // Tabs for open requests and queues
    const [adminTabs] = useState([
        {id:'1', name:'Request Items', show:true}, 
        {id:'2', name:'Request Forms', show:true}, 
        {id:'3', name:'Organization', show:true},
        {id:'4', name:'Branding', show:true},
        {id:'5', name:'Users', show:true}]); // Tabs for admin portal
    const [eventData, setEventData] = useState<any>( [] ); // Event data from subscriptions
    const [sidebarOpen, setSidebarOpen] = useState( false );
    const [notifications, setNotifications] = useState<any[]>( [] );
    const [unreadNotificationCount, setUnreadNotificationCount] = useState( 0 );

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

    async function getNotifications() {

        const currentNotifications = await client.models.Notifications.list( {
            filter: {
                OrganizationID: { eq: currentUserDetails.OrgId },
                Read: { eq: false }
            }
        } );

        setNotifications( currentNotifications.data );
        setUnreadNotificationCount( currentNotifications.data.length );
        
    }

    function setNavigationItem( oItem:string ) {

        const newTabs = [...requestTabs];

        let newActiveItem;
        if ( oItem === 'Admin Portal' ) {
            newActiveItem = { 'Request Queue':false, 'Tasks Queue':false, 'Admin Portal':true, 'Notifications':false };
            newTabs.filter( ( tab ) => tab.name === 'Request Queue' )[0].show = false;
            newTabs.filter( ( tab ) => tab.name === 'Tasks Queue' )[0].show = false;
            setRequestTabs( newTabs );
            setActiveTab( 0 );
            setActiveTabId( '1' );
        } else {
            newActiveItem = { ... activeItem, 'Admin Portal': false, 'Notifications': true };
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
                setActiveTab( requestTabs.findIndex( ( tab ) => tab.name === oItem ) );
                setActiveTabId( newTabs.find( ( tab ) => tab.name === oItem )!.id );
            }
            setRequestTabs( newTabs );
        };

        setActiveItem( newActiveItem );

    };

    function clickTab( index:number, id:string ) {

        setActiveTab( index );
        setActiveTabId( id );

    }

    function createNewRequest() {

        const newTabId = uuid();
        setRequestTabs( prevItems => [...prevItems, {id: newTabId, name: 'New Request', status: 'New', show:true, type: 'request'}] );
        setActiveTab( requestTabs.length );
        setActiveTabId( newTabId );

    };

    async function openNotification( oId:string, oRequestId:string, oType:string ) {

        const oRequest = await client.models.Request.get( { id: oRequestId } );
        if ( oRequest.data && oRequest.data.id && oRequest.data.RequestedFor && oRequest.data.RequestStatus ) {
            openRequest( oRequest.data.id, oRequest.data.RequestedFor, oRequest.data.RequestStatus, oType );
        }
        await client.models.Notifications.update( {
            id: oId,
            Read: true
        } );
        setNotifications( prevNotifications => prevNotifications.map( ( notification ) => 
            notification.id === oId ? { ...notification, Read: true } : notification
        ) );
        const updatedNotifications = notifications.filter( ( notification ) => notification.id !== oId );
        //setNotifications( updatedNotifications );
        setUnreadNotificationCount( updatedNotifications.length );
    };

    function closeNotificationManager () {

        setSidebarOpen( false );
        const unreadNotifications = notifications.filter( ( notification ) => notification.Read === false );
        setNotifications( unreadNotifications );
        setUnreadNotificationCount( unreadNotifications.length );

    };

    async function openRequest( oId:string, oName:string, oStatus:string, oType:string ) {

        const existingTab = requestTabs.find( ( tab ) => tab.id === oId );
        if ( existingTab ) {
            setRequestTabs( prevItems => prevItems.map( tab => tab.id === oId ? { ...tab, show:true, status: oStatus } : tab ) );
            setActiveTab( requestTabs.findIndex( ( tab ) => tab.id === oId ) );
            setActiveTabId( requestTabs.find( ( tab ) => tab.id === oId )!.id );
            return;
        } else {
            setRequestTabs( prevItems => [...prevItems, {id: oId, name: oName, status: oStatus, show:true, type: oType}] );
            setActiveTab( requestTabs.length );
            setActiveTabId( oId );
        } 

    };

    function closeTab() {

        const tabsCopy = [...requestTabs];
        tabsCopy[activeTab].show = false;

        for (let i = tabsCopy.length - 1; i > 1; i--) {
            if (!tabsCopy[i].show) {
                tabsCopy.splice(i, 1);
            } else {
                break;
            }
        }

        setRequestTabs(tabsCopy);

        // try left
        let nextTab =
        tabsCopy
            .slice(0, activeTab)
            .reverse()
            .find(tab => tab.show);

        // if not found, try right
        if (!nextTab) {
        nextTab = tabsCopy
            .slice(activeTab + 1)
            .find(tab => tab.show);
        }

        // fallback
        if (!nextTab) {
        nextTab = tabsCopy[0];
        }

        setActiveTabId(nextTab.id);
        setActiveTab(tabsCopy.findIndex(tab => tab.id === nextTab.id));
        
    };

    function createSubscriptions() {

        //REQUEST SUBSCRIPTIONS
        client.models.Request.onCreate().subscribe({
            next: (data) => { const newEvent = { event: 'New', type: 'Request', data: JSON.stringify(data)}
            setEventData( newEvent )
            }
        });

        client.models.Request.onUpdate().subscribe({
        next: (data) => {
            if ( data != null && data != undefined ) {
            const newEvent = { event: 'Update', type: 'Request', data: JSON.stringify(data)}
            setEventData( newEvent )
            }
        }
        });

        client.models.Request.onDelete().subscribe({
        next: (data) => {
            if ( data != null && data != undefined ) {
            const newEvent = { event: 'Delete', type: 'Request', data: JSON.stringify(data)}
            setEventData( newEvent )
            }
        }
        });

        //NOTIFICATION SUBSCRIPTIONS
        client.models.Notifications.onCreate().subscribe({
            next: (data) => { const newEvent = { event: 'New', type: 'Notification', data: JSON.stringify(data)}
            setEventData( newEvent )
            }
        });

        client.models.Notifications.onUpdate().subscribe({
        next: (data) => {
            if ( data != null && data != undefined ) {
            const newEvent = { event: 'Update', type: 'Notification', data: JSON.stringify(data)}
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

    useEffect( () => {

        getNotifications();

    }, [ currentUserDetails ] );

    useEffect( () => {

        if ( eventData && eventData.data ) {
            if ( eventData.type === 'Notification' ) {
                const notificationDetails = JSON.parse( eventData.data );
                if ( notificationDetails.OrganizationID === currentUserDetails.OrgId ) {
                    if ( eventData.event === 'New' && notificationDetails.Read === false ) {
                        setNotifications( prevNotifications => [ ...prevNotifications, notificationDetails ] );
                        setUnreadNotificationCount( prevCount => prevCount + 1 );
                    }
                }
            }
        }

    }, [ eventData ] );

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
                    <div className={`${ activeItem['Admin Portal'] ? 'hidden' : 'relative inline-block'}`}>
                        <span className={`${unreadNotificationCount > 0 ? 'absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#EB7100] text-xs font-semibold text-white' : 'hidden'}`}>{unreadNotificationCount}</span>
                        <NavigationButton
                            oAction={() => {setSidebarOpen(!sidebarOpen)}}
                            oTitle="Notifications"
                            oIcon="fa-sharp fa-regular fa-bell"
                            oState={activeItem}
                        />
                    </div>
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
                        <div id="request-tabs" className="flex flex-row bg-white">
                            {requestTabs.map((tab, index) => (
                                <Tab oAction={() => clickTab(index,tab.id)} oIndex={index} oText={tab.name} oIsActive={activeTab === index} oState={tab.show} />
                            ))}
                            <div className="border-b border-gray-300 flex-grow "></div>
                        </div>
                        <div id="panels" className="flex-1 flex min-h-0 p-4">
                            {requestTabs.map( (panel) => (
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
                                                            oOpenTabs={requestTabs}
                                                            oActiveIndex={activeTab}
                                                            oCurrentTab={activeTab}
                                                            oSetOpenTabs={setRequestTabs}
                                                            oPanelId={panel.id}
                                                        />
                                                    ) : (
                                                        <>
                                                            {panel.type === 'request' ? (
                                                                <ViewRequest 
                                                                    oUser={currentUserDetails}
                                                                    oCloseTab={closeTab}
                                                                    oOpenTabs={requestTabs}
                                                                    oActiveTabId={activeTabId}
                                                                    oCurrentTab={activeTab}
                                                                />
                                                            ) : (
                                                                <ViewTask
                                                                    oUser={currentUserDetails}
                                                                    oCloseTab={closeTab}
                                                                    oOpenTabs={requestTabs}
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
                        <div id="admin-tabs" className="flex flex-row bg-white">
                            {adminTabs.map((tab, index) => (
                                <Tab oAction={() => clickTab(index,tab.id)} oIndex={index} oText={tab.name} oIsActive={activeTab === index} oState={tab.show} oCustomClass="w-[160px] text-center" />
                            ))}
                            <div className="border-b border-gray-300 flex-grow "></div>
                        </div>
                        <div id="admin-panels" className="flex-1 flex min-h-0 p-4">
                            {adminTabs.map((panel) => (
                                <React.Fragment key={panel.name}>
                                {(() => {
                                    switch (panel.name) {
                                    case 'Request Items':
                                        return (
                                        <Panel oIsActive={activeTabId === '1'} oIndex="1" oState>
                                            <ItemBuilder oUserOrg={currentUserDetails.OrgId} />
                                        </Panel>
                                        );

                                    case 'Request Forms':
                                        return (
                                        <Panel oIsActive={activeTabId === '2'} oIndex="2" oState>
                                            <FormBuilder oUserOrg={currentUserDetails.OrgId} />
                                        </Panel>
                                        );

                                    case 'Organization':
                                        return (
                                        <Panel oIsActive={activeTabId === '3'} oIndex="3" oState>
                                            <Organization oUserOrg={currentUserDetails.OrgId} />
                                        </Panel>
                                        );

                                    case 'Branding':
                                        return (
                                        <Panel oIsActive={activeTabId === '4'} oIndex="4" oState>
                                            <Branding oUserOrg={currentUserDetails.OrgId} />
                                        </Panel>
                                        );

                                    case 'Users':
                                        return (
                                        <Panel oIsActive={activeTabId === '5'} oIndex="5" oState>
                                            <ListUsers oUserOrg={currentUserDetails.OrgId} />
                                        </Panel>
                                        );

                                    default:
                                        return null;
                                    }
                                })()}
                                </React.Fragment>
                            ))}
                        </div>

                    </>
                }
            </div>
            {sidebarOpen && 
                <RightSidePanel isOpen={sidebarOpen}>
                    <div className="flex flex-col h-full">
                        <div className="flex flex-col h-[125px] w-full">
                            <div className='font-bold mb-2 text-[#EB7100] text-4xl'>Notification Manager</div>
                        </div>
                        <div className="flex-1">
                            {notifications.map( ( notification ) => (
                                <div key={notification.id} onClick={() => {openNotification(notification.id, notification.RequestID, notification.Type.toLowerCase() )}} className={`flex flex-row border rounded shadow p-4 gap-2 mb-4 ${ notification.Read ? 'border-gray-300 bg-gray-100 text-gray-600' : 'border-[#005566] bg-[#00556620] text-[#005566] hover:text-[#EB7100] hover:bg-gray-50 hover:border-[#EB7100] cursor-pointer'} `}>
                                    <div className="flex items-center justify-center w-20">
                                        <i className="fa-sharp fa-regular fa-comments-question-check text-3xl"></i>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-xl">{notification.Type} Notification</p>
                                        <p className="text-sm text-gray-600">{notification.Message}</p>
                                        <p className="text-xs text-gray-400">{new Date(notification.Date).toLocaleString()}</p>
                                    </div>
                                </div>
                            ) )}
                            {notifications.length === 0 && (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No new notifications</p>
                                </div>
                            )}
                        </div>
                        <div className="flex h-[100px] items-center justify-center w-full">
                            <StandardButton 
                                oAction={closeNotificationManager}
                                oText='Close'
                            />
                        </div>
                    </div>
                </RightSidePanel>
                    }
        </div>

    );

}

export default ZackBot;