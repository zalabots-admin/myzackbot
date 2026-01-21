
import { useState, useEffect } from 'react';
import { handleGetDataInputChange, handleFormDataInputChange } from '../functions/data'
import { formatDate } from '../functions/data';
import BeatLoader from "react-spinners/BeatLoader";
import DataInputs from '../components/data-objects/DataInputs'
import Input from '../components/data-objects/Input';

import '../styles/Task.css';


function Sample () {

    const [primaryColor, setPrimaryColor] = useState<string>('#FFFFFF');
    const [secondaryColor, setSecondaryColor] = useState<string>('#000000');
    const [requestDetails, setRequestDetails] = useState<any>( {} );
    const [requestQuestions, setRequestQuestions] = useState<any>( [] );
    const [requestSubmitter, setRequestSubmitter] = useState<any>( {} );
    const [loading, setLoading] = useState( true );
    const [editable] = useState( true );  

    const getRequest = async () => {

        const params = new URLSearchParams(window.location.search);
        const data = params.get( 'data' );
        if (!data) {
            console.error('No data parameter found in URL');
            return;
        }
        const currentRequest = JSON.parse(atob(data));
        console.log(currentRequest);
        const d = new Date();
        d.setDate(d.getDate() + 2);
        const dueDate = formatDate(d.toISOString().split('T')[0]);
        setRequestSubmitter({ FirstName: '', LastName: '', Email: '', ParticipantRole: 'Submitter' });
        setRequestDetails( { AccountName: 'Acme Corporation', RequestedFor: 'Submission 8736453893', DueDate: dueDate, Organization: 'ZALABOTS' } );
        setRequestQuestions( currentRequest );
        currentRequest.map( ( question:any ) => {

            question.Value = '';
            question.answerId = '';
            if ( question.Type === 'file' ) {
                question.UploadText = 'Drag & Drop or Click to Upload';
            }
            
        });

        //setImgURL( import.meta.env.VITE_IMG_URL + currentRequest.data?.Organization?.Logo );
        setPrimaryColor( '#EB7100' );
        setSecondaryColor( '#005566' );
        setLoading( false );

    };    

    async function handleDocumentChange( event:any, index:number ) {

        setRequestQuestions((prevQuestions:any) => {
            const updatedQuestions = [...prevQuestions];
            updatedQuestions[index] = { ...updatedQuestions[index], UploadText: 'File: ' + event.name, Document: event, New: true, Value: event.name };
            return updatedQuestions;
        });
    
    }

    useEffect(() => {

        getRequest();

    },[]);

    return (
        <div className="min-h-screen bg-gray-100">
            <>
            { loading ? (
                <div className='col12 align-center-center' style={{height:'100vh'}}>
                    <BeatLoader color = "#D58936" />
                </div>
            ) : (
                <>
                    <div className="sticky top-0 w-full lg:w-[70%] mx-auto">
                    <header
                        style={{ backgroundColor: primaryColor }}
                        className="h-[125px] text-white p-4 font-semibold rounded-b flex flex-col justify-center"
                    >
                        <div className="text-3xl lg:text-5xl">{requestDetails?.Organization}</div>
                        <div className="text-xl">Information Request</div>
                    </header>
                    </div>

                            <main className="w-full lg:w-[70%] mx-auto h-[calc(100vh-125px)] overflow-y-auto lg:overflow-hidden p-4 flex flex-col lg:flex-row gap-4 bg-gray-50">
                                {/* Left Column: 100% on small, 35% on large */}
                                <section className="w-full lg:w-[35%] bg-white p-6 rounded shadow lg:overflow-y-auto h-fit lg:h-[calc(100vh-150px)]">
                                    <div className="w-full flex justify-center flex-col gap-4">
                                        <h2 className="text-lg font-bold mb-2" style={{color:secondaryColor}}>Request Details:</h2>
                                        <div style={{marginBottom:'10px'}}><strong>Request:</strong> {requestDetails.RequestedFor}</div>  
                                        <div style={{marginBottom:'10px'}}><strong>Insured:</strong> {requestDetails.AccountName}</div>
                                        <div style={{marginBottom:'10px'}}><strong>Due Date:</strong> {requestDetails.DueDate}</div>
                                        <h2 className="text-lg font-bold mb-2 mt-4" style={{color:secondaryColor}}>Submitter's Details:</h2>
                                        <div className='w-full'>
                                            <Input oKey='FirstName' oType='text' oLabel="First Name" oSize="col12" isRequired={true} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestSubmitter)} oData={requestSubmitter.FirstName} />
                                            <Input oKey='LastName' oType='text' oLabel="Last Name" oSize="col12" isRequired={true} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestSubmitter)} oData={requestSubmitter.LastName} />
                                            <Input oKey='Email' oType='text' oLabel="Email" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleGetDataInputChange(e, setRequestSubmitter)} oData={requestSubmitter.Email} />
                                        </div>
                                        <div className="w-full flex justify-center">
                                            <div className='p-4'>
                                                <button className="w-40 px-4 py-2 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition" style={{ backgroundColor: primaryColor }}>Start</button>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                {/* Right Column: 100% on small, 65% on large */}
                                <section className="w-full lg:w-[65%] bg-white p-6 rounded shadow lg:overflow-y-auto h-fit lg:h-[calc(100vh-150px)]">
                                    <div className="w-full flex justify-center flex-col gap-4">
                                        { requestQuestions.map( ( item:any, index:number ) => (
                                            <div className="w-full flex justify-center" key={index}>
                                            { item.Type === 'file' ? (
                                                <DataInputs oData={item} key={index} oEditable={editable} oChange={(e:any) => handleDocumentChange(e, index)} />
                                            ) : (
                                                <DataInputs oData={item} key={index} oEditable={editable} oChange={(e:any) => handleFormDataInputChange(e, setRequestQuestions, index)} />
                                            )}
                                            </div>
                                        )) }                               
                                        <div className="w-full flex justify-center">
                                            <button  className="m-2 w-40 px-4 py-2 text-white font-semibold rounded-full shadow-md hover:bg-white hover:cursor-pointer transition-colors duration-300" style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>Save</button>
                                            <button  className="m-2 w-40 px-4 py-2 text-white font-semibold rounded-full shadow-md hover:bg-white hover:cursor-pointer transition-colors duration-300" style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>Submit</button>
                                        </div>
                                    </div>
                                </section>
                            </main>

                </>
            )}
            </>
        </div>
    );
    
};

export default Sample;