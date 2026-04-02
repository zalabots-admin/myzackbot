

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource.ts'
import BeatLoader from 'react-spinners/BeatLoader';
import { formatDate, formatToLocalTime, getRequestViewData, createHistoryEvent, formatDateTime, formatUTCDate } from '../../functions/data'
import { questionTypeIcons } from '../RequestItems.tsx';
import { IconButtonMedium } from '../Buttons'

import '../../styles/ProgressBar.css'
import { WorkflowStatusIndicator } from './StatusIndicator.tsx';

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
  const [taskAssignee, setTaskAssignee] = useState( '' );
  const [taskAssigneeEmail, setTaskAssigneeEmail] = useState( '' );
  const [taskInstructions, setTaskInstructions] = useState( '' );
  const [taskStatus, setTaskStatus] = useState( '' );
  
  const getRequest = async () => {

    const currentRequest = await getRequestViewData( props.oOpenTabs[props.oCurrentTab].id );

    setRequestDetails( currentRequest.data );
    setHistoryDetails( currentRequest.data?.History );
    setQuestionDetails( currentRequest.data?.Questions );
    setActiveTask(
      currentRequest.data?.RequestTasks?.find(
        (t: any) => t.RequestTask.Number === 1
      )?.RequestTask.id
    );
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
                  step.date = formatUTCDate( item.Date );
                  step.time = formatToLocalTime( item.Date );
                  step.user = item.User;
                  step.description = item.Description;
              }
              if ( item.Description === 'Task is Undeliverable' ) {
                  steps[2].completed = 'error';
                  steps[2].date = formatUTCDate( item.Date );
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

  async function handleReset( oResponseId:string ) {
    
    await client.models.RequestResponses.update({ id: oResponseId, Status: 'Pending', Value: '' });
    const copyRequestDetails = [ ...requestDetails.RequestTasks ];
    const responseIndex = copyRequestDetails.find((task:any) => task.RequestTask.id === activeTask).RequestTask.Responses.findIndex((response:any) => response.id === oResponseId);
    copyRequestDetails.find((task:any) => task.RequestTask.id === activeTask).RequestTask.Responses[responseIndex].Status = 'Pending';
    copyRequestDetails.find((task:any) => task.RequestTask.id === activeTask).RequestTask.Responses[responseIndex].Value = '';
    setRequestDetails( { ...requestDetails, RequestTasks: [...copyRequestDetails] } );
    //await createHistoryEvent( 'Request Task Response', props.oUser.Username, 'Question Reset', requestDetails.id, activeTask, oResponseId );

  };

  async function handleCopy( oText:string )  {
    try {
      await navigator.clipboard.writeText( oText );
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  async function handleWaive( oResponseId:string, oQuestionId:string ) {
    if ( oResponseId === 'n/a' ) {
      const newResponse = await client.models.RequestResponses.create({ RequestID: requestDetails.id, RequestTaskID: activeTask, RequestQuestionID: oQuestionId, Status: 'Waived' });
      const copyRequestDetails = [ ...requestDetails.RequestTasks ];
      copyRequestDetails.find((task:any) => task.RequestTask.id === activeTask).RequestTask.Responses.push( { id: newResponse.data?.id, RequestTaskID: activeTask, RequestQuestionID: oQuestionId, Status: 'Waived' } );
      setRequestDetails( { ...requestDetails, RequestTasks: [...copyRequestDetails] } );
      //await createHistoryEvent( 'Request Task Response', props.oUser.Username, 'Question Waived', requestDetails.id, activeTask, 'n/a' );
    } else {
      await client.models.RequestResponses.update({ id: oResponseId, Status: 'Waived' });
      const copyRequestDetails = [ ...requestDetails.RequestTasks ];
      copyRequestDetails.find((task:any) => task.RequestTask.id === activeTask).RequestTask.Responses.find((response:any) => response.id === oResponseId).Status = 'Waived';
      setRequestDetails( { ...requestDetails, RequestTasks: [...copyRequestDetails] } );
      //await createHistoryEvent( 'Request Task Response', props.oUser.Username, 'Question Waived', requestDetails.id, activeTask, oResponseId );
    }

  }

  async function handleComplete( oResponseId:string, oQuestionId:string ) {
    
    if ( oResponseId === 'n/a' ) {
      const newResponse = await client.models.RequestResponses.create({ RequestID: requestDetails.id, RequestTaskID: activeTask, RequestQuestionID: oQuestionId, Status: 'Closed' });
      const copyRequestDetails = [ ...requestDetails.RequestTasks ];
      copyRequestDetails.find((task:any) => task.RequestTask.id === activeTask).RequestTask.Responses.push( { id: newResponse.data?.id, RequestTaskID: activeTask, RequestQuestionID: oQuestionId, Status: 'Closed' } );
      setRequestDetails( { ...requestDetails, RequestTasks: [...copyRequestDetails] } );
      //await createHistoryEvent( 'Request Task Response', props.oUser.Username, 'Question Completed', requestDetails.id, activeTask, 'n/a' );
    } else {
      await client.models.RequestResponses.update({ id: oResponseId, Status: 'Closed' });
      const copyRequestDetails = [ ...requestDetails.RequestTasks ];
      copyRequestDetails.find((task:any) => task.RequestTask.id === activeTask).RequestTask.Responses.find((response:any) => response.id === oResponseId).Status = 'Closed';
      setRequestDetails( { ...requestDetails, RequestTasks: [...copyRequestDetails] } );
      //await createHistoryEvent( 'Request Task Response', props.oUser.Username, 'Question Completed', requestDetails.id, activeTask, oResponseId );
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
    if (activeTask === '') return;
    setTaskInstructions(requestDetails.RequestTasks[requestDetails.RequestTasks.findIndex((task:any) => task.RequestTask.id === activeTask)].RequestTask.Instructions);
    setTaskStatus(requestDetails.RequestTasks[requestDetails.RequestTasks.findIndex((task:any) => task.RequestTask.id === activeTask)].RequestTask.RequestTaskStatus);
    setTaskAssigneeEmail(requestDetails.RequestTasks[requestDetails.RequestTasks.findIndex((task:any) => task.RequestTask.id === activeTask)].Email);
    ///if ( requestDetails.RequestTasks[requestDetails.RequestTasks.findIndex((task:any) => task.RequestTask.id === activeTask)].EntityName !== '' ) {
      setTaskAssignee(requestDetails.RequestTasks[requestDetails.RequestTasks.findIndex((task:any) => task.RequestTask.id === activeTask)].Assignee);
    //} else {
    //  setTaskAssignee(requestDetails.RequestTasks[requestDetails.RequestTasks.findIndex((task:any) => task.RequestTask.id === activeTask)].FirstName + ' ' + requestDetails.RequestTasks[requestDetails.RequestTasks.findIndex((task:any) => task.RequestTask.id === activeTask)].LastName);
    //};

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
              <p>{formatDateTime( requestDetails.createdAt )}</p>
            </div>
            <div className="flex flex-col w-[15%]">
              <p>Due Date:</p>
              <p>{formatDate( requestDetails.DueDate )}</p>
            </div>
            <div className="flex flex-col w-[15%]">
              <p>Request Status:</p>
              <WorkflowStatusIndicator status={requestDetails.RequestStatus} showLabel={true} pulse={false} />
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
          <div className="flex-1 flex flex-row gap-4 min-h-0 w-full">
            {/* Request Tasks */}
            <div id="request-tasks" className="flex flex-col min-h-0 w-1/3 bg-white border border-gray-300 rounded shadow gap-4 p-4">
              <div className="flex-1 flex flex-col min-h-0 gap-4 min-h-0"> 
                <div className="flex justify-center items-center"><h3>Request Tasks</h3></div>
                <div id="request-tasks-list" className='flex-1 flex flex-col overflow-y-auto'>
                  {requestDetails.RequestTasks?.sort((a:any, b:any) => a.RequestTask.Number - b.RequestTask.Number).map((task:any) => (
                    <>
                      <div  key={task.RequestTask.id} onClick={() => setActiveTask( task.RequestTask.id )}
                        className={`flex flex-row items-start p-2 border shadow m-2 rounded-lg ${activeTask === task.RequestTask.id ? `border-[#005566] bg-[#00556620]` : `border-gray-300 bg-gray-100 hover:cursor-pointer hover:border-[#EB7100]`}`}>
                        <div className={`w-fit flex flex-col flex-center justify-center h-full text-center py-2 px-4 border-r ${activeTask === task.RequestTask.id ? `border-[#005566]` : `border-gray-300`}`}>
                          
                            <span className="text-sm">TASK</span>
                            <span className="text-xl">{task.RequestTask.Number}</span>
                          
                        </div>
                        <div className="w-2/3 flex flex-col h-full p-2 pl-4">
                          <div className="font-bold">{task.Assignee}</div>
                          <div className="text-sm">{task.RequestTask.Instructions}</div>
                        </div>
                        <div className="w-1/4 flex items-center justify-start h-full">
                          <WorkflowStatusIndicator status={task.RequestTask.RequestTaskStatus} showLabel={true} pulse={false} />
                        </div>
                      </div>
        
                    </>
                  ))}
                </div>
              </div>
            </div>
            <div id="task-details" className="flex flex-col min-h-0 w-2/3 bg-white border border-gray-300 rounded shadow gap-4 p-4" >
              {/* Task Details */}
              <div className="flex flex-row justify-start items-center w-full gap-4. px-4 py-2">
                <div className="flex flex-col w-1/4">
                  <p>Task Assignee:</p>
                  <p>{taskAssignee}</p>
                </div>
                <div className="flex flex-col w-1/4">
                  <p>Assignee Email:</p>
                  <p>{taskAssigneeEmail}</p>
                </div>
                <div className="flex flex-col w-1/4">
                  <p>Instructions:</p>
                  <p>{taskInstructions ? taskInstructions : "No instructions provided"}</p>
                </div>
                <div className="flex flex-col w-1/4">
                  <p>Task Status:</p>
                  <WorkflowStatusIndicator status={taskStatus} showLabel={true} pulse={false} />
                </div>
              </div>
              <div className="flex-1 flex flex-row gap-4 min-h-0 w-full">
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
                                          <div className="align-center-left font-family-roboto">
                                              <div className="col12 font-bold">{item.description}</div>
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
                                          <div className="align-center-left font-family-roboto">
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
                <div id="request-questions" className="flex flex-col min-h-0 w-2/3 bg-white border border-gray-300 rounded shadow gap-4 p-4">
                  <div className="flex-1 flex flex-col min-h-0 gap-4 min-h-0"> 
                    <div className="flex justify-center items-center"><h3>Task Response</h3></div>
                    <div id="request-questions-list" className='flex-1 flex flex-col overflow-y-auto overflow-x-hidden'>
                      {questionDetails?.sort((a:any, b:any) => a.Order - b.Order).map((question:any) => ( 
                        <div className="bg-white m-4 rounded shadow border border-gray-300 flex items-center" key={question.id}> 
                          {requestDetails.RequestTasks?.filter((task:any) => task.RequestTask.id === activeTask).map((task:any) => ( 
                            <>
                            {(() => {
                              const response = task.RequestTask.Responses.find((response:any) => response.RequestQuestionID === question.id); 
                              return (
                                <>
                              <div key={task.RequestTask.id} className="w-1/4 flex flex-col justify-center items-start bg-gray-100 h-full rounded-tl rounded-bl p-4">
                                <WorkflowStatusIndicator status={response?.Status ?? 'Pending'} showLabel={true} pulse={false} />
                              </div>
                              <div className="w-1/2 flex flex-col h-full p-2 pl-4"> 
                                <div className="flex flex-row gap-2 items-center mb-2"> 
                                  <i className={`${questionTypeIcons(question.Type)} text-[#4E6E5D] text-xl`}></i> 
                                  <div>{question.Name}:</div> 
                                </div> 
                                <div className="flex justify-start items-start"> 
                                    {question.Type === 'date' ? ( 
                                    response?.Value ? formatDate( response?.Value ) : <br />
                                    ) : question.Type === 'file' ? ( 
                                    <div>{response?.Value ? question.Name + '_response' : <br />}</div> 
                                    ) : ( 
                                    <div>{response?.Value ? response?.Value : <br />}</div> 
                                    )} 
                                </div>
                              </div>
                              <div className="w-1/4 flex flex-col h-full p-2"> 
                                <div className="flex justify-center items-start border-l border-gray-300 p-2 h-full w-full">
                                  {response?.Status === 'Waived' || response?.Status === 'Closed' ? ( 
                                    <div className="flex flex-row justify-center items-center gap-3 h-full"> 
                                      <i title="Reset Question" className="fa-sharp fa-rotate-left text-[#4E6E5D] text-xl cursor-pointer" onClick={() => handleReset(response?.id)}></i>
                                    </div> 
                                  ) : response?.Status === 'Completed' ? ( 
                                    <> 
                                      {question.Type === 'file' ? ( 
                                        <div className="flex flex-row justify-center items-center gap-3 h-full"> 
                                          <i title="Download File" className="fa-sharp fa-download text-[#4E6E5D] text-xl cursor-pointer" onClick={() => handleDownload(response?.Value, response.id)}></i> 
                                          <a href={import.meta.env.VITE_DOC_URL + 'request-documents/' + response?.id} target="_blank" rel="noopener noreferrer"><i title="View File" className="fa-sharp fa-up-right-from-square text-[#4E6E5D] text-xl cursor-pointer"></i></a>
                                        </div> 
                                      ) : ( 
                                        <div className="flex flex-row justify-center items-center gap-3 h-full"> 
                                          <i title="Copy Response" className="fa-sharp fa-clone text-[#4E6E5D] text-xl cursor-pointer" onClick={() => handleCopy(response?.Value)}></i> 
                                        </div> 
                                      )} 
                                    </> 
                                  ) : response?.Status === 'Entered' ? ( 
                                    <div className="flex flex-row justify-center items-center gap-3 h-full">
                                    </div>
                                  ) : ( 
                                    <div className="flex flex-row justify-center items-center gap-3 h-full">
                                      <i title="Waive Question" className="fa-sharp fa-hand-wave text-[#4E6E5D] text-xl cursor-pointer" onClick={() => handleWaive(response?.id ? response.id : 'n/a', question.id)}></i> 
                                      <i title="Mark Closed" className="fa-sharp fa-check text-[#4E6E5D] text-xl cursor-pointer" onClick={() => handleComplete(response?.id ? response.id : 'n/a', question.id)}></i>  
                                    </div> 
                                  )}
                                </div>
                              </div>
                              </>
                              )
                            })()}
                            </>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
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