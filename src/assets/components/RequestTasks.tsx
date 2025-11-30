

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import RequestQueue from './request-manager/RequestQueue'
import CreateRequest from './request-manager/CreateRequest'
import ViewRequest from './request-manager/ViewRequest';

import 'react-tabs/style/react-tabs.css';
import '../styles/Tabs.css'

interface Prop {
  oUser: any;
  oOpenTabs: any;
  oSetOpenTabs: any;
  oActiveIndex: number;
  oSetActiveIndex: any;
  oCloseTab: any;
  oOpenRequest: any;
  oEvent: any;
}


function RequestTasks ( props:Prop ) {


  return (

    <div className='col12 align-top-center'>
      <div className='col11 align-top-center'>
        <Tabs
          forceRenderTabPanel={true}
          selectedIndex={props.oActiveIndex}
          onSelect={index => props.oSetActiveIndex(index)}
        >
          <TabList>
            <Tab>Tasks Queue</Tab>
            {props.oOpenTabs.map(( item:any, index:number ) => (
              <Tab>
                {item.name}
                <i className={"fa-sharp fa-thin fa-xmark text-sm ml-5 cursor-pointer hover:text-[#D58936]"} onClick={() => {props.oCloseTab( index )}}></i>
              </Tab>
            ))}
          </TabList>
          <TabPanel forceRender={true}>
            <RequestQueue 
              oUserOrg={props.oUser.OrgId}
              oOpenRequest={props.oOpenRequest}
              oEvent={props.oEvent}
            />            
          </TabPanel>
          {props.oOpenTabs.map(( item:any, index:number ) => (
            <TabPanel key={item.id} forceRender={true}>
              {item.isEditable ? (
                <>
                  <CreateRequest
                      oUser={props.oUser}
                      oCloseTab={props.oCloseTab}
                      oOpenTabs={props.oOpenTabs}
                      oActiveIndex={props.oActiveIndex}
                      oCurrentTab={index}
                      oSetOpenTabs={props.oSetOpenTabs}
                    />
                  </>
              ) : (
               <>  <ViewRequest
                    oOpenTabs={props.oOpenTabs}
                    oCurrentTab={index}
                    oUser={props.oUser}
                />
              </>
              )}
            </TabPanel>
          ))}
        </Tabs>
      </div>
    </div>
  );

}

export default RequestTasks;
