

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import RequestQueue2 from './RequestQueue2'
import TaskQueue from './TaskQueue';
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
  oActiveItem: any;
}


function RequestDashboard ( props:Prop ) {


  return (

        <Tabs className="w-full flex flex-col"
          forceRenderTabPanel={true}
          selectedIndex={props.oActiveIndex}
          onSelect={index => props.oSetActiveIndex(index)}
        >
          <TabList className="flex-none border-b border-gray-300 px-4">
            { props.oActiveItem['Request Queue'] && <Tab key="request-queue">Request Queue</Tab> }
            { props.oActiveItem['Tasks Queue'] && <Tab>Tasks Queue</Tab> }
            {props.oOpenTabs.map(( item:any, index:number ) => (
              <Tab key={item.id}>
                {item.name}
                <i className={"fa-sharp fa-thin fa-xmark text-sm ml-5 cursor-pointer hover:text-[#D58936]"} onClick={() => {props.oCloseTab( index )}}></i>
              </Tab>
            ))}
          </TabList>
          <div className="flex-1 h-full">
            { props.oActiveItem['Request Queue'] && 
              <TabPanel className="react-tabs__tab-panel" forceRender={true}>
                <RequestQueue2 
                  oUserOrg={props.oUser.OrgId}
                  oOpenRequest={props.oOpenRequest}
                  oEvent={props.oEvent}
                />            
              </TabPanel>
            } 
            { props.oActiveItem['Tasks Queue'] && 
              <TabPanel className="react-tabs__tab-panel" forceRender={true}>
                <TaskQueue 
                  oUserOrg={props.oUser.OrgId}
                  oOpenRequest={props.oOpenRequest}
                  oEvent={props.oEvent}
                />          
              </TabPanel>
            } 
            {props.oOpenTabs.map(( item:any, index:number ) => (
              <TabPanel key={item.id} className="react-tabs__tab-panel" forceRender={true}>
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
          </div>
        </Tabs>

  );

}

export default RequestDashboard;
