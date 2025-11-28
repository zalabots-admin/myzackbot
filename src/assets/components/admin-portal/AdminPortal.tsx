

import ItemBuilder from './ItemBulder';
import FormBuilder from './FormBuilder';
import Organization from './Organization';
import Branding from './Branding';
import ListUsers from './Users';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../../styles/Tabs.css'

interface Prop {
  oUserOrg: string;
};


export function AdminPortal( props:Prop) {

   return (
    <div className='col112 align-top-center'>
      <div className='col11 align-top-center'>
        <Tabs>
          <TabList>
            <Tab style={{ width: '150px' }}>Request Items</Tab>
            <Tab style={{ width: '150px' }}>Request Forms</Tab>
            <Tab style={{ width: '150px' }}>Organization</Tab>
            <Tab style={{ width: '150px' }}>Branding</Tab>
            <Tab style={{ width: '150px' }}>Users</Tab>
            {/*<Tab style={{ width: '150px' }}>Billing</Tab>*/}
          </TabList>

          <TabPanel>
            <ItemBuilder oUserOrg={props.oUserOrg} />
          </TabPanel>
          <TabPanel>
            <FormBuilder oUserOrg={props.oUserOrg} />
          </TabPanel>
          <TabPanel>
            <Organization oUserOrg={props.oUserOrg} />
          </TabPanel>
          <TabPanel>
            <Branding oUserOrg={props.oUserOrg} />
          </TabPanel>
          <TabPanel>
            <ListUsers oUserOrg={props.oUserOrg} />
          </TabPanel>
          {/*<TabPanel>Billing</TabPanel>*/}
        </Tabs>
        </div>
      </div>

   
  );
}

export default AdminPortal;
