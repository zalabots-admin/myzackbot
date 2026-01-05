

import { useState, useEffect } from "react";
import { fetchUserAttributes } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { generateClient } from 'aws-amplify/data';
import type { Schema, } from '../../../amplify/data/resource'
import { v4 as uuid } from "uuid";
import RequestDashboard from '../components/request-manager/RequestDashboard'
import AdminPortal from '../components/admin-portal/AdminPortal'
import { LogOutButton, NavigationButton, StandardButton } from '../components/Buttons';
import HeaderLogo from '../images/ZBT_Logo_Default.png'

interface Prop {
  oSignOut: any;
  oSetShowLogIn: any;
  oSetMainLayout: any;
}

const client = generateClient<Schema>();


function App(props: Prop) {

    const [menuOpen, setMenuOpen] = useState(false);
    const [currentUserDetails, setCurrentUserDetails] = useState({firstName:'', lastName:'', emailAddress:'', OrgId:'', Role:''});
    const [activeItem, setActiveItem] = useState( {'Request Queue':true, 'Tasks Queue':false, 'Admin Portal':false} ); //Currently active navigation item
    const [openTabs, setOpenTabs] = useState<any[]>( [] ); //List of open tabs
    const [activeIndex, setActiveIndex] = useState( 0 ); // Active tab index
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

        let newActiveItem;
        if ( oItem === 'Admin Portal' ) {
            newActiveItem = { 'Request Queue':false, 'Tasks Queue':false, 'Admin Portal':true };
        } else {
            newActiveItem = { ... activeItem, 'Admin Portal': false };
            if ( newActiveItem[oItem as keyof typeof newActiveItem] === true ) {
                newActiveItem[oItem as keyof typeof newActiveItem] = false;
            } else {
                newActiveItem[oItem as keyof typeof newActiveItem] = true;
            }
        }
        if ( newActiveItem['Request Queue'] === true && newActiveItem['Tasks Queue'] === true ) {
            if ( oItem === 'Tasks Queue' ) {
                setActiveIndex(1);
            } else {
                setActiveIndex(0);
            }
        } else {
            setActiveIndex(0);
        }
        setActiveItem( newActiveItem );


    }

    function createNewRequest() {

        const newTab = {
        id: uuid(),
        name: 'New Request',
        status: 'New', 
        isEditable: true
        } 

        setOpenTabs( prevItems => [...prevItems, newTab] );
        setActiveIndex( (openTabs.length+1) )
    };

    async function openRequest( oId:string, oName:string, oStatus:string ) {

        let newTab = {
            id: oId,
            name: oName,
            status: oStatus,
            isEditable: false       
        };

        if ( oStatus === 'Draft' ) {
        newTab.isEditable = true; 
        }

        setOpenTabs(prevItems => [...prevItems, newTab]);

    };

    function closeTab( oId:number ) {

        const newTabList = openTabs.filter( (_, index) => index !== oId );
        setOpenTabs( newTabList );

    };

    function createSubscriptions() {

        client.models.Request.onCreate().subscribe({
        next: (data) => {
            const newEvent = {
            event: 'New',
            data: JSON.stringify(data)
            }
            setEventData( newEvent )
        }
        });

        client.models.Request.onUpdate().subscribe({
        next: (data) => {
            if ( data != null && data != undefined ) {
            const newEvent = {
                event: 'Update',
                data: JSON.stringify(data)
            }
            setEventData( newEvent )
            }
        }
        });

        client.models.Request.onDelete().subscribe({
        next: (data) => {
            if ( data != null && data != undefined ) {
            const newEvent = {
                event: 'Delete',
                data: JSON.stringify(data)
            }
            setEventData( newEvent )
            }
        }
        });

    }

    Hub.listen('auth', ({ payload }) => {
    switch (payload.event) {
        case 'signedOut':
        props.oSetShowLogIn( true );
        props.oSetMainLayout( 'lg:w-[40%] lg:h-full h-1/2 flex items-center justify-center' );
        break;
    }
    });

    useEffect(() => {
        
        // When tabs change, set active tab to the last tab
        setActiveIndex( openTabs.length );

    },[openTabs]);

    useEffect(() => {

        getUserAttributes();
        props.oSetShowLogIn( false );
        props.oSetMainLayout( 'w-full overflow-hidden' );
        createSubscriptions();

    },[]);


    return (

        <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="flex items-center justify-between px-6 border-b border-gray-200 bg-white shadow-md w-full h-16 lg:h-20 lg:pt-4">
                <div className="flex items-center space-x-3">
                    <img className="h-10 lg:h-12" src={HeaderLogo} alt='ZackBot Logo' />
                    <p className="text-[#FD6800] text-2xl lg:text-3xl">ZACK<span className="font-bold">BOT</span></p>
                </div>
                {/* Hamburger button - visible on mobile */}
                <button className="lg:hidden p-2 focus:outline-none" onClick={() => setMenuOpen(!menuOpen)}>
                    <div className="w-6 h-0.5 bg-black mb-1"></div>
                    <div className="w-6 h-0.5 bg-black mb-1"></div>
                    <div className="w-6 h-0.5 bg-black"></div>
                </button>

                {/* Menu links - visible on larger screens */}
                <div className="hidden lg:flex space-x-6">
                    <NavigationButton
                        oAction={() => {setNavigationItem( 'Request Queue' )}}
                        oTitle="Request Queue"
                        oIcon="fa-sharp fa-regular fa-comments-question-check"
                        oState={activeItem}
                    />
                    <NavigationButton
                        oAction={() => {setNavigationItem( 'Tasks Queue' )}}
                        oTitle="Tasks Queue"
                        oIcon="fa-sharp fa-regular fa-clipboard-list-check"
                        oState={activeItem}
                    />
                    { currentUserDetails.Role === 'admin' && (
                        <NavigationButton
                            oAction={() => {setNavigationItem( 'Admin Portal' )}}
                            oTitle="Admin Portal"
                            oIcon="fa-sharp fa-regular fa-screwdriver-wrench"
                            oState={activeItem}
                        />
                    )}
                    <i title="Requests" className={"fa-thin fa-thin fa-pipe text-3xl lg:text-2xl text-gray-500"}></i>
                    <LogOutButton
                        oAction={props.oSignOut}
                        oTitle="Log Out"
                        oIcon="fa-sharp fa-solid fa-right-from-bracket"
                    />
                
                </div>
            </div>

            {/* Mobile menu - only shows when hamburger is clicked */}
            {menuOpen && (
                <div className="lg:hidden bg-white shadow-md px-4 py-2 space-y-2">
                <a href="#" className="block hover:text-gray-700" onClick={() => setMenuOpen(false)}>Requests</a>
                <a href="#" className="block hover:text-gray-700" onClick={() => setMenuOpen(false)}>Tasks</a>
                { currentUserDetails.Role === 'zack' && (
                    <a href="#" className="block hover:text-gray-700" onClick={() => setMenuOpen(false)}>Admin</a>
                )}
                <a href="#" className="block hover:text-gray-700" onClick={() => setMenuOpen(false)}>Log Out</a>
                </div>
            )}

            {/* App Content */}
            <div id="main" className="flex flex-col items-center w-full p-6">
            {(activeItem['Request Queue'] || activeItem['Tasks Queue']) && 
                <>
                    <div className='w-full flex items-center justify-center mb-8'>
                        <div className='w-full flex items-center justify-center lg:w-3/4 lg:justify-start'>
                            <h2>Request Dashboard</h2>
                        </div>
                        <div className='hidden lg:w-1/4 lg:flex lg:items-center lg:justify-end'>
                            <StandardButton
                                oAction={createNewRequest}
                                oText="Create New Request"
                            />
                        </div>
                    </div>
                    <RequestDashboard 
                        oUser={currentUserDetails} 
                        oOpenTabs={openTabs}
                        oSetOpenTabs={setOpenTabs}
                        oActiveIndex={activeIndex}
                        oSetActiveIndex={setActiveIndex}
                        oCloseTab={closeTab}
                        oOpenRequest={openRequest}
                        oEvent={eventData}
                        oActiveItem={activeItem}
                    />
                </>
                }
                {activeItem['Admin Portal'] && 
                <>
                    <div className='w-full flex items-center justify-center mb-8'>
                        <div className='w-full flex items-center justify-start mb-8'>
                            <h2>Administrator's Portal</h2>
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

export default App;