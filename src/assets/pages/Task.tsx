
import { useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource'
import { useParams } from 'react-router-dom';
import { handleGetDataInputChange, handleFormDataInputChange, createHistoryEvent, formatDate } from '../functions/data'
import { getRequestTaskData } from '../functions/data'
import BeatLoader from "react-spinners/BeatLoader";
import DataInputs from '../components/data-objects/DataInputs'
import Input from '../components/data-objects/Input';
import { uploadDocument } from '../functions/document'
import { v4 as uuidv4 } from 'uuid';
//import clsx from "clsx";

import '../styles/Task.css';


const client = generateClient<Schema>();


function Task () {

    const [primaryColor, setPrimaryColor] = useState<string>('#FFFFFF');
    const [secondaryColor, setSecondaryColor] = useState<string>('#000000');
    const [requestDetails, setRequestDetails] = useState<any>( {} );
    const [requestQuestions, setRequestQuestions] = useState<any>( [] );
    const [requestSubmitter, setRequestSubmitter] = useState<any>( {} );
    const [loading, setLoading] = useState( true );
    const [editable, setEditable] = useState( false );
    const { requestId } = useParams<{ requestId: string }>();
    const { taskId } = useParams<{ taskId: string }>();    
    //const [imgURL, setImgURL] = useState<string>( '' );

const trayRef = useRef<HTMLDivElement>(null);
const COLLAPSED_Y = 95;
const EXPANDED_Y = 0;

const [translateY, setTranslateY] = useState( EXPANDED_Y );
const [isDragging, setIsDragging] = useState(false);

const startY = useRef(0);
const startTranslate = useRef(0);

const isOpen = translateY < 30;

const onDragStart = (e: React.PointerEvent) => {
  startY.current = e.clientY;
  startTranslate.current = translateY;
  setIsDragging(true);

  document.body.style.userSelect = "none";
};

useEffect(() => {
  if (!isDragging) return;

  const onMove = (e: PointerEvent) => {
    const delta = e.clientY - startY.current;
    const percentDelta = (delta / window.innerHeight) * 100;

    let next = startTranslate.current + percentDelta;
    next = Math.max(EXPANDED_Y, Math.min(COLLAPSED_Y, next));

    setTranslateY(next);
  };

  const onEnd = () => {
    setIsDragging(false);
    document.body.style.userSelect = "";

    setTranslateY((prev) => (prev > 35 ? COLLAPSED_Y : EXPANDED_Y));
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onEnd);
  window.addEventListener("pointercancel", onEnd);

  return () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onEnd);
    window.removeEventListener("pointercancel", onEnd);
  };
}, [isDragging]);

