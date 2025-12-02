

import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema, } from '../../../amplify/data/resource'
import { v4 as uuid } from "uuid";
import RequestDashboard from '../components/request-manager/RequestDashboard'
//import RequestTasks from './RequestTasks'
import AdminPortal from './admin-portal/AdminPortal'

interface Prop {
  oActiveNavTab: string;
  oUser: any;
}

const client = generateClient<Schema>();

function MainContent ( props:Prop ) {

  const [openTabs, setOpenTabs] = useState<any[]>( [] ); //List of open tabs
  const [activeIndex, setActiveIndex] = useState( 0 ); // Active tab index
  const [eventData, setEventData] = useState<any>( [] ); // Event data from subscriptions

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

  useEffect(() => {
    
    // When tabs change, set active tab to the last tab
    setActiveIndex( openTabs.length );

  },[openTabs]);

  useEffect(() => {

    createSubscriptions();

  },[]);

  return (
  <div className='border border-[#0E2841] shadow pt-8 pl-8 pr-8 mt-4 bg-white h-full rounded-tl-xl rounded-tr-xl'>
    {props.oActiveNavTab === 'menu1' && 
      <>
        <div className='w-full flex items-center justify-center mb-4'>
          <div className='w-[80%] flex items-center justify-start mb-4'>
            <h2>Request Dashboard</h2>
          </div>
          <div className='w-[20%] flex items-center justify-end mb-4'>
            <button className='standard' onClick={() => {createNewRequest()}}>Create New Request</button>
          </div>
        </div>
        <RequestDashboard 
          oUser={props.oUser} 
          oOpenTabs={openTabs}
          oSetOpenTabs={setOpenTabs}
          oActiveIndex={activeIndex}
          oSetActiveIndex={setActiveIndex}
          oCloseTab={closeTab}
          oOpenRequest={openRequest}
          oEvent={eventData}
        />
      </>
    }
    {props.oActiveNavTab === "menu2" && 
      <>My Reqest Tasks</>}
    {props.oActiveNavTab === 'menu3' && 
      <>
        <div className='w-full flex items-center justify-center mb-4'>
          <div className='w-full flex items-center justify-start mb-4'>
            <h2>Administrator's Portal</h2>
          </div>
        </div>
        <AdminPortal 
          oUserOrg={props.oUser.OrgId}
        />
      </>
    }
  </div>
  );
}

export default MainContent;
