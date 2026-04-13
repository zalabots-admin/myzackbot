

import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource.ts'
import { DisableableStandardButton, StandardButton, SmallButton } from '../Buttons.tsx';
import SearchBar from '../SearchBar.tsx';
import BeatLoader from "react-spinners/BeatLoader";
import { ListItem } from '../RequestItems'
import DataInputs from '../data-objects/DataInputs'
import Input from '../data-objects/Input'
import Select from '../data-objects/Select';
import { handleDataInputChangeFiltered } from '../../functions/data'
import { v4 as uuidv4 } from 'uuid';

interface Prop {
  oUserOrg: string;
}

const typeSelect = ['Text Field|text','Date Field|date','Number Field|number','Dropdown Menu|select','Document Upload|file'/*'Single Choice Option|radio','Multiple Choice Option|checkbox','Y/N Question|question','Large Text Field|textarea'*/]
const client = generateClient<Schema>();


function ItemBuilder ( props:Prop ) {

    const [loading, setLoading] = useState( true );
    const [itemData, setItemData] = useState<any[]>( [] );
    const [noItems, setNoItems] = useState( false );
    const [isEditMode, setIsEditMode] = useState( false );
    const [activeItem, setActiveItem] = useState<string>( '' );
    const [newItem, setNewItem] = useState( false );
    const [searchedValue, setSearchedValue] = useState("");
    const [originalItemData, setOriginalItemData] = useState<any[]>([]);

    async function getItems() {

        const currentItems: any = await client.models.Items.list({
            limit:500,
            filter: {OrganizationID: { eq: props.oUserOrg }}
        });  

        const sortedItems = currentItems.data.sort((a: any, b: any) => a['Name'].localeCompare(b['Name']));
        setItemData(sortedItems);
        setLoading( false );

    };

    function createNewItem() {

        const oId = uuidv4();
        setItemData((prevItems:any) => [...prevItems, { id: oId, Name: '', Type: 'text', Label: '', Description: '', Options: '', Layout: '', DocumentId: '' }]);
        setIsEditMode( true );
        setNewItem( true );
        setActiveItem( oId );

    };

    function cancelEdit() {

        const updatedItems = [ ...itemData ];
        const index = updatedItems.findIndex(item => item.id === activeItem);
        if (index !== -1) {
            updatedItems[index] = originalItemData;
        }
        setItemData( updatedItems );
        setIsEditMode( false );

    };

    function saveEdit() {

        client.models.Items.update( itemData.find(item => item.id === activeItem) );
        setIsEditMode( false );

    };

    function enableEdit() {

        const currentItem = itemData.find(item => item.id === activeItem);
        setOriginalItemData( currentItem );
        setIsEditMode( true );

    };

    function cancelNew() {

        setItemData(( prevItems:any ) => {
            const updatedItems = [ ...prevItems ];
            updatedItems.pop();
            return updatedItems;
        });
        setActiveItem( '' );
        setIsEditMode( false );
        setNewItem( false );

    };

    function saveNew() {

        client.models.Items.create( { ...itemData.find(item => item.id === activeItem), OrganizationID: props.oUserOrg } );
        setIsEditMode( false );
        setNewItem( false );

    };

    useEffect(() => { 
    
        if ( props.oUserOrg != '' ) {
            getItems();
        }
     
    },[props.oUserOrg]);

    useEffect(() => {

        if ( itemData.length > 0 ) {
            setNoItems( false );
        } else if ( itemData.length === 0 ) {
            setNoItems( true );
        }

    },[itemData]);

    return (

        <div id="item-builder" className="flex-1 flex flex-row min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 w-1/4 p-4 pr-2">
                <section className="flex-1 flex flex-col justify-between items-center min-h-0  bg-white p-6 pt-10 rounded shadow overflow-y-auto border border-gray-300">
                    <DisableableStandardButton
                        oAction={createNewItem}
                        oText="Create New Item"
                        oState={isEditMode}
                    />
                    <div className="w-3/4 mt-8">
                        <SearchBar
                            oSearchedValue={searchedValue}
                            oSetSearchedValue={setSearchedValue}
                        />
                    </div>
                    <div key='itemBuilderItems' className="flex-1 flex min-h-0 w-full overflow-y-auto p-4 border border-gray-300 rounded bg-gray-50 mt-4">
                        { loading ? (
                            <div className='w-full flex-1 flex justify-center items-center min-h-0'>
                                <BeatLoader color = "#D58936" />
                            </div>
                        ) : (
                            noItems ? (
                                <div className='w-full flex justify-center items-center'>No Current Items</div>
                            ) : (
                                <div className="w-full">
                                    {itemData.filter((row:any) => row.Name.toString().toLowerCase().includes(searchedValue.toString().toLowerCase())).map(( item:any ) => (
                                        <ListItem oKey={item.id} oName={item.Name} oType={item.Type} oClick={setActiveItem} oActive={isEditMode} oActiveItem={activeItem} />
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </section>
            </div>
            <div className="flex flex-col min-h-0 w-3/4 p-4 pl-2">   
                <section className="flex-1 flex flex-col justify-between items-center min-h-0 bg-white p-6 pt-10 rounded shadow overflow-y-auto border border-gray-300">
                    {/* Header Section */}
                    <div className="flex justify-center items-center mb-4 w-full">
                        <div className={`h2 text-xl h-10 ${isEditMode ? 'w-1/3':'w-full'}`}>Item Builder</div>
                        {isEditMode ? (
                            <>
                                {newItem ? (
                                    <div className="flex w-2/3 justify-end">
                                        <SmallButton
                                            oAction={cancelNew}
                                            oText="Cancel"
                                        />
                                        <SmallButton
                                            oAction={saveNew}
                                            oText="Add"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex w-2/3 justify-end">
                                        <SmallButton
                                            oAction={cancelEdit}
                                            oText="Cancel"
                                        />
                                        <SmallButton
                                            oAction={saveEdit}
                                            oText="Update"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {activeItem !== '' && (
                                    <div className="flex w-2/3 justify-end">
                                        <StandardButton
                                            oAction={enableEdit}
                                            oText="Edit Item"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    {/* Content Section */}
                    <div className="flex-1 flex flex-wrap overflow-y-auto p-6 border border-gray-300 rounded shadow w-full">
                    {activeItem !== '' && (
                        <>
                            <Select oKey='Type' oLabel='Data Type' oOptions={typeSelect}  oSize='col6' isRequired={true} isEditable={isEditMode} oChange={(e) => handleDataInputChangeFiltered(e, setItemData, activeItem)} oData={itemData.find(item => item.id === activeItem)?.Type} />
                            <Input oKey='Name' oType='text' oLabel='Name' oSize='col6' isRequired={true} isEditable={isEditMode} oChange={(e) => handleDataInputChangeFiltered(e, setItemData, activeItem)} oData={itemData.find(item => item.id === activeItem)?.Name} />
                            <Input oKey='Label' oType='text' oLabel="Label" oSize="col12" isRequired={true} isEditable={isEditMode} oChange={(e) => handleDataInputChangeFiltered(e, setItemData, activeItem)} oData={itemData.find(item => item.id === activeItem)?.Label} />
                            <Input oKey='Description' oType='text' oLabel='Description' oSize='col12' isRequired={false} isEditable={isEditMode} oChange={(e) => handleDataInputChangeFiltered(e, setItemData, activeItem)} oData={itemData.find(item => item.id === activeItem)?.Description} />
                            { itemData.find(item => item.id === activeItem)?.Type === "select" && (
                                <>
                                    <Input oKey='Options' oType='text' oLabel='Enter Options' oSize='col12' oDescription='Seperate each value with a comma. For ex: Option 1,Option 2,Option 3' isRequired={true} isEditable={isEditMode} oChange={(e) => handleDataInputChangeFiltered(e, setItemData, activeItem)} oData={itemData.find(item => item.id === activeItem)?.Options} />
                                </>
                            )}
                            <div className="col11 align-top-center" style={{marginTop:'25px'}}>
                                <div className='col12'>Item Preview</div>
                                <div className="col11 align-top-center">
                                    {itemData.find(item => item.id === activeItem)?.Type === "file" ? (
                                        <DataInputs oData={{ UploadText:'Drag & Drop or Click to Upload', DocumentLink: '', documentData: '', Label: itemData.find(item => item.id === activeItem)?.Label, Type:'file' }} oChange='' oEditable={true} />
                                    ) : (
                                        <DataInputs oData={itemData.find(item => item.id === activeItem)} oChange='' oEditable={true} />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                </section>
            </div>
        </div>
    
    );

};

export default ItemBuilder;