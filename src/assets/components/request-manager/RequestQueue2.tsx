
import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../../amplify/data/resource'
import BeatLoader from "react-spinners/BeatLoader";
import  SearchBar from '../SearchBar'
import { formatDate, formatToLocalTime } from '../../functions/data';


interface Prop {
  oUserOrg: string;
  oOpenRequest: any;
  oEvent: any;
}

const client = generateClient<Schema>();


function RequestQueue( props:Prop ) {

    const [loading, setLoading] = useState( true );
    const [noRequests, setNoRequests] = useState( false );
    const [requestData, setRequestData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [searchedValue, setSearchedValue] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: '', direction: "asc" });

    async function getRequests()  {

        const currentRequests = await client.models.Request.list({
            limit:500,
            filter: {OrganizationID: { eq: props.oUserOrg }}
        });  

        setRequestData( currentRequests.data );
        setFilteredData( currentRequests.data );

        if ( currentRequests.data.length > 0 && props.oUserOrg != '' ) { 
            setLoading(false);
            setNoRequests(false)
        } else if ( currentRequests.data.length === 0 &&  props.oUserOrg != '' ) {
            setLoading(false)  ;
            setNoRequests(true)
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
            getRequests();
        }

    },[props.oUserOrg]);

    useEffect(() => { 

        const filteringData = requestData.filter(item => {
            const lowerCaseSearchTerm = searchedValue.toLowerCase();
            return (
                item.AccountName.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.DueDate.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.createdAt.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.RequestedFor.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.RequestStatus.toLowerCase().includes(lowerCaseSearchTerm)
            );
        });

        const sortedData = [...filteringData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
        });
        setFilteredData( sortedData );

    },[searchedValue]);

    useEffect(() => {

        if ( props.oEvent != '' && props.oEvent != null && props.oEvent != undefined ) {
            const eventData = JSON.parse( props.oEvent.data );
            if ( props.oEvent.event === 'New') {
                const currentRequests = [...requestData];
                currentRequests.push( eventData );
                setRequestData( currentRequests );
                setFilteredData( currentRequests );
                setNoRequests( false );
            } else if ( props.oEvent.event === 'Update' ) {
                const currentRequests = [...requestData];
                const index = currentRequests.findIndex( (item) => item.id === eventData.id );
                if ( index !== -1 ) {
                    currentRequests[index] = eventData;
                    setRequestData( currentRequests );
                    setFilteredData( currentRequests );
                };
            } else if ( props.oEvent.event === 'Delete' ) {
                
                const currentRequests = requestData.filter( (item) => item.id !== eventData.id )
                setRequestData( currentRequests );
                setFilteredData( currentRequests );
                if ( currentRequests.length === 0 ) {
                    setNoRequests( true );
                }
            };
        
        };

    },[props.oEvent]);


  return (

    <>
        { loading ? (
            <div className='flex h-full items-center justify-center'>
                <BeatLoader color = "#D58936" />
            </div>
        ) : (
            noRequests ? (
                <div className='flex items-center justify-center'>No Current Requests</div>
            ) : (
                <div className="flex-1 shadow m-4 p-4 border border-gray-300 h-full bg-red-50" >
                    <div className='flex items-center w-full lg:w-1/3'>
                        <SearchBar
                            oSearchedValue={searchedValue}
                            oSetSearchedValue={setSearchedValue}
                        />
                    </div>
                    <div className="hidden lg:grid grid-rows-[50px_1fr] shadow m-4 p-4 border border-gray-300 h-[80%]">
                        <div className="hidden lg:flex items-center border-b h-[50px] p-2">
                            <div
                                className="w-[15%] flex items-center gap-1 cursor-pointer"
                                onClick={() => handleSort("createdAt")}>
                                {renderIcon("createdAt")} <span className='select-none'>Created On</span>
                            </div>
                            <div className="w-[15%] flex items-center gap-1 cursor-pointer"
                                onClick={() => handleSort("DueDate")}>
                                {renderIcon("DueDate")} <span className='select-none'>Due Date</span>
                            </div>
                            <div className="w-[30%] flex items-center gap-1 cursor-pointer"
                                onClick={() => handleSort("AccountName")} >
                                {renderIcon("AccountName")} <span className='select-none'>Account Name</span>
                            </div>
                            <div className="w-[30%] flex items-center gap-1 cursor-pointer"
                                onClick={() => handleSort("RequestedFor")} >
                                {renderIcon("RequestedFor")} <span className='select-none'>Requested For</span>
                            </div>
                            <div className="w-[10%] flex items-center gap-1 cursor-pointer"
                                onClick={() => handleSort("RequestStatus")} >
                                {renderIcon("RequestStatus")} <span className='select-none'>Status</span>
                            </div>
                        </div>
                        <div className='flex flex-col overflow-y-auto'>
                            {filteredData.map((item:any, index:number) => (
                                <>
                                    {/* Desktop View */}
                                    <div className={'hidden lg:flex  cursor-pointer hover:bg-[#00556640] transition-colors duration-200 ease-in-out even:bg-[#F4F4F4]'} key={index} onClick={() => {props.oOpenRequest( item.id, item.RequestedFor, item.RequestStatus ); props.oEvent;}}>
                                        <div className='w-[15%] flex items-center h-[300px] p-2'>{formatDate(item.createdAt) + ' ' + formatToLocalTime(item.createdAt)}</div>
                                        <div className='w-[15%] flex items-center h-[300px] p-2'>{formatDate(item.DueDate)}</div>
                                        <div className='w-[30%] flex items-center h-[300px] p-2'>{item.AccountName}</div>
                                        <div className='w-[30%] flex items-center h-[300px] p-2'>{item.RequestedFor}</div>
                                        <div className='w-[10%] flex items-center h-[300px] p-2'>{item.RequestStatus.toUpperCase()}</div>
                                    </div>
                                    
                                </>
                            ))}
                        </div> 
                    </div>
                    <div className="lg:hidden flex flex-col h-full shadow m-4 p-4 border border-gray-300 overflow-y-auto">
                        {filteredData.map((item:any, index:number) => (
                            <>
                                {/* Mobile View */}
                                <div className={'flex lg:hidden flex-col border-b'} key={index} onClick={() => {props.oOpenRequest( item.id, item.RequestedFor, item.RequestStatus ); props.oEvent;}}>
                                    <div className='flex justify-between p-2'>
                                        <span className='font-semibold'>Created On:</span>{formatDate(item.createdAt) + ' ' + formatToLocalTime(item.createdAt)}
                                    </div>
                                    <div className='flex justify-between p-2'>
                                        <span className='font-semibold'>Due Date:</span>{formatDate(item.DueDate)}
                                    </div>
                                    <div className='flex justify-between p-2'>
                                        <span className='font-semibold'>Account Name:</span>{item.AccountName}
                                    </div>
                                    <div className='flex justify-between p-2'>
                                        <span className='font-semibold'>Requested For:</span>{item.RequestedFor}
                                    </div>
                                    <div className='flex justify-between p-2'>
                                        <span className='font-semibold'>Status:</span>{item.RequestStatus.toUpperCase()}
                                    </div>
                                </div>
                            </>
                        ))}
                    </div>
                </div>
            )
        )}
    </>

  );

};

export default RequestQueue;