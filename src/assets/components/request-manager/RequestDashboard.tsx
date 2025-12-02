

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import RequestQueue from './RequestQueue'
import CreateRequest from './CreateRequest'
import ViewRequest from './ViewRequest';

import 'react-tabs/style/react-tabs.css';
import '../../styles/Tabs.css'

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


function RequestDashboard ( props:Prop ) {


  return (


        <Tabs className="w-full h-full flex flex-col"
          forceRenderTabPanel={true}
          selectedIndex={props.oActiveIndex}
          onSelect={index => props.oSetActiveIndex(index)}
        >
          <TabList className="flex-none border-b border-gray-300 px-4">
            <Tab>Request Queue</Tab>
            {props.oOpenTabs.map(( item:any, index:number ) => (
              <Tab>
                {item.name}
                <i className={"fa-sharp fa-thin fa-xmark text-sm ml-5 cursor-pointer hover:text-[#D58936]"} onClick={() => {props.oCloseTab( index )}}></i>
              </Tab>
            ))}
          </TabList>
          <TabPanel className="flex-1 react-tabs__tab-panel h-full" forceRender={true}>
            <RequestQueue 
              oUserOrg={props.oUser.OrgId}
              oOpenRequest={props.oOpenRequest}
              oEvent={props.oEvent}
            />            
          </TabPanel>
          {props.oOpenTabs.map(( item:any, index:number ) => (
            <TabPanel key={item.id} className="flex-1 react-tabs__tab-panel h-full" forceRender={true}>
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


  );

}

export default RequestDashboard;
