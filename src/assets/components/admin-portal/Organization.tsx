

import { useEffect, useState } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource.ts'
import BeatLoader from "react-spinners/BeatLoader";
import Input from '../data-objects/Input';
//import Document from '../data-objects/Document';
import { handleGetDataInputChange } from '../../functions/data'
//import { setDocumentUploadText, getDocumentLink, uploadDocument } from '../../functions/document'

interface Prop {
  oUserOrg: string;
};

const client = generateClient<Schema>();


function Organization(props: Prop) {

   const [isLoading, setIsLoading] = useState( true );
   const [isEditable, setIsEditable] = useState( false );
   const [organizationData, setOrganizationData] = useState<any>({});
   const [originalOrganizationData, setOriginalOrganizationData] = useState<any>({});
 //  const [documentData, setDocumentData] = useState<any>({});

   async function getOrganizationData() {

        const currentOrganization = await client.models.Organization.get({ id: props.oUserOrg });
       // const uploadText = setDocumentUploadText(currentOrganization.data?.Logo ?? '');
       // const documentLink = await getDocumentLink( 'organization-logos', 'amplify-amplifyvitereactte-documentsbucket089ea665-w0tcqnmpispx', currentOrganization.data?.Logo ?? '' );
       // console.log(documentLink.toString())
        setOrganizationData(currentOrganization.data);
      //  setDocumentData({ UploadText: uploadText, DocumentLink: documentLink.toString(), documentData: '' });
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
        setIsLoading( true );
        await client.models.Organization.update( organizationData );
        setIsLoading( false );
        setIsEditable( false );
    //    uploadDocument( documentData.documentData, 'Logos', 'organization-logos' );
    };

   /* async function handleDocumentChange( event:any ) {

        setDocumentData({ ...documentData, UploadText: 'File: ' + event.name, documentData: event, DocumentLink: URL.createObjectURL(event) });
        setOrganizationData({ ...organizationData, Logo: event.name });

    }*/

    useEffect(() => {

        getOrganizationData();

    }, []);


    return (
        
        <div className='col12 component-layout-rows' style={{ '--gridRows': '75px 1fr' } as React.CSSProperties} >
            <div className="align-center-center">
                { 
                isEditable ? (
                    <div className="col11 align-center-right">
                    <button className="small" onClick={() => {cancelEdit()}}>Cancel</button>
                    <button className="small" onClick={() => {saveEdit()}}>Save</button>
                    </div>
                ) : (
                    <div className="col11 align-center-right">
                    <button className="standard" onClick={() => {enableEdit()}}>Edit Organization</button>
                    </div>
                )
                }
            </div>
            <>
                {isLoading ? (
                    <div className='align-center-center' style={{height:'600px'}}>
                    <BeatLoader color = "#D58936" />
                    </div>
                ) : (
                    <div className='col11 component-layout-columns' style={{ '--gridColumns': '50% 50%' } as React.CSSProperties}>
                        <div className='component-layout-rows' style={{ '--gridRows': '50px 1fr' } as React.CSSProperties}>    
                            <h3 className="col12">Organization Details</h3>
                            <div className="col12 align-top-left">
                                <Input oKey='Name' oType='text' oLabel="Name" oSize="col9" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.Name} />
                                <Input oKey='id' oType='text' oLabel="Code" oSize="col3" isRequired={true} isEditable={false} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.id}  />
                                <Input oKey='Address1' oType='text' oLabel="Street Address 1" oSize="col12" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.Address1}  />
                                <Input oKey='Address2' oType='text' oLabel="Street Address 2" oSize="col12" isRequired={false} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.Address2}  />
                                <Input oKey='City' oType='text' oLabel="City" oSize="col7" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.City}  />
                                <Input oKey='State' oType='text' oLabel="State" oSize="col2" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.State}  />
                                <Input oKey='ZipCode' oType='text' oLabel="Zip Code" oSize="col3" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.ZipCode}  />
                            </div>
                        </div>
                        <div className='component-layout-rows' style={{ '--gridRows': '50px 175px 50px 1fr' } as React.CSSProperties}>
                            <h3 className="col12">Primary Contact Details</h3>
                            <div className="col12 align-top-left">
                                <Input oKey='ContactFirstName' oType='text' oLabel="First Name" oSize="col6" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.ContactFirstName}  />
                                <Input oKey='ContactLastName' oType='text' oLabel="Last Name" oSize="col6" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.ContactLastName}  />
                                <Input oKey='ContactEmail' oType='text' oLabel="Email Address" oSize="col12" isRequired={true} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.ContactEmail}  />     
                            </div>    

                        </div>
                    </div>
                )}
            </>
        </div>
  );

};   

export default Organization;