useEffect(() => {
  document.body.style.overflow = isOpen ? "hidden" : "";
}, [isOpen]);


  const getRequest = async () => {

    const currentRequest = await getRequestTaskData( requestId!, taskId! );
    if ( !currentRequest.data.RequestTask.Participants.some( ( participant:any ) => participant.ParticipantRole === 'Submitter' ) ) {
        setRequestSubmitter({ FirstName: '', LastName: '', Email: '', ParticipantRole: 'Submitter' });
    } else {
        setRequestSubmitter( currentRequest.data.RequestTask.Participants.find( ( participant:any ) => participant.ParticipantRole === 'Submitter' ) );
    }
    setRequestDetails( currentRequest.data );
    setRequestQuestions( currentRequest.data?.Questions.sort((a: any, b: any) => a['Order'] - b['Order']) );
    currentRequest.data?.Questions.map( ( question:any ) => {
        const existingResponse = currentRequest.data?.RequestTask.Responses.find( ( response:any ) => response.RequestQuestionID === question.id );
        if ( existingResponse ) {
            question.Value = existingResponse.Value;
            question.answerId = existingResponse.id;
            if ( question.Type === 'file' ) {
                question.UploadText = 'File: ' + existingResponse.Value;
            }
        } else {
            question.Value = '';
            question.answerId = '';
            if ( question.Type === 'file' ) {
                question.UploadText = 'Drag & Drop or Click to Upload';
            }
        }
    });

    //setImgURL( import.meta.env.VITE_IMG_URL + currentRequest.data?.Organization?.Logo );
    setPrimaryColor( currentRequest.data?.Organization?.PrimaryColor );
    setSecondaryColor( currentRequest.data?.Organization?.SecondaryColor );
    setLoading( false );
    if ( currentRequest.data && currentRequest.data.RequestTask.RequestTaskStatus === 'In Progress' ) {
        setEditable( true );
        setTranslateY( COLLAPSED_Y );
    }

  };    

  async function startForm() {
      
    if (!taskId) {
        console.error('startForm: missing taskId');
        return;
    }

    await client.models.RequestTasks.update({ id: taskId, RequestTaskStatus: 'In Progress' });
    await client.models.RequestParticipants.create({ RequestID: requestId!, RequestTaskID: taskId, FirstName: requestSubmitter.FirstName, LastName: requestSubmitter.LastName, Email: requestSubmitter.Email, ParticipantRole: 'Submitter' });
    const copyRequestDetails = { ...requestDetails };
    copyRequestDetails.RequestTask = { ...copyRequestDetails.RequestTask, RequestTaskStatus: 'In Progress' };
    setRequestDetails( copyRequestDetails );
    setEditable( true );  
    setTranslateY( COLLAPSED_Y );
    await createHistoryEvent('Task', requestSubmitter.FirstName + ' ' + requestSubmitter.LastName, 'Task In Progress', requestId ? requestId : '', taskId ? taskId : '');

  }

  async function saveForm( oStatus:string ) { 

    if (!taskId) {
        console.error('saveForm: missing taskId');
        return;
    }

    if ( oStatus === 'Submitted' ) {
        await client.models.RequestTasks.update({ id: taskId, RequestTaskStatus: 'Submitted' });
        const copyRequestDetails = { ...requestDetails };
        copyRequestDetails.RequestTask = { ...copyRequestDetails.RequestTask, RequestTaskStatus: 'Submitted' };
        setRequestDetails( copyRequestDetails );
        await createHistoryEvent('Task', requestSubmitter.FirstName + ' ' + requestSubmitter.LastName, 'Task Submitted', requestId ? requestId : '', taskId ? taskId : '');
    }

    requestQuestions.map( async ( item:any ) => {
        if ( item.answerId != '' ) {
            if ( item.Type === 'file' ) {
                if ( item.New ) {
                    uploadDocument( item.Document, 'request-documents',  item.answerId )
                    await client.models.RequestResponses.update({ id: item.answerId, Name: item.Name, Value: item.Document.name, IsDocument: true });
                    setRequestQuestions((prevQuestions:any) => {
                        const updatedQuestions = [...prevQuestions];
                        updatedQuestions[prevQuestions.findIndex((i:any) => i.id === item.id)] = { ...updatedQuestions[prevQuestions.findIndex((i:any) => i.id === item.id)], New: false };
                        return updatedQuestions;
                    });
                }
            } else {
                await client.models.RequestResponses.update({ id: item.answerId, Name: item.Name, Value: item.Value, IsDocument: false });
            }
        } else if ( item.Value !== '' && item.Value !== null ) {
            if ( item.Type === 'file' ) {
                if ( item.New ) {
                    const oId = uuidv4();
                    uploadDocument( item.Document, 'request-documents',  oId )
                    await client.models.RequestResponses.create({ id: oId, RequestID: requestId!, RequestTaskID: taskId!,  RequestQuestionID: item.id, Name: item.Name, Value: item.Document.name, IsDocument: true });
                    setRequestQuestions((prevQuestions:any) => {
                        const updatedQuestions = [...prevQuestions];
                        updatedQuestions[prevQuestions.findIndex((i:any) => i.id === item.id)] = { ...updatedQuestions[prevQuestions.findIndex((i:any) => i.id === item.id)], New: false, answerId: oId };
                        return updatedQuestions;
                    });    
                }        
            } else {
                await client.models.RequestResponses.create({ RequestID: requestId!, RequestTaskID: taskId!,  RequestQuestionID: item.id, Name: item.Name, Value: item.Value, IsDocument: false });
            }
        }
    });

  }

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
    <div className="min-h-screen bg-gray-100 lg:overflow-x-hidden">
      {loading ? (
        <div className="col12 flex items-center justify-center h-screen">
          <BeatLoader color="#D58936" />
        </div>
      ) : (
        <>
          {/* Sticky Header */}
          <div className="sticky top-0 w-full lg:w-[70%] mx-auto z-10">
            <header
              style={{ backgroundColor: primaryColor }}
              className="h-[125px] text-white p-4 font-semibold rounded-b flex flex-col justify-center"
            >
              <div className="text-xl">{requestDetails?.Organization?.Name}</div>
              <div>Information Request</div>
            </header>
          </div>

          {/* Completed state */}
          {requestDetails.RequestTask.RequestTaskStatus === "Submitted" ||
          requestDetails.RequestTask.RequestTaskStatus === "Completed" ? (
            <div className="w-full h-screen flex items-center justify-center text-2xl font-semibold">
              This request has been completed
            </div>
          ) : (
            <>
              <main className="w-full lg:w-[70%] mx-auto p-4 flex flex-col lg:flex-row gap-4 bg-gray-50">
                
                {/* Desktop Left Column */}
                <section className="hidden lg:block w-full lg:w-[35%] bg-white p-6 rounded shadow lg:overflow-y-auto h-fit lg:h-[calc(100vh-150px)]">
                  <div className="w-full flex flex-col gap-4">
                    <h2 className="text-lg font-bold mb-2" style={{color: secondaryColor}}>Request Details:</h2>
                    <div><strong>Request:</strong> {requestDetails.RequestedFor}</div>
                    <div><strong>Insured:</strong> {requestDetails.AccountName}</div>
                    <div><strong>Due Date:</strong> {formatDate(requestDetails.DueDate)}</div>
                    <h2 className="text-lg font-bold mt-4 mb-2" style={{color: secondaryColor}}>Submitter's Details:</h2>
                    <Input
                      oKey="FirstName"
                      oType="text"
                      oLabel="First Name"
                      oSize="col12"
                      isRequired={true}
                      isEditable={true}
                      oChange={(e) => handleGetDataInputChange(e, setRequestSubmitter)}
                      oData={requestSubmitter.FirstName}
                    />
                    <Input
                      oKey="LastName"
                      oType="text"
                      oLabel="Last Name"
                      oSize="col12"
                      isRequired={true}
                      isEditable={true}
                      oChange={(e) => handleGetDataInputChange(e, setRequestSubmitter)}
                      oData={requestSubmitter.LastName}
                    />
                    <Input
                      oKey="Email"
                      oType="text"
                      oLabel="Email"
                      oSize="col12"
                      isRequired={false}
                      isEditable={true}
                      oChange={(e) => handleGetDataInputChange(e, setRequestSubmitter)}
                      oData={requestSubmitter.Email}
                    />
                    {requestSubmitter.FirstName && requestSubmitter.LastName && 
                      (requestDetails.RequestTask.RequestTaskStatus === "Email Opened" || requestDetails.RequestTask.RequestTaskStatus === "Delivered") && (
                        <div className="flex justify-center mt-2">
                          <button
                            className="w-40 px-4 py-2 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition"
                            style={{ backgroundColor: primaryColor }}
                            onClick={startForm}
                          >
                            Start
                          </button>
                        </div>
                      )
                    }
                  </div>
                </section>

                {/* Right Column */}
                <section className="w-full lg:w-[65%] bg-white p-6 rounded shadow lg:overflow-y-auto h-fit lg:h-[calc(100vh-150px)] pb-20">
                  <div className="flex flex-col gap-4">
                    {requestQuestions.map((item: any, index: number) => (
                      <div className="w-full flex justify-center" key={index}>
                        {item.Type === "file" ? (
                          <DataInputs
                            oData={item}
                            key={index}
                            oEditable={editable}
                            oChange={(e: any) => handleDocumentChange(e, index)}
                          />
                        ) : (
                          <DataInputs
                            oData={item}
                            key={index}
                            oEditable={editable}
                            oChange={(e: any) => handleFormDataInputChange(e, setRequestQuestions, index)}
                          />
                        )}
                      </div>
                    ))}

                    {requestDetails.RequestTask.RequestTaskStatus === "In Progress" && (
                      <div className="flex justify-center mt-2">
                        <button
                          className="m-2 w-40 px-4 py-2 text-white font-semibold rounded-full shadow-md hover:bg-white hover:cursor-pointer transition-colors duration-300"
                          style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                          onClick={() => saveForm("In Progress")}
                        >
                          Save
                        </button>
                        <button
                          className="m-2 w-40 px-4 py-2 text-white font-semibold rounded-full shadow-md hover:bg-white hover:cursor-pointer transition-colors duration-300"
                          style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                          onClick={() => saveForm("Submitted")}
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              </main>

              {/* Mobile Bottom Sheet */}
              {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40 transition-all duration-300
          ${isOpen ? "bg-black/30 backdrop-blur-sm" : "pointer-events-none opacity-0"}
          lg:hidden
        `}
        onClick={() => setTranslateY(COLLAPSED_Y)}
      />

      {/* Tray */}
      <section
        ref={trayRef}
        style={{ transform: `translateY(${translateY}%)` }}
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-gray-100 rounded-t-2xl shadow-xl border-t border-gray-300
          transition-transform duration-300 ease-out
          lg:hidden
        `}
      >
        {/* Drag Handle */}
        <div
          className="lg:hidden w-full flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={onDragStart}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="p-6 h-[80vh] overflow-y-auto lg:hidden">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold" style={{ color: secondaryColor }}>
              Request Details
            </h2>

            <div><strong>Request:</strong> {requestDetails.RequestedFor}</div>
            <div><strong>Insured:</strong> {requestDetails.AccountName}</div>
            <div><strong>Due Date:</strong> {formatDate(requestDetails.DueDate)}</div>

            <h2 className="text-lg font-bold mt-4" style={{ color: secondaryColor }}>
              Submitter&apos;s Details
            </h2>

            <div className="space-y-3">
              <Input
                oKey="FirstName"
                oType="text"
                oSize='col12'
                oLabel="First Name"
                isRequired
                isEditable
                oChange={(e: any) =>
                  handleGetDataInputChange(e, setRequestSubmitter)
                }
                oData={requestSubmitter.FirstName}
              />

              <Input
                oKey="LastName"
                oType="text"
                oSize='col12'
                oLabel="Last Name"
                isRequired
                isEditable
                oChange={(e: any) =>
                  handleGetDataInputChange(e, setRequestSubmitter)
                }
                oData={requestSubmitter.LastName}
              />
                 <Input
                      oKey="Email"
                      oType="text"
                      oLabel="Email"
                      oSize="col12"
                      isRequired={false}
                      isEditable={true}
                      oChange={(e) => handleGetDataInputChange(e, setRequestSubmitter)}
                      oData={requestSubmitter.Email}
                    />
              
            </div>

            {/* Action */}
            {requestSubmitter.FirstName &&
              requestSubmitter.LastName &&
              ["Email Opened", "Delivered"].includes(
                requestDetails.RequestTask.RequestTaskStatus
              ) && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={startForm}
                    className="w-40 px-4 py-2 text-white font-semibold rounded-full shadow-md"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Start
                  </button>
                </div>
              )}
          </div>
        </div>
      </section>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Task;