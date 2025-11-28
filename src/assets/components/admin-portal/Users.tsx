
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource.ts'
import { handleDataInputChange } from '../../functions/data'
import BeatLoader from "react-spinners/BeatLoader";
import SideBar from "../SideBar";
import Input from '../data-objects/Input';
import Select from '../data-objects/Select';
import ToggleSwitch from '../../components/Toggle';


interface Prop {
  oUserOrg: string;
}


const typeSelect = ['Administrator|admin', 'Read-Only User|readonly', 'Standard User|standard'];
const client = generateClient<Schema>();

function Users(props: Prop) {

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState( true );
  const [isNew, setIsNew] = useState( false );
  const [isEdit, setIsEdit] = useState( false );
  const [activeItem, setActiveItem] = useState<number>( 0 );
  const [activeUser, setActiveUser] = useState<any>( [] );
  const [isWarning, setIsWarning] = useState( false );

  async function fetchUsers() {

    const currentUsers:any = await client.models.Users.list({
      limit:500,
      filter: {OrganizationID: { eq: props.oUserOrg }}
    }); 

    const sortedUsers = currentUsers.data.sort((a: any, b: any) => a.LastName.localeCompare(b.LastName));

    setUsers(sortedUsers);
    setIsLoading( false );
  };

  async function addUser() {

    setIsNew(!isNew);
    const newUsers = [ ...users ];
    newUsers.push({id: '', OrganizationID: props.oUserOrg, FirstName: '', LastName: '', Role: 'standard', Active: true});
    setUsers(newUsers);
    setActiveItem( newUsers.length - 1 );

  };

  function handleToggleSwitch() {

    if ( users[activeItem].Active ) {
      const updatedUsers = [ ...users ];
      updatedUsers[activeItem].Active = false;
      setUsers(updatedUsers);
    } else {
      const updatedUsers = [ ...users ];
      updatedUsers[activeItem].Active = true;
      setUsers(updatedUsers);
    }

  }

  function handleViewSidebar( sidebarType:string, index:number ) {

    if( sidebarType == 'new' ) {
      setIsNew(!isNew);
      setIsEdit(false);
    } else if( sidebarType == 'edit' ) {
      if( !isEdit ) {
        setIsEdit(!isEdit);
      }
      const activeUserData = { ...users[index] };
      setActiveItem( index );
      setActiveUser(activeUserData);
    };

  }

  async function saveUser( oType:string ) {
    if( oType == 'edit' ) { 
      await client.models.Users.update({
        id: users[activeItem].id,
        FirstName: users[activeItem].FirstName,
        LastName: users[activeItem].LastName,
        Role: users[activeItem].Role,
        Active: users[activeItem].Active,
      });
      setIsEdit( false);
    } else if( oType == 'new' ) {
      const newUser = await client.models.Users.create({
        OrganizationID: props.oUserOrg,
        id: users[activeItem].id,
        FirstName: users[activeItem].FirstName,
        LastName: users[activeItem].LastName,
        Role: users[activeItem].Role,
        Active: true,
      });
      if ( newUser.data === null ) {
        setIsWarning( true )
      } else {
        setIsWarning( false )
        setIsNew( false);
      }
    };

    const sortedUsers = users.sort((a: any, b: any) => a.LastName.localeCompare(b.LastName));
    setUsers(sortedUsers);

  };

  function resetForm( oType:string ) {

    if( oType == 'edit' ) {
      setIsEdit(!isEdit);
      const resetUsers = [ ...users ];
      resetUsers[activeItem] = activeUser;
      setUsers(resetUsers);
    } else if( oType == 'new' ) {
      setUsers(prevUsers => prevUsers.filter(user => user !== users[activeItem]));
      setActiveItem(0);
    };

    setIsNew(false);
    setIsEdit(false);

  };

    useEffect(() => { 

        fetchUsers();

    },[]);

  return (

    <div className="flex flex-col h-full">
      <div className="h-[75px] flex items-center justify-end">
        <button className="standard" onClick={addUser}>Add User</button>
      </div>
      <div className="flex-1 overflow-y-auto m-4 justify-start">
        { isLoading? (
            <div className='col12 align-center-center'>
                <BeatLoader color = "#D58936" />
            </div>
        ) : (
          <>
            <SideBar isOpen={isNew}>
                <div className="flex flex-col h-full">
                  <div className="flex flex-col h-[125px] w-full">
                    <div className='font-bold mb-2 text-[#005566] text-4xl'>User Manager</div>
                    <div className='font-bold text-[#005566] text-xl'>Add New User</div>
                  </div>
                  <div className="flex-1">
                    <Input oKey='FirstName' oType='text' oLabel='First Name' oSize='col12' oDescription='' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, setUsers, activeItem)} oData={users[activeItem].FirstName} />
                    <Input oKey='LastName' oType='text' oLabel='Last Name' oSize='col12' oDescription='' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, setUsers, activeItem)} oData={users[activeItem].LastName} />
                    <Input oKey='id' oType='text' oLabel='Email' oSize='col12' oDescription='' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, setUsers, activeItem)} oData={users[activeItem].id} />
                    <Select oKey='Role' oLabel='User Role' oOptions={typeSelect}  oSize='col12' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, setUsers, activeItem)} oData={users[activeItem].Role} />   
                    { isWarning ? (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> There was an issue creating this user. Please ensure the email is not already in use.</span>
                        <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setIsWarning(false)}>
                          <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                        </span>
                      </div>
                    ) : null }
                  </div>
                  <div className="flex h-[100px] items-center justify-center w-full">
                    <button className="small" style={{bottom:'25'}} onClick={() => {resetForm('new')}}>Cancel</button>
                    <button className="small" style={{bottom:'25'}} onClick={() => saveUser('new')}>Save</button>  
                  </div>         
                </div>
            </SideBar>
            <SideBar isOpen={isEdit}>
              <div className="flex flex-col h-full">
                <div className="flex flex-col h-[125px] w-full">
                  <div className='font-bold mb-2 text-[#005566] text-4xl'>User Manager</div>
                  <div className='font-bold mb-8 text-[#005566] text-2xl'>Edit User</div>
                </div>
                <div className="flex-1">
                  <Input oKey='FirstName' oType='text' oLabel='First Name' oSize='col12' oDescription='' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, setUsers, activeItem)} oData={users[activeItem].FirstName} />
                  <Input oKey='LastName' oType='text' oLabel='Last Name' oSize='col12' oDescription='' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, setUsers, activeItem)} oData={users[activeItem].LastName} />
                  <Input oKey='id' oType='text' oLabel='Email' oSize='col12' oDescription='' isRequired={false} isEditable={false} oChange={(e) => handleDataInputChange(e, setUsers, activeItem)} oData={users[activeItem].id} />
                  <Select oKey='Role' oLabel='User Role' oOptions={typeSelect}  oSize='col12' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, setUsers, activeItem)} oData={users[activeItem].Role} />
                  <ToggleSwitch label='Active User?' checked={users[activeItem].Active} onChange={handleToggleSwitch} onColor='#4E6E5D' offColor='#CCCCCC' />              
                </div>
                <div className="flex h-[100px] items-center justify-center w-full">
                  <button className="small" style={{bottom:'25'}} onClick={() => resetForm('edit')}>Cancel</button>
                  <button className="small" style={{bottom:'25'}} onClick={() => saveUser('edit')}>Save</button>  
                </div>         
                </div>
            </SideBar>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {users.map( ( user: any, index: number ) => (
                  <>
                    {user.Active ? (
                      <div key={user.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-[#D58936]" onClick={ () => { handleViewSidebar( 'edit', index ) } }>
                        <p className="text-xl font-semibold mb-2">{user.FirstName} {user.LastName}</p>
                        <p className="text-gray-600">{user.id}</p>
                        <p className="text-gray-600">Role: {user.Role}</p>
                        <p className="text-gray-600">Active: {user.Active.toString()}</p>
                      </div>
                    ) : (
                      <div key={user.id} className="bg-[#F4F4F4] rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-[#0E2841]" onClick={ () => { handleViewSidebar( 'edit', index ) } }>
                        <p className="text-gray-600 text-xl font-semibold mb-2">{user.FirstName} {user.LastName}</p>
                        <p className="text-gray-600">{user.id}</p>
                        <p className="text-gray-600">Role: {user.Role}</p>
                        <p className="text-gray-600">Active: {user.Active.toString()}</p>
                      </div>
                    )}
                  </>
                ))}
              </div>
            </div>
          </>
        )}
        
      </div>
    </div>


  );
};

export default Users;