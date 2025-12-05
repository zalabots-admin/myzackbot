

import { useState, useEffect } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { formatDate, formatToLocalTime, getRequestViewData } from '../../functions/data'

import '../../styles/ProgressBar.css'

interface Prop {
  oOpenTabs: any;
  oCurrentTab: number;
  oUser: any;
}


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
    
    const fileUrl = import.meta.env.VITE_DOC_URL + oId; // your file URL
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


  useEffect(() => {
  
      getRequest();
  
  },[]);

  useEffect(() => {

    validateHistoryEvents();

  },[activeTask]);


  return (

    <>
      { loading ? (
        <div className='col12 align-center-center'>
            <BeatLoader color = "#D58936" />
        </div>
      ) : (
        <div className='component-layout-rows ' style={{ '--gridRows': ' 25px 650px 75px' } as React.CSSProperties}> 
          <div></div>
          <div className='component-layout-columns ' style={{ '--gridColumns': '35% 25% 1fr' } as React.CSSProperties}>
            <div className="card-flat-rounded">
              <div className='component-layout-rows ' style={{ '--gridRows': '50px 1fr' } as React.CSSProperties}> 
                <div className='align-center-center'><h3>Request &amp; Task Details</h3></div>
                  <div>
                  <div style={{marginBottom:'25px'}}>
                    <div className='font-bold text-[#003399] mb-4'>Request:</div>
                    <div>{requestDetails.AccountName}</div>
                    <div>{requestDetails.RequestedFor}</div>
                    <div>Created: {formatDate( requestDetails.createdAt )}</div>
                    <div>Due: {formatDate( requestDetails.DueDate )}</div>
                    <div>Status: {requestDetails.RequestStatus}</div>
                  </div>
                  <div style={{marginBottom:'25px'}}>
                    <div className='font-bold text-[#003399] mb-4'>Tasks:</div>
                    {requestDetails.RequestTasks?.map((task:any) => (
                      <>
                      {activeTask === task.RequestTask.id ? (
                        <div className={'flex cursor-pointer hover:bg-[#00556640] transition-colors duration-200 ease-in-out even:bg-[#F4F4F4]'} key={task.id} onClick={() => {setActiveTask(task.RequestTask.id)}}>
                            <div className='w-[70%] flex items-center h-[60px] p-2 font-bold text-[#005566]'>{task.FirstName} {task.LastName}<br/>{task.Email}</div>
                            <div className='w-[30%] flex items-center h-[60px] p-2 font-bold text-[#005566]'>{task.RequestTask.RequestTaskStatus.toUpperCase()}</div>
                        </div>
                      ) : (
                        <div className={'flex cursor-pointer hover:bg-[#00556640] transition-colors duration-200 ease-in-out even:bg-[#F4F4F4]'} key={task.id} onClick={() => {setActiveTask(task.RequestTask.id)}}>
                            <div className='w-[70%] flex items-center h-[60px] p-2'>{task.FirstName} {task.LastName}<br/>{task.Email}</div>
                            <div className='w-[30%] flex items-center h-[60px] p-2'>{task.RequestTask.RequestTaskStatus.toUpperCase()}</div>
                        </div>
                      )}
                      </>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-flat-rounded">
              <div className='col12 component-layout-rows' style={{ '--gridRows': '50px 90px 90px 90px 90px 90px 90px' } as React.CSSProperties}> 
                      <div className='align-center-center'><h3>Request &amp; Task History</h3></div>
                      {historySteps.map(( item:any, index:number ) => ( 
                          <div className='col12 component-layout-columns' style={{ '--gridColumns': '50px 1fr' } as React.CSSProperties}>
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
            <div className="card-flat-rounded overflow-y-auto overflow-x-hidden" style={{'height':'650px'}}>
              <>
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
                                        <a title='Open File in New Tab' className='w-[7%] cursor-pointer' href={import.meta.env.VITE_DOC_URL + response.id} target="_blank" rel="noopener noreferrer"><div className='text-[20px] text-[#005566] cursor-pointer hover:text-[#D58936]'><i className={"fa-sharp fa-thin fa-up-right-from-square "}></i></div></a>
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
              </>
            </div>
          </div>
          <div className="align-center-right">
            <button className='small'>Complete</button>
          </div>
        </div>
      )}
    </>
  );

};

export default ViewRequest;