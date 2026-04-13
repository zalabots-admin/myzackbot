

import { useEffect, useState, useRef  } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource.ts'
import BeatLoader from "react-spinners/BeatLoader";
import Input from '../data-objects/Input.tsx';
import Document from '../data-objects/Document.tsx';
import { handleGetDataInputChange } from '../../functions/data.ts'
import { setDocumentUploadText, uploadDocument } from '../../functions/document.ts'
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from "tinymce";
import { SmallButton, StandardButton } from '../../components/Buttons';


interface Prop {
  oUserOrg: string;
};

const client = generateClient<Schema>();


function Branding(props: Prop) {

   const [isLoading, setIsLoading] = useState( true );
   const [isEditable, setIsEditable] = useState( false );
   const [organizationData, setOrganizationData] = useState<any>({});
   const [originalOrganizationData, setOriginalOrganizationData] = useState<any>({});
   const [documentData, setDocumentData] = useState<any>({});
   const [imgURL, setImgURL] = useState<string>( '' );
   const editorRef = useRef<TinyMCEEditor | null>(null);



   async function getOrganizationData() {

        const currentOrganization = await client.models.Organization.get({ id: props.oUserOrg });
        const uploadText = await setDocumentUploadText(currentOrganization.data?.Logo ?? '');
        setDocumentData({ UploadText:uploadText, DocumentLink: '', documentData: '' });
        setImgURL( import.meta.env.VITE_DOC_URL + 'organization-logos/' + currentOrganization.data?.Logo );
        setIsLoading(false);
        setOrganizationData(currentOrganization.data);

    };

    function enableEdit() {

        setOriginalOrganizationData( organizationData );
        setIsEditable( true );
        
    };

    async function cancelEdit() {

        setOrganizationData( originalOrganizationData );
        const uploadText = await setDocumentUploadText(originalOrganizationData.Logo ?? '');
        setDocumentData({ UploadText: uploadText });
        setIsEditable( false );
        setImgURL( import.meta.env.VITE_DOC_URL + 'organization-logos/' + originalOrganizationData?.Logo );
    };

    async function saveEdit() {

        var html = '';
        if (editorRef.current) {
            html = editorRef.current.getContent();
            console.log(html); // <-- Rich HTML from TinyMCE
        }

        const copyOrganizationData = { ...organizationData };
        copyOrganizationData.EmailContent = html;
        setOrganizationData( copyOrganizationData );

        if ( documentData.DocumentChange ) {
            await client.models.Organization.update( { id: organizationData.id, Logo: organizationData.Logo, PrimaryColor: organizationData.PrimaryColor, SecondaryColor: organizationData.SecondaryColor, EmailContent: html, LogoWidth: organizationData.LogoWidth } );
            await uploadDocument( documentData.documentData, 'organization-logos', organizationData.Logo );
            setImgURL( import.meta.env.VITE_DOC_URL + 'organization-logos/' + organizationData?.Logo );
        } else {
            await client.models.Organization.update( { id: organizationData.id, PrimaryColor: organizationData.PrimaryColor, SecondaryColor: organizationData.SecondaryColor, EmailContent: html, LogoWidth: organizationData.LogoWidth } );
        }

        setDocumentData({ ...documentData, DocumentChange: false });
        setIsLoading( false );
        setIsEditable( false );
        
    };

    async function handleDocumentChange( event:any ) {

        setOrganizationData({ ...organizationData, Logo: organizationData.id + event.name });
        setDocumentData({ ...documentData, UploadText: 'File: ' + organizationData.id + event.name, documentData: event, DocumentLink: URL.createObjectURL(event), DocumentChange: true });
        const reader = new FileReader();
            reader.onloadend = () => {
            setImgURL(reader.result as string);
        };
        reader.readAsDataURL(event);

    }


    useEffect(() => {

        getOrganizationData();

    }, []);


    return (
        <div id="branding-manager" className="flex-1 flex flex-row min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 w-1/4 p-4">
                <section className="flex-1 flex flex-col items-center min-h-0 bg-white p-6 pt-10 rounded shadow overflow-y-auto border border-gray-300">
                    {/* Header Section */}
                    <div className="flex justify-center items-center mb-4 w-full">
                        <div className={`h2 text-xl h-10 ${isEditable ? 'w-1/3':'w-full'}`}>Brand Manager</div>
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
                                <StandardButton oAction={enableEdit} oText="Edit Branding" />
                            </div>
                        )}
                    </div>
                    { isLoading ? (
                        <div className="h-full w-full flex items-center justify-center">
                            <BeatLoader color = "#D58936" />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-row min-h-0 bg-white p-6 rounded shadow overflow-hidden border border-gray-300" >
                            {/* Section Content */}
                            <div  className="flex-1 min-h-0 flex flex-row gap-4">
                                <div className="flex-1 flex flex-col w-1/2 p-2">    
                                    <div className="h2 mb-4">Organization Details</div>
                                    <div className='flex-1 flex flex-wrap overflow-y-auto'>
                                        <div className="w-[20%] flex flex-col justify-center items-center">
                                            <Input oKey='PrimaryColor' oType='color' oLabel="Colors:" oSize="col12" isRequired={false} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.PrimaryColor}  />
                                            <Input oKey='SecondaryColor' oType='color' oLabel="" oSize="col12" isRequired={false} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.SecondaryColor}  />
                                        </div>
                                        <div className="w-[80%] flex flex-row justify-center items-start gap-4">
                                            <Document isRequired={false} isEditable={isEditable} oSize="col9" oChange={(e) => handleDocumentChange(e)} oData={{ UploadText: documentData.UploadText, DocumentId: documentData.DocumentLink, Label: 'Logo:',  }}  />
                                            <Input oKey='LogoWidth' oType='text' oLabel="Logo Width (in px):" oSize="col3" isRequired={false} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.LogoWidth}  />
                                        </div>
                                        <div className="w-full">
                                            <p>Email Content:</p>
                                            <Editor
                                                onInit={(_evt:any, editor: any) => editorRef.current = editor }
                                                apiKey='6i6klk4xam8ka7wpzypv1p2avowa3muwe8nxldmqrers2mms'
                                                init={{
                                                plugins: [
                                                    //'mergetags'
                                                ],

                                                menubar: false,
                                                toolbar: 'fontfamily fontsize | bold italic underline align | mergetags',
                                                
                                                mergetags_list: [
                                                    { value: 'AccountName', title: 'Account Name' },
                                                    { value: 'RequestedFor', title: 'Requested For' },
                                                    { value: 'DueDate', title: 'Due Date' },
                                                    {
                                                    title: 'Request Task',
                                                    menu: [
                                                        { value: 'FirstName', title: 'First Name' },
                                                        { value: 'LastName', title: 'Last Name' },
                                                        { value: 'EntityName', title: 'Entity Name' },
                                                        { value: 'Instructions', title: 'Instructions' }
                                                    ],
                                                    }
                                                ],

                                                // CUSTOM CSS INSIDE EDITOR IFRAME
                                                content_style: `
                                                    .mce-mergetag {
                                                    display: inline-flex;
                                                    align-items: center;
                                                    background-color: #D5893620;
                                                    color: #D58936;
                                                    font-weight: 600;
                                                    padding: 2px 12px;
                                                    border-radius: 25px;
                                                    border: 1px solid #D58936;
                                                    cursor: default;
                                                    margin-right: 2px;
                                                    white-space: nowrap;
                                                    user-select: none;
                                                    }

                                                    .mce-mergetag:hover {
                                                    background-color: #dbeafe;
                                                    }
                                                    .mce-mergetag-affix {
                                                    display: none;
                                                    }
                                                    /* Visual cue for selection/deletion */
                                                    .merge-tag-token.mce-selected {
                                                    outline: 2px solid #60a5fa;
                                                    background-color: #dbeafe;
                                                    }
                                                `
                                                }}
                                                disabled={!isEditable}
                                                initialValue={organizationData.EmailContent}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 w-1/2 flex flex-col">
                                    <div className="h2 mb-4">Request Task Email Preview</div>
                                    <div className="flex-1 flex items-start justify-center overflow-y-auto overflow-x-hidden p-8 rounded shadow border border-gray-300">
                                        <div className="flex flex-col justify-center bg-[#f6f6f6] p-16">
                                            <div className="flex justify-center bg-white p-8 w-full">
                                                <img data-proportionally-constrained="true" data-responsive="false" width={organizationData.LogoWidth} src={imgURL}/>
                                            </div>
                                            <div className="flex flex-col items-center justify-center bg-white p-8 text-[43pt] text-center" style={{color: organizationData.PrimaryColor}}><p>New Information</p><p>Request</p></div>
                                            <div className="bg-white p-8" dangerouslySetInnerHTML={{ __html: organizationData.EmailContent }}></div>
                                            <div className="flex justify-center bg-white p-12"><button className="w-60 text-white p-4" style={{backgroundColor: organizationData.PrimaryColor}}>Open Request Form</button></div>
                                            <div className="bg-[#6E6E6E] pt-16 pb-16 pr-8 pl-8 text-white text-center">
                                                <span style={{fontSize:'24px'}}>What Happens Next?</span><br/>
                                                Once completed, your response is sent directly back to the requestor.<br/><br/> Please do not reply to this email.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );

};   

export default Branding;