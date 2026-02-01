

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource.ts'
import BeatLoader from 'react-spinners/BeatLoader';
import { formatDate, formatToLocalTime, getRequestViewData, createHistoryEvent } from '../../functions/data'
import { IconButtonMedium } from '../Buttons'

import '../../styles/ProgressBar.css'

interface Prop {
  oOpenTabs: any;
  oCurrentTab: number;
  oUser: any;
  oCloseTab: any;
  oActiveTabId: string;
}

const client = generateClient<Schema>();


function ViewRequest ( props:Prop ) {

  const [requestDetails, setRequestDetails] = useState<any>( {} );
  const [historyDetails, setHistoryDetails] = useState<any>( [] );
  const [questionDetails, setQuestionDetails] = useState<any>( [] );
  const [loading, setLoading] = useState( true );
  const [activeTask, setActiveTask] = useState( '' );
  const [historySteps, setHistorySteps] = useState<any>( [] );

  const getRequest = async () => {

    const currentRequest = await getRequestViewData( props.oOpenTabs[props.oCurrentTab].id );

    setRequestDetails( currentRequest.data );
    setHistoryDetails( currentRequest.data?.History );
    setQuestionDetails( currentRequest.data?.Questions );
    setActiveTask( currentRequest.data?.RequestTasks[0]?.RequestTask.id );
    setLoading( false );

  };

  function validateHistoryEvents() {

    let  steps = [
      { completed:'false', date: '', time:'', user: '', description: 'Request Created' },
      { completed:'false', date: '', time:'', user: '', description: 'Task Sent' }, 
      { completed:'false', date: '', time:'', user: '', description: 'Task Delivered' }, 
      { completed:'false', date: '', time:'', user: '', description: 'Email Opened' }, 
      { completed:'false', date: '', time:'', user: '', description: 'Task In Progress' }, 
      { completed:'false', date: '', time:'', user: '', description: 'Task Submitted' }
    ]

      historyDetails.filter(( event:any ) => event.RequestTaskID === activeTask || event.RequestTaskID === null ).forEach(( item:any ) => {

          steps.forEach(( step:any ) => {
              if ( item.Description === step.description ) {
                  step.completed = 'true';
                  step.date = formatDate( item.Date );
                  step.time = formatToLocalTime( item.Date );
                  step.user = item.User;
                  step.description = item.Description;
              }
              if ( item.Description === 'Task is Undeliverable' ) {
                  steps[2].completed = 'error';
                  steps[2].date = formatDate( item.Date );
                  steps[2].time = formatToLocalTime( item.Date );
                  steps[2].user = item.User;
                  steps[2].description = item.Description;
              }
          });

      });

      setHistorySteps( steps );

  };

  async function handleDownload( oName:string, oId:string ) {
    
    const fileUrl = import.meta.env.VITE_DOC_URL + 'request-documents/' + oId; // your file URL
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = oName; // suggested filename
    link.click();
    window.URL.revokeObjectURL(url);

  };

  async function handleCopy( oText:string )  {
    try {
      await navigator.clipboard.writeText( oText );
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  function openTaskForm() {
    
    window.open( 'request/' + requestDetails.id + '/task/' + activeTask, '_blank' );

  };

  async function completeRequest() {
    
    await client.models.Request.update({ id: requestDetails.id, RequestStatus: 'Closed' });
    await createHistoryEvent( 'Request', props.oUser.Username, 'Request Completed', requestDetails.id, '',  );
    setRequestDetails( { ...requestDetails, RequestStatus: 'Closed' } );

  };

  useEffect(() => {
  
      getRequest();

  },[]);

  useEffect(() => {
  
    if (props.oActiveTabId === requestDetails.id ) {
      getRequest();
    }
      
  },[props.oActiveTabId]);

  useEffect(() => {

    validateHistoryEvents();

  },[activeTask]);


  return (

    <>
      { loading ? (
        <div className='flex-1 flex justify-center items-center'>
            <BeatLoader color = "#EB7100" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 p-6 gap-4"> 
          {/* Request Details */}
          <div id="request-details" className="flex flex-row justify-between items-center w-full bg-white border border-gray-300 rounded shadow gap-4. px-4 py-2">
            <div className="flex flex-col w-[15%]">
              <p>Account Name:</p>
              <p>{requestDetails.AccountName}</p>
            </div>
            <div className="flex flex-col w-[15%]">
              <p>Requested For:</p>
              <p>{requestDetails.RequestedFor}</p>
            </div>
            <div className="flex flex-col w-[15%]">
              <p>Created On:</p>
              <p>{formatDate( requestDetails.createdAt )}</p>
            </div>
            <div className="flex flex-col w-[15%]">
              <p>Due Date:</p>
              <p>{formatDate( requestDetails.DueDate )}</p>
            </div>
            <div className="flex flex-col w-[15%]">
              <p>Status:</p>
              <p>{requestDetails.RequestStatus}</p>
            </div>
            <div className="flex flex-grow items-center justify-end flex-row gap-2">
              <IconButtonMedium
                oAction={() => {props.oCloseTab( props.oCurrentTab )}}
                oTitle="Close Request"
                oIcon="fa-sharp fa-thin fa-xmark"
              />
              { requestDetails.RequestStatus === 'Active' && (
                <>
                  {/*<IconButtonMedium
                    oAction={() => {}}
                    oTitle="Cancel Request"
                    oIcon="fa-sharp fa-thin fa-trash-can-xmark"
                  />*/}
                  <IconButtonMedium
                    oAction={openTaskForm}
                    oTitle="Open Task Form"
                    oIcon="fa-sharp fa-thin fa-arrow-up-right-from-square"
                  />
                  <IconButtonMedium
                    oAction={completeRequest}
                    oTitle="Complete Request"
                    oIcon="fa-sharp fa-thin fa-check"
                  />
                </>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-row gap-4 min-h-0">
            {/* Request Tasks */}
            <div id="request-tasks" className="flex-1 flex flex-col min-h-0 w-1/3 bg-white border border-gray-300 rounded shadow gap-4 p-4">
              <div className="flex-1 flex flex-col min-h-0 gap-4 min-h-0"> 
                <div className="flex justify-center items-center"><h3>Request Tasks</h3></div>
                <div id="request-tasks-list" className='flex-1 flex flex-col overflow-y-auto'>
                  {requestDetails.RequestTasks?.map((task:any) => (
                    <>
                      {activeTask === task.RequestTask.id ? (
                        <div className={'flex cursor-pointer hover:bg-[#00556640] transition-colors duration-200 ease-in-out even:bg-[#F4F4F4]'} key={task.id} onClick={() => {setActiveTask(task.RequestTask.id)}}>
                            {task.EntityName !== '' ? (
                            <div className='w-[80%] flex items-center h-[60px] p-2 font-bold text-[#005566]'>{task.EntityName}<br/>{task.RequestTask.Instructions}</div>
                            ) : (
                            <div className='w-[80%] flex items-center h-[60px] p-2 font-bold text-[#005566]'>{task.FirstName} {task.LastName} | {task.Email}<br/>{task.RequestTask.Instructions}</div>
                            )}
                            <div className='w-[20%] flex items-center text-center h-[60px] p-2 font-bold text-[#005566]'>{task.RequestTask.RequestTaskStatus.toUpperCase()}</div>
                        </div>
                      ) : (
                        <div className={'flex cursor-pointer hover:bg-[#00556640] transition-colors duration-200 ease-in-out even:bg-[#F4F4F4]'} key={task.id} onClick={() => {setActiveTask(task.RequestTask.id)}}>
                            
                            {task.EntityName !== '' ? (
                            <div className='w-[80%] flex items-center h-[60px] p-2'>{task.EntityName}<br/>{task.RequestTask.Instructions}</div>
                            ) : (
                            <div className='w-[80%] flex items-center h-[60px] p-2'>{task.FirstName} {task.LastName} | {task.Email}<br/>{task.RequestTask.Instructions}</div>
                            )}
                            <div className='w-[20%] flex items-center text-center h-[60px] p-2'>{task.RequestTask.RequestTaskStatus.toUpperCase()}</div>
                        </div>
                      )}
                    </>
                  ))}
                </div>
              </div>
            </div>
            {/* Request History */}
            <div id="request-history" className="flex-1 flex flex-col min-h-0 w-1/3 bg-white border border-gray-300 rounded shadow gap-4 p-4">
              <div className="flex-1 flex flex-col min-h-0 gap-4 min-h-0"> 
                <div className="flex justify-center items-center"><h3>Request &amp; Task History</h3></div>
                  <div id="request-history-steps" className='flex-1 flex flex-col overflow-y-auto'>
                      {historySteps.map(( item:any, index:number ) => ( 
                          <div className="flex flex-row gap-4" key={index}>
                              { item.completed === 'true' && (
                                  <>
                                      <div>
                                          {index === 0 && ( 
                                              <div className="align-bottom-center" style={{height:'20px'}}></div>
                                          )}
                                          {index != 0 && ( 
                                              <div className="align-bottom-center" style={{height:'20px'}}>
                                                  <div className="progress-line-complete"></div>
                                              </div>
                                          )}
                                          <div className='progress-step-complete'><i className={"fa-sharp fa-thin fa-check "}></i></div>
                                          {index === 5 && ( 
                                              <div className="align-top-center" style={{height:'20px'}}></div>
                                          )}
                                          {index != 5 && ( 
                                              <div className="align-top-center" style={{height:'20px'}}>
                                                  <div className="progress-line-complete"></div>
                                              </div>
                                          )}
                                      </div>
                                      <div className="align-center-left">
                                          <div className="col12"><h4>{item.description}</h4></div>
                                          <div className="col12">{item.date} at {item.time} </div>
                                          <div className="col12">By: {item.user}</div>
                                      </div>
                                  </>
                              )} 
                              { item.completed === 'false' && (
                                  <>
                                      <div>
                                          {index === 0 && ( 
                                              <div className="align-bottom-center" style={{height:'20px'}}></div>
                                          )}
                                          {index != 0 && ( 
                                              <div className="align-bottom-center" style={{height:'20px'}}>
                                                  <div className="progress-line"></div>
                                              </div>
                                          )}
                                          <div className='progress-step'><i className={"fa-sharp fa-thin fa-minus "}></i></div>
                                          {index === 5 && ( 
                                              <div className="align-top-center" style={{height:'20px'}}></div>
                                          )}
                                          {index != 5 && ( 
                                              <div className="align-top-center" style={{height:'20px'}}>
                                                  <div className="progress-line"></div>
                                              </div>
                                          )}
                                      </div>
                                      <div className="align-center-left">
                                          <div className="progress-step-detail">{item.description}</div>
                                      </div>
                                  </>
                              )}
                              { item.completed === 'error' && (
                                  <>
                                      <div>
                                          {index === 0 && ( 
                                              <div className="align-bottom-center" style={{height:'20px'}}></div>
                                          )}
                                          {index != 0 && ( 
                                              <div className="align-bottom-center" style={{height:'20px'}}>
                                                  <div className="progress-line-error"></div>
                                              </div>
                                          )}
                                          <div className='progress-step-error'><i className={"fa-sharp fa-thin fa-xmark "}></i></div>
                                          {index === 5 && ( 
                                              <div className="align-top-center" style={{height:'20px'}}></div>
                                          )}
                                          {index != 5 && ( 
                                              <div className="align-top-center" style={{height:'20px'}}>
                                                  <div className="progress-line"></div>
                                              </div>
                                          )}
                                      </div>
                                      <div className="align-center-left">
                                          <div className="col12"><h4>{item.description}</h4></div>
                                          <div className="col12">{item.date} at {item.time} </div>
                                          <div className="col12">By: {item.user}</div>
                                      </div>
                                  </>
                              )}
                          </div>
                      ))}
                      </div>
                  </div>
            </div>
            {/* Request Questions */}
            <div id="request-questions" className="flex-1 flex flex-col min-h-0 w-1/3 bg-white border border-gray-300 rounded shadow gap-4 p-4">
              <div className="flex-1 flex flex-col min-h-0 gap-4 min-h-0"> 
                <div className="flex justify-center items-center"><h3>Task Response</h3></div>
                <div id="request-questions-list" className='flex-1 flex flex-col overflow-y-auto overflow-x-hidden'>
                  {questionDetails?.sort((a:any, b:any) => a.Order - b.Order).map((question:any) => (
                    <section className="w-[95%] bg-white m-4 p-4 rounded shadow h-[100px] border border-gray-300 flex items-center">
                      <div className='w-full'>
                        <div className=" mb-4">{question.Name}:</div>
                        {requestDetails.RequestTasks?.filter((task:any) => task.RequestTask.id === activeTask).map((task:any) => (
                          <>
                            {task.RequestTask.Responses?.filter((response:any) => response.Name === question.Name).map((response:any) => (  
                              <>
                                {(() => {
                                  switch (question.Type) {
                                    case 'date':
                                      return (
                                        <div  className='flex w-full'>
                                          {response.Value !== '' ? <><div className='w-[93%]'>{formatDate(response.Value)}</div><div title='Copy Response' className='w-[7%] text-[20px] text-[#005566] cursor-pointer hover:text-[#D58936]' onClick={() => handleCopy(formatDate(response.Value))}><i className={"fa-sharp fa-thin fa-clone "}></i></div></> : null}
                                        </div>
                                      )
                                    case 'file':
                                      return (
                                        <div  className='flex w-full'>
                                          <div className='w-[86%]'>{response.Value}</div>
                                          <div title='Download File' className='w-[7%] text-[20px] text-[#005566] cursor-pointer hover:text-[#005566]' onClick={() => handleDownload(response.Value, response.id)}><i className={"fa-sharp fa-thin fa-download "}></i></div>
                                          <a title='Open File in New Tab' className='w-[7%] cursor-pointer' href={import.meta.env.VITE_DOC_URL + 'request-documents/' + response.id} target="_blank" rel="noopener noreferrer"><div className='text-[20px] text-[#005566] cursor-pointer hover:text-[#D58936]'><i className={"fa-sharp fa-thin fa-up-right-from-square "}></i></div></a>
                                        </div>
                                    )
                                    default:
                                      return (
                                        <div  className='flex w-full'>
                                            {response.Value !== '' ? <><div className='w-[93%]'>{response.Value}</div><div title='Copy Response' className='w-[7%] text-[20px] text-[#005566] cursor-pointer' onClick={() => handleCopy(response.Value)}><i className={"fa-sharp fa-thin fa-clone "}></i></div></> : null}
                                        </div>
                                      )
                                  }
                                })()}
                                
                                <div className='w-[10%] flex flex-col justify-between items-end'>
                                  
                                </div>
                              </>
                            ))}
                          </>
                        ))}
                      </div>
                      
                    </section>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

};

export default ViewRequest;