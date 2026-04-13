

import { useEffect, useState } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource.ts'
import BeatLoader from "react-spinners/BeatLoader";
import Input from '../data-objects/Input';
import { handleGetDataInputChange } from '../../functions/data'
import { SmallButton, StandardButton } from "../Buttons.tsx";

interface Prop {
  oUserOrg: string;
};

const client = generateClient<Schema>();


function Organization(props: Prop) {

   const [isLoading, setIsLoading] = useState( true );
   const [isEditable, setIsEditable] = useState( false );
   const [organizationData, setOrganizationData] = useState<any>({});
   const [originalOrganizationData, setOriginalOrganizationData] = useState<any>({});
   const [isSaving, setIsSaving] = useState( false );

   async function getOrganizationData() {

        const currentOrganization = await client.models.Organization.get({ id: props.oUserOrg });
        setOrganizationData(currentOrganization.data);
        setIsLoading(false);

    };

    function enableEdit() {

        setOriginalOrganizationData( organizationData );
        setIsEditable( true );

    };

    function cancelEdit() {

        setOrganizationData( originalOrganizationData );
        setIsEditable( false );

    };

    async function saveEdit() {

        setIsSaving( true );
        await client.models.Organization.update( organizationData );
        setIsLoading( false );
        setIsEditable( false );
        setIsSaving( false );

    };

    useEffect(() => {

        getOrganizationData();

    }, []);


    return (
        
        <div id="organization-manager" className="flex-1 flex flex-row min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 w-1/4 p-4">
                <section className="flex-1 flex flex-col items-center min-h-0 bg-white p-6 pt-10 rounded shadow overflow-y-auto border border-gray-300">
                    {/* Header Section */}
                    <div className="flex justify-center items-center mb-4 w-full">
                        <div className={`h2 text-xl h-10 ${isEditable ? 'w-1/3':'w-full'}`}>Organization Manager</div>
                        {isEditable ? (
                            <div className="flex flex-row justify-end items-center w-2/3">
                                <SmallButton
                                    oAction={cancelEdit}
                                    oText="Cancel"
                                />
                                <SmallButton
                                    oAction={saveEdit}
                                    oText="Save"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-row justify-end items-center w-2/3">
                                <StandardButton oAction={enableEdit} oText="Edit Organization" />
                            </div>
                        )}
                    </div>
                    <>
                        {isLoading ? (
                            <div className="flex-1 flex justify-center items-center">
                            <BeatLoader color = "#D58936" />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-row overflow-y-auto mt-4">
                                {/* Saving Overlay */}
                                {isSaving && (
                                    <div className='absolute z-10 inset-0 bg-white/70 flex justify-center items-center'>
                                        <BeatLoader color = "#D58936" />
                                    </div>
                                )}
                                <div className="flex-1 flex flex-row min-h-0 bg-white p-6 pt-10 rounded shadow overflow-hidden border border-gray-300" >
                                    {/* Section Content */}
                                    <div className="flex-1 flex flex-col mr-4 w-1/2">    
                                        <div className="h2 mb-4">Organization Details</div>
                                        <div className="flex flex-wrap items-start">
                                            <Input oKey='Name' oType='text' oLabel="Name" oSize="col9" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.Name} />
                                            <Input oKey='id' oType='text' oLabel="Code" oSize="col3" isRequired={true} isEditable={false} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.id}  />
                                            <Input oKey='Address1' oType='text' oLabel="Street Address 1" oSize="col12" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.Address1}  />
                                            <Input oKey='Address2' oType='text' oLabel="Street Address 2" oSize="col12" isRequired={false} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.Address2}  />
                                            <Input oKey='City' oType='text' oLabel="City" oSize="col7" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.City}  />
                                            <Input oKey='State' oType='text' oLabel="State" oSize="col2" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.State}  />
                                            <Input oKey='ZipCode' oType='text' oLabel="Zip Code" oSize="col3" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.ZipCode}  />
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col w-1/2">
                                        <div className="h2 mb-4">Primary Contact Details</div>
                                        <div className="flex flex-wrap items-start">
                                            <Input oKey='ContactFirstName' oType='text' oLabel="First Name" oSize="col6" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.ContactFirstName}  />
                                            <Input oKey='ContactLastName' oType='text' oLabel="Last Name" oSize="col6" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.ContactLastName}  />
                                            <Input oKey='ContactEmail' oType='text' oLabel="Email Address" oSize="col12" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.ContactEmail}  />     
                                        </div>    
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                </section>
            </div>
        </div>
  );

};   

export default Organization;