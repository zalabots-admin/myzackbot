

import { useState, useEffect } from "react";
import { fetchUserAttributes } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource.ts'
import DesktopLogo from '../images/Logo_Default_Orange.png'
import MobileLogo from '../images/Logo_Default_White.png'
import MainContent from "../components/MainContent";
import { IconButtonLarge } from "../components/Buttons";

import '../styles/Main.css'
import '../styles/Buttons.css'
import '../styles/Objects.css'
import '@aws-amplify/ui-react/styles.css';


interface Prop {
  oSignOut: any;
  oSetShowLogo: any;
}

const client = generateClient<Schema>();

function App ( props:Prop ) {

  const [currentUserDetails, setCurrentUserDetails] = useState({firstName:'', lastName:'', emailAddress:'', OrgId:'', Role:''});
  const [activeItem, setActiveItem] = useState( 'menu1' );

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

  Hub.listen('auth', ({ payload }) => {
    switch (payload.event) {
      case 'signedOut':
        props.oSetShowLogo( true );
        break;
    }
  });

  useEffect(() => {

      getUserAttributes();
      props.oSetShowLogo( false );

  },[]);

  return (
    
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      <header className="w-full lg:w-[6%] bg-[#0E2841] text-white p-4 flex items-center justify-between lg:bg-[#F1F1F1]">
        <div className="hidden lg:flex items-center justify-start flex-col w-full h-full">
          <div className="flex flex-col h-[225px] text-[#005566] items-center justify-start mt-5">
            <img className="h-25 mb-5 " src={DesktopLogo} alt='ZackBot Logo' />
            <p className="text-xl">Hello</p>
            <p className="text-xl">{currentUserDetails.firstName}!</p>
          </div>
          <div className="flex-1">    
            <IconButtonLarge
              oAction={() => {setActiveItem('menu1')}}
              oTitle="Request Dashboard"
              oIcon="fa-sharp fa-thin fa-comments-question-check"
            />
            {/*<IconButtonLarge
              oAction={() => {setActiveItem('menu2')}}
              oTitle="My Tasks"
              oIcon="fa-sharp fa-thin fa-list-check"
            />*/}
            { currentUserDetails.Role === 'admin' && (
              <IconButtonLarge
                oAction={() => {setActiveItem('menu3')}}
                oTitle="Admin Portal"
                oIcon="fa-sharp fa-thin fa-screwdriver-wrench"
              />
            )}

          </div>
          <div className="flex h-[100px] items-center justify-center w-full">
            <IconButtonLarge
              oAction={props.oSignOut}
              oTitle="Sign Out"
              oIcon="fa-sharp fa-thin fa-right-from-bracket"
            />
          </div>
        </div>
        <div className="lg:hidden flex items-center justify-start w-full">
          <img className="h-15" src={MobileLogo} alt='ZackBot Logo' />
          <div className="ml-2 w-70">
            <p className="text-2xl text-white font-bold">ZackBot</p>
            <p className="text-md text-white font-bold">The Information Request Concierge</p>
          </div>
          <button className="text-white focus:outline-none w-10 h-10 ml-auto">
            <svg className ="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
      <main className="w-full lg:w-[94%] bg-[#F1F1F1] pt-4 pr-6">
        <MainContent
          oActiveNavTab={activeItem}
          oUser={currentUserDetails}
        />       
      </main>
    </div>
      
  );
  
}

export default App;

