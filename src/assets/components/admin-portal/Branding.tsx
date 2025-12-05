

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
        setOrganizationData(currentOrganization.data);
        setDocumentData({ UploadText:uploadText, DocumentLink: '', documentData: '' });
        setImgURL( import.meta.env.VITE_IMG_URL + currentOrganization.data?.Logo );
        setIsLoading(false);

    };

    function enableEdit() {

        if (editorRef.current) {
            editorRef.current.setMode('design');
        }
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

        //setIsLoading( true );
        await client.models.Organization.update( { id: organizationData.id, Logo: organizationData.Logo, PrimaryColor: organizationData.PrimaryColor, SecondaryColor: organizationData.SecondaryColor, EmailContent: html } );
        setIsLoading( false );
        setIsEditable( false );
        uploadDocument( documentData.documentData, 'organization-logos', organizationData.Logo );
    };

    async function handleDocumentChange( event:any ) {

        setOrganizationData({ ...organizationData, Logo: organizationData.id + event.name });
        setDocumentData({ ...documentData, UploadText: 'File: ' + organizationData.id + event.name, documentData: event, DocumentLink: URL.createObjectURL(event) });
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
        <div className='col12 component-layout-rows' style={{ '--formPrimaryColor': `${organizationData?.PrimaryColor}`, '--formSecondaryColor': `${organizationData?.SecondaryColor}` } as React.CSSProperties} >
            { isLoading ? (
                <div className='col12 align-center-center' style={{height:'100vh'}}>
                    <BeatLoader color = "#D58936" />
                </div>
            ) : (
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
                            <button className="standard" onClick={() => {enableEdit()}}>Edit Branding</button>
                            </div>
                        )
                        }
                    </div>
                    <div className='col12 component-layout-columns' style={{ '--gridColumns': '50% 50%' } as React.CSSProperties}>
                        <div className='component-layout-rows' style={{ '--gridRows': '25px 1fr' } as React.CSSProperties}>    
                            <div>
                                <h3 className="col12">Organization Branding</h3>
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
                                        onInit={(_evt:any, editor: any) => { editorRef.current = editor; editor.setMode('readonly'); }}
                                        apiKey='6i6klk4xam8ka7wpzypv1p2avowa3muwe8nxldmqrers2mms'
                                        init={{
                                            plugins: [
                                            // Core editing features
                                            'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                                            // Advanced features
                                            'mergetags', 'typography', 'inlinecss', 'markdown'
                                            ],
                                            menubar: false,
                                            toolbar: 'fontfamily fontsize | bold italic underline align | mergetags',
                                            mergetags_list: [
                                                { value: 'AccountName', title: 'Account Name' },
                                                { value: 'RequestedFor', title: 'Requested For' },
                                                { value: 'DueDate', title: 'Due Date' },
                                                { title: 'Request Task',
                                                    menu: [
                                                        { value: 'FirstName', title: 'First Name' },
                                                        { value: 'LastName', title: 'Last Name' },
                                                        { value: 'EntityName', title: 'Entity Name' },
                                                        { value: 'Instructions', title: 'Instructions' }
                                                    ],
                                                }
                                            ]
                                        }}
                                        initialValue={organizationData.EmailContent}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            Request Email Preview
                            <div className='col12 align-top-center overflow-scroll card-flat' style={{height:'600px', backgroundColor: '#F6F6F6', fontFamily: 'Arial, sans-serif', padding:'40px'}}>
                                <div className='col11 align-center-center' style={{'height':'150px', backgroundColor: '#FFFFFF'}}>
                                    <img src={imgURL} style={{maxHeight:'75px', maxWidth:'200px'}}/>
                                </div>
                                <div className='col11 align-center-center emailHeader' style={{'height':'150px'}}>New Information Request</div>
                                <div dangerouslySetInnerHTML={{ __html: organizationData.EmailContent }}></div>
                                <div className='col11 align-center-center' style={{'height':'100px', backgroundColor: '#FFFFFF'}}><button className="emailButton">Open Request Form</button></div>
                                <div className='col11 align-center-center' style={{'height':'300px', backgroundColor: '#6E6E6E', color: '#FFFFFF', textAlign: 'center', fontSize:'18px'}}>
                                    <span style={{fontSize:'24px'}}>What Happens Next?</span><br/>
                                    Once completed, your response is sent directly back to the requestor.<br/><br/> Please do not reply to this email.
                                </div>
                            </div>
                        </div>
                       {/* <div>   
                            Request Form Preview
                            <div className='col12 overflow-scroll card-flat' style={{height:'600px', position:'relative'}}>
                                <div className='col11 action-menu-preview' style={{ '--primaryColor': `${organizationData.PrimaryColor}` } as React.CSSProperties}>[Request Status]</div>
                                <div className='col12 component-layout-rows ' style={{ '--gridRows': '137.5px 1fr' } as React.CSSProperties}>
                                    <div className='col12 align-top-left header'>
                                        <img src={imgURL} style={{maxHeight:'75px', maxWidth:'200px'}}/>
                                        <div style={{marginLeft:'10px'}}>
                                            <h1>{organizationData.Name}</h1>
                                            <h3>Information Request Form</h3>
                                        </div>
                                    </div>
                                    <div className='col12 component-layout-columns form-body' style={{ '--gridColumns': '35% 1fr' } as React.CSSProperties}>
                                        <div className='col12'>
                                            <div className="col12 card-flat-rounded" style={{marginBottom:'15px', height:'90%'}}>
                                                <div className='col11 section-header'>Request Details</div>
                                                <div style={{marginBottom:'10px'}}><strong>Request:</strong> Policy GL-123456789</div>  
                                                <div style={{marginBottom:'10px'}}><strong>Insured:</strong> Zackbot.com</div>
                                                <div style={{marginBottom:'10px'}}><strong>Due Date:</strong> </div>
                                                <div style={{marginBottom:'10px'}}><strong>Sender:</strong> Zack Saeger</div>
                                                <div className='col11 section-header' style={{marginTop: '30px'}}>Submitter Details</div>
                                                <Input oKey='SubmitterFirstName' oType='text' oLabel="First Name" oSize="col12" isRequired={true} isEditable={false} oChange={() => {}} oData=''/>
                                                <Input oKey='SubmitterLastName' oType='text' oLabel="Last Name" oSize="col12" isRequired={true} isEditable={false} oChange={() => {}} oData=''/>
                                            </div>
                                        </div>
                                        <div>
                                            <Input oKey='SampleTextBox' oType='text' oLabel="Sample Text Box" oSize="col12" isRequired={true} isEditable={false} oChange={() => {}} oData=''/>
                                            <Input oKey='SampleDateField' oType='date' oLabel="Sample Date Field" oSize="col12" isRequired={true} isEditable={false} oChange={() => {}} oData=''/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>*/}
                    </div>
                </div>
            )}
        </div>
    );

};   

export default Branding;