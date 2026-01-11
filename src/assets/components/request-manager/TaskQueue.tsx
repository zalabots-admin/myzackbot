
import { useState, useEffect } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import  SearchBar from '../SearchBar'
import { getTasksData, formatDate } from '../../functions/data';


interface Prop {
  oUserOrg: string;
  oOpenRequest: any;
  //oEvent: any;
}


function TaskQueue( props:Prop ) {

    const [loading, setLoading] = useState( true );
    const [noTasks, setNoTasks] = useState( false );
    const [taskData, setTaskData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [searchedValue, setSearchedValue] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: '', direction: "asc" });

    async function getTasks()  {

        const currentTasks = await getTasksData( props.oUserOrg ) 

        setTaskData( currentTasks );
        setFilteredData( currentTasks );

        if ( currentTasks.length > 0 && props.oUserOrg != '' ) { 
            setLoading(false);
            setNoTasks(false)
        } else if ( currentTasks.length === 0 &&  props.oUserOrg != '' ) {
            setLoading(false)  ;
            setNoTasks(true)
        }

    };

    const renderIcon = (key:any) => {

        if (sortConfig.key !== key) {
        return <i className={"fa-sharp fa-thin fa-sort text-gray-400 ml-1"}></i>;
        }

        return (
        <i className={"fa-sharp fa-thin " + (sortConfig.direction === "asc" ? "fa-sort-up" : "fa-sort-down") + " text-gray-500 ml-1"}></i>
        );
    };

    const handleSort = (key:any) => {
        const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
        setSortConfig({ key, direction });

        const sortedData = [...filteredData].sort((a, b) => {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
        });

        setFilteredData(sortedData);
    };

    useEffect(() => { 

        if (props.oUserOrg != '' ) {
            getTasks();
        }

    },[props.oUserOrg]);

    useEffect(() => { 

        const filteringData = taskData.filter(item => {
            const lowerCaseSearchTerm = searchedValue.toLowerCase();
            return (
                item.Request.AccountName.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.Request.DueDate.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.Assignee.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.Request.RequestedFor.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.Instructions.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.RequestTaskStatus.toLowerCase().includes(lowerCaseSearchTerm)
            );
        });

        const sortedData = [...filteringData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
        });
        setFilteredData( sortedData );

    },[searchedValue]);

    /*useEffect(() => {

        if ( props.oEvent != '' && props.oEvent != null && props.oEvent != undefined ) {
            const eventData = JSON.parse( props.oEvent.data );
            if ( props.oEvent.event === 'New') {
                const currentTasks = [...taskData];
                currentTasks.push( eventData );
                setTaskData( currentTasks );
                setFilteredData( currentTasks );
                setNoTasks( false );
            } else if ( props.oEvent.event === 'Update' ) {
                const currentTasks = [...taskData];
                const index = currentTasks.findIndex( (item) => item.id === eventData.id );
                if ( index !== -1 ) {
                    currentTasks[index] = eventData;
                    setTaskData( currentTasks );
                    setFilteredData( currentTasks );
                };
            } else if ( props.oEvent.event === 'Delete' ) {
                
                const currentTasks = taskData.filter( (item) => item.id !== eventData.id )
                setTaskData( currentTasks );
                setFilteredData( currentTasks );
                if ( currentTasks.length === 0 ) {
                    setNoTasks( true );
                }
            };
        
        };

    },[props.oEvent]);*/


  return (

    <div className="flex-1 flex flex-col min-h-0">
        { loading ? (
            <div className='flex-1 flex items-center justify-center'>
                <BeatLoader color = "#D58936" />
            </div>
        ) : (
            noTasks ? (
                <div id="no-tasks" className='flex-1 flex items-center justify-center'>No Current Tasks</div>
            ) : (
                <div id="task-queue" className="flex-1 flex flex-col min-h-0 shadow m-4 p-4 border border-gray-300 bg-white" >
                    <div id="search-bar" className='flex items-center w-full lg:w-1/3 mb-2'>
                        <SearchBar
                            oSearchedValue={searchedValue}
                            oSetSearchedValue={setSearchedValue}
                        />
                    </div>
                    <div id="task-list" className="flex-1 flex flex-col min-h-0 shadow m-4 p-4 border border-gray-300">
                        <div id="task-list-header" className="hidden lg:flex items-center border-b h-[50px] p-2">
                            <div className="w-[10%] flex items-center gap-1 cursor-pointer"
                                onClick={() => handleSort("DueDate")}>
                                {renderIcon("DueDate")} <span className='select-none'>Due Date</span>
                            </div>
                            <div className="w-[20%] flex items-center gap-1 cursor-pointer"
                                onClick={() => handleSort("AccountName")} >
                                {renderIcon("AccountName")} <span className='select-none'>Account Name</span>
                            </div>
                            <div className="w-[20%] flex items-center gap-1 cursor-pointer"
                                onClick={() => handleSort("RequestedFor")} >
                                {renderIcon("RequestedFor")} <span className='select-none'>Requested For</span>
                            </div>
                            <div
                                className="w-[20%] flex items-center gap-1 cursor-pointer"
                                onClick={() => handleSort("Assignee")}>
                                {renderIcon("Assignee")} <span className='select-none'>Assignee</span>
                            </div>
                            <div
                                className="w-[20%] flex items-center gap-1 cursor-pointer"
                                onClick={() => handleSort("Instructions")}>
                                {renderIcon("Instructions")} <span className='select-none'>Instructions</span>
                            </div>
                            <div className="w-[10%] flex items-center gap-1 cursor-pointer"
                                onClick={() => handleSort("RequestTaskStatus")} >
                                {renderIcon("RequestTaskStatus")} <span className='select-none'>Status</span>
                            </div>
                        </div>
                        <div id="task-list-body" className='flex-1 flex flex-col overflow-y-auto'>
                            {filteredData.map((item:any, index:number) => (
                                <>
                                    {/* Desktop View */}
                                    <div id={`task-list-item-${index}`} className={'hidden lg:flex cursor-pointer hover:bg-[#00556640] transition-colors duration-200 ease-in-out even:bg-[#F4F4F4]'} key={index} onClick={() => {props.oOpenRequest( item.id, item.RequestedFor, item.RequestTaskStatus ); /*props.oEvent;*/}}>
                                        <div className='w-[10%] flex items-center h-[50px] p-2'>{formatDate(item.Request.DueDate)}</div>
                                        <div className='w-[20%] flex items-center h-[50px] p-2'>{item.Request.AccountName}</div>
                                        <div className='w-[20%] flex items-center h-[50px] p-2'>{item.Request.RequestedFor}</div>
                                        {item.Participants[0].EntityName === '' ? (
                                            <div className='w-[20%] flex items-center h-[50px] p-2'>{item.Participants[0].FirstName + ' ' + item.Participants[0].LastName}</div>
                                        ) : (
                                            <div className='w-[20%] flex items-center h-[50px] p-2'>{item.Participants[0].EntityName}</div>
                                        )}
                                        <div className='w-[20%] flex items-center h-[50px] p-2'>{item.Instructions}</div>
                                        <div className='w-[10%] flex items-center h-[50px] p-2'>{item.RequestTaskStatus.toUpperCase()}</div>
                                    </div>
                                    {/* Mobile View */}
                                        <div id={`task-list-item-${index}`} className={'flex lg:hidden flex-col border-b'} key={index} onClick={() => {props.oOpenRequest( item.id, item.RequestedFor, item.RequestTaskStatus ); /*props.oEvent;*/}}>
                                            <div className='flex justify-between p-2'>
                                                <span className='font-semibold'>Due Date:</span>{formatDate(item.Request.DueDate)}
                                            </div>
                                            <div className='flex justify-between p-2'>
                                                <span className='font-semibold'>Account Name:</span>{item.Request.AccountName}
                                            </div>
                                            <div className='flex justify-between p-2'>
                                                <span className='font-semibold'>Requested For:</span>{item.Request.RequestedFor}
                                            </div>
                                            {item.Participants[0].EntityName === '' ? (
                                                <div className='flex justify-between p-2'>
                                                    <span className='font-semibold'>Requested For:</span>{item.Participants[0].FirstName + ' ' + item.Participants[0].LastName}
                                                </div>
                                            ) : (
                                                <div className='flex justify-between p-2'>
                                                    <span className='font-semibold'>Requested For:</span>{item.Participants[0].EntityName}
                                                </div>
                                            )}
                                            <div className='flex justify-between p-2'>
                                                <span className='font-semibold'>Status:</span>{item.Instructions}
                                            </div>
                                            <div className='flex justify-between p-2'>
                                                <span className='font-semibold'>Status:</span>{item.RequestTaskStatus.toUpperCase()}
                                            </div>
                                        </div>
                                </>
                            ))}
                        </div> 
                    </div>
                </div>
            )
        )}
    </div>

  );

};

export default TaskQueue;