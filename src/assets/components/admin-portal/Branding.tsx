

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
        setImgURL( import.meta.env.VITE_IMG_URL + originalOrganizationData?.Logo );
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
            await client.models.Organization.update( { id: organizationData.id, Logo: organizationData.Logo, PrimaryColor: organizationData.PrimaryColor, SecondaryColor: organizationData.SecondaryColor, EmailContent: html } );
            uploadDocument( documentData.documentData, 'organization-logos', organizationData.Logo );
        } else {
            await client.models.Organization.update( { id: organizationData.id, PrimaryColor: organizationData.PrimaryColor, SecondaryColor: organizationData.SecondaryColor, EmailContent: html } );
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
        <div className="w-full h-full p-2">
            { isLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                    <BeatLoader color = "#D58936" />
                </div>
            ) : (
                <div className="h-full grid grid-rows-[100px_1fr]" >
                    <div className="w-full flex justify-end items-center">
                        { 
                        isEditable ? (
                            <div className="flex gap-2">
                                <SmallButton oAction={() => {cancelEdit()}} oText="Cancel" />
                                <SmallButton oAction={() => {saveEdit()}} oText="Save" />
                            </div>
                        ) : (
                            <div>
                                <StandardButton oAction={() => {enableEdit()}} oText="Edit Branding" />
                            </div>
                        )
                        }
                    </div>
                    <div  className="w-full h-full flex flex-row gap-4">
                        <div className="w-[48%] flex flex-col">    
                            <div>
                                <h3>Organization Branding</h3>
                            </div>
                            <div className='w-full flex flex-wrap'>
                                <div className="w-[20%] flex flex-col justify-center items-center">
                                    <Input oKey='PrimaryColor' oType='color' oLabel="Colors:" oSize="col12" isRequired={false} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.PrimaryColor}  />
                                    <Input oKey='SecondaryColor' oType='color' oLabel="" oSize="col12" isRequired={false} isEditable={isEditable} oChange={(e) => handleGetDataInputChange(e, setOrganizationData)} oData={organizationData.SecondaryColor}  />
                                </div>
                                <div className="w-[80%] flex flex-col justify-center items-center">
                                    <Document isRequired={false} isEditable={isEditable} oSize="col12" oChange={(e) => handleDocumentChange(e)} oData={{ UploadText: documentData.UploadText, DocumentId: documentData.DocumentLink, Label: 'Logo:',  }}  />
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
                        <div className="w-[52%] flex flex-col">
                            Request Task Email Preview:
                            <div className="h-[600px] flex items-start overflow-y-auto overflow-x-hidden p-8 rounded shadow border border-gray-300">
                                <div className="flex flex-col justify-center bg-[#f6f6f6] p-16">
                                    <div className="flex justify-center bg-white p-8">
                                        <img data-proportionally-constrained="true" data-responsive="false" width="100" src={imgURL}/>
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
        </div>
    );

};   

export default Branding;