

import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource.ts'
import { BeatLoader } from "react-spinners";
import { DisableableStandardButton, SmallButton, StandardButton } from "../Buttons.tsx";
import SearchBar from "../SearchBar.tsx";
import { DraggableListItem, ListItem, dataTypes } from "../RequestItems.tsx";
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, } from '@dnd-kit/sortable';
import ZackbotEditor from '../Editor.tsx';
import { v4 as uuidv4 } from 'uuid';
import Input from "../data-objects/Input.tsx";
import Select from "../data-objects/Select.tsx";
import DataInputs from "../data-objects/DataInputs.tsx";
import { handleDataInputChangeFiltered } from "../../functions/data.ts";
import RightSidePanel from "../SideBar.tsx";


interface Prop {
  oUserOrg: string;
}

const client = generateClient<Schema>();

function FormBuilder ( props:Prop ) {

    const [loading, setLoading] = useState( true );
    const [formData, setFormData] = useState<any[]>([]);
    const [itemData, setItemData] = useState<any[]>([{id:'1', Name:'Custom Item', Type:'custom'}]);
    const [formItemData, setFormItemData] = useState<any[]>([]);
    const [noForms, setNoForms] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeForm, setActiveForm] = useState<string>( '' );
    const [activeItem, setActiveItem] = useState<string>( '' );
    const [newForm, setNewForm] = useState(false);
    const [searchedFormValue, setSearchedFormValue] = useState("");
    const [searchedItemValue, setSearchedItemValue] = useState("");
    const [originalFormData, setOriginalFormData] = useState<any[]>([]);
    const [originalFormItemsData, setOriginalFormItemsData] = useState<any[]>([]);
    const [sidePanelOpen, setSidePanelOpen] = useState( false );
    const [saving, setSaving] = useState( false );

    async function getForms() {

        const currentItems: any = await client.models.Forms.list({
            limit:500,
            filter: {OrganizationID: { eq: props.oUserOrg }}
        });  
  
        setLoading( false );
        const sortedItems = currentItems.data.sort((a: any, b: any) => a['Name'].localeCompare(b['Name']));
        setFormData( sortedItems );
    
    };

    async function getItems() {

        const currentItems: any = await client.models.Items.list({
            limit:500,
            filter: {OrganizationID: { eq: props.oUserOrg }}
        });  

        const sortedItems = currentItems.data.filter((item: any) => item.Type != 'custom').sort((a: any, b: any) => a['Name'].localeCompare(b['Name']));
        setItemData( [...itemData, ...sortedItems] );

    };

    async function getFormsItems( oItem : string ) {

        const currentItems: any = await client.models.FormItems.list({
            limit:500,
            filter: {FormID: { eq: formData.find(form => form.id === oItem).id }}
        });  

        const sortedItems = currentItems.data.sort((a: any, b: any) => Number(a.Order) - Number(b.Order));

        setFormItemData( sortedItems );
        setActiveForm( oItem );
        setActiveItem( sortedItems[0]?.id || '');

    };

    function handleDragEnd ( event: DragEndEvent ) {
   
        const { active, over } = event;
        if (!over) return;
        if (over.id === 'canvas') {
            const original = itemData.find((item) => item.id === active.id);
            if ( original.Type === 'custom' ) {
                const clone: any = {
                    id: 'T' + uuidv4(),
                    FormID: activeForm,
                    Name: original.Name,
                    Type: 'text',
                    Label: '',
                    Description: '',
                    Options: '',
                    Layout: '',
                    DocumentId: '',
                    Order: formItemData.length + 1,
                };
                setSidePanelOpen(!sidePanelOpen);
                setFormItemData((prev:any) => [...prev, clone]);
                setActiveItem(clone.id);
            } else {
                const clone: any = {
                    id: 'T' +uuidv4(),
                    FormID: activeForm,
                    Name: original.Name,
                    Type: original.Type,
                    Label: original.Label,
                    Description: original.Description,
                    Options: original.Options,
                    Layout: original.Layout,
                    DocumentId: original.DocumentId,
                    Order: formItemData.length + 1,
                };
                setFormItemData((prev:any) => [...prev, clone]);
                setActiveItem(clone.id);
            }
        } else if (active.id !== over.id) {
            const oldIndex = formItemData.findIndex((i) => i.id === active.id);
            const newIndex = formItemData.findIndex((i) => i.id === over.id);
            setFormItemData(arrayMove(formItemData, oldIndex, newIndex));
        };

    };

    function createNewForm() {

        const oId = uuidv4();
        setFormData( (prevItems:any) => [...prevItems, { id: oId, Name: '', Type: 'form', Description: '', OrganizationID: props.oUserOrg }] );
        setIsEditMode( true );
        setNewForm( true );
        setActiveForm( oId );
        setFormItemData( [] );

    };

    async function openForm( oItem : string ) {

        await getFormsItems( oItem );
        setActiveForm( oItem );
    }

    function enableEdit() {

        const currentForm = formData.find(form => form.id === activeForm);
        setOriginalFormData( currentForm );
        const originalFormItems = [ ...formItemData ];
        setOriginalFormItemsData( originalFormItems );
        setIsEditMode( true );
        
    };

    function cancelEdit() {

        const updatedItems = [ ...formData ];
        const index = updatedItems.findIndex(form => form.id === activeForm);
        if (index !== -1) {
            updatedItems[index] = originalFormData;
        }
        setFormData( updatedItems );
        setFormItemData( originalFormItemsData );
        setIsEditMode( false );
    };

    async function saveEdit() {

        setSaving( true );
        await client.models.Forms.update( formData.find(form => form.id === activeForm) );

        const currentFormItems = formItemData;
        for (const [index, item] of currentFormItems.entries()) {

            item.Order = index + 1;
            if (item.id.toString().startsWith( 'T' )) {
                item.id = undefined;
                const result = await client.models.FormItems.create( item );
                item.id = result.data?.id;
            } else if ( item.deleted ) {
                await client.models.FormItems.delete({ id: item.id });
            } else {
                await client.models.FormItems.update( item );
            }

        }

        setFormItemData( currentFormItems );
        setIsEditMode( false );
        setActiveForm( formData.find(form => form.id === activeForm).id || '' );
        setActiveItem( currentFormItems[0]?.id || '' );
        setSaving( false );

    }

    function cancelNew() {

        setFormData(( prevItems:any ) => {
            const updatedItems = [ ...prevItems ];
            updatedItems.pop();
            return updatedItems;
        });
        setFormItemData( [] );
        setActiveForm( '' );
        setIsEditMode( false );
        setNewForm( false );

    };

    async function saveNew() {

        setSaving( true );
        const formResult = await client.models.Forms.create( formData.find(form => form.id === activeForm) );

        const currentFormItems = formItemData;
        for (const [index, item] of currentFormItems.entries()) {
        item.Order = index + 1;
        item.id = undefined; 
        item.FormID = formResult.data?.id;
        const result = await client.models.FormItems.create( item );
        item.id = result.data?.id;
        }

        setFormData(( prevItems:any ) => {
            const updatedItems = [...prevItems];
            const index = updatedItems.findIndex(form => form.id === activeForm);
            if (index !== -1) {
                updatedItems[index] = { ...updatedItems[index], id: formResult.data?.id };
            }
            return updatedItems;
        });
        setFormItemData( currentFormItems );
        setIsEditMode( false );
        setNewForm( false );
        setActiveForm( formResult.data?.id || '' );
        setActiveItem( currentFormItems[0]?.id || '' );
        setSaving( false );
        
    };
   
    useEffect(() => { 
    
        if ( props.oUserOrg != '' ) {
            getForms();
            getItems();
        }
        
    },[props.oUserOrg]);

    useEffect(() => {

        if ( formData.length > 0 ) {
            setNoForms( false );
        } else if ( formData.length === 0 ) {
            setNoForms( true );
        }

    },[formData]);

    return (
        <>
            <div id="item-builder" className="flex-1 flex flex-row min-h-0 overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0 w-1/4 p-4 pr-2">
                    <section className="flex-1 flex flex-col justify-between items-center min-h-0  bg-white p-6 pt-10 rounded shadow overflow-y-auto border border-gray-300">
                        <DisableableStandardButton
                            oAction={createNewForm}
                            oText="Create New Form"
                            oState={isEditMode}
                        />
                        <div className="w-3/4 mt-8">
                            <SearchBar
                                oSearchedValue={searchedFormValue}
                                oSetSearchedValue={setSearchedFormValue}
                            />
                        </div>
                        <div key='itemBuilderItems' className="flex-1 flex min-h-0 w-full overflow-y-auto p-4 border border-gray-300 rounded bg-gray-50 mt-4">
                            { loading ? (
                                <div className='w-full flex-1 flex justify-center items-center min-h-0'>
                                    <BeatLoader color = "#D58936" />
                                </div>
                            ) : (
                                noForms ? (
                                    <div className='w-full flex justify-center items-center'>No Current Forms</div>
                                ) : (
                                    <div className="w-full">
                                        {formData.filter((row:any) => row.Name.toString().toLowerCase().includes(searchedFormValue.toString().toLowerCase())).map(( item:any ) => (
                                            <ListItem oKey={item.id} oName={item.Name} oType={item.Type} oClick={() => openForm(item.id)} oActive={isEditMode} oActiveItem={activeForm} oDescription={item.Description} />
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
                            <div className={`h2 text-xl h-10 ${isEditMode ? 'w-1/3':'w-full'}`}>Form Builder</div>
                            {isEditMode ? (
                                <>
                                    {newForm ? (
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
                                        <div className="flex flex-row w-full">
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
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {activeForm !== '' && (
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
                        {/* Saving Overlay */}
                        {saving && (
                            <div className='absolute z-10 inset-0 bg-white/70 flex justify-center items-center'>
                                <BeatLoader color = "#D58936" />
                            </div>
                        )}
                        {/* Content Section */}
                        <div id="form-builder" className='flex-1 flex flex-col min-h-0 overflow-hidden w-full border border-gray-300 rounded bg-gray-50'>
                            <div className='flex-1 flex flex-col min-h-0 overflow-hidden w-full'>
                                <DndContext onDragEnd={handleDragEnd}>
                                    {activeForm !== '' && (
                                        <div className="flex-1 flex flex-row min-h-0 gap-4 p-4 overflow-y-auto overflow-x-hidden" >
                                            { loading ? (
                                                <div className='h-full w-full flex justify-center items-center'>
                                                    <BeatLoader color = "#D58936" />
                                                </div>
                                            ) : (
                                                <div className='flex-1 flex flex-col w-1/3'>
                                                    <Input oKey='Name' oType='text' oLabel='Name' oSize='col12' isRequired={true} isEditable={isEditMode} oChange={(e) => handleDataInputChangeFiltered(e, setFormData, activeForm)} oData={formData.find(form => form.id === activeForm).Name} />
                                                    <Input oKey='Description' oType='text' oLabel='Description' oSize='col12' isRequired={false} isEditable={isEditMode} oChange={(e) => handleDataInputChangeFiltered(e, setFormData, activeForm)} oData={formData.find(form => form.id === activeForm).Description} />
                                                    <div className='w-full'>
                                                        <SearchBar
                                                            oSearchedValue={searchedItemValue}
                                                            oSetSearchedValue={setSearchedItemValue}
                                                        />
                                                    </div>
                                                    <div>
                                                        {itemData.filter((row:any) => row.Name.toString().toLowerCase().includes(searchedItemValue.toString().toLowerCase())).map(( item:any ) => (
                                                            <DraggableListItem oKey={item.id} oName={item.Name} oType={item.Type} oActive={isEditMode} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-col w-2/3">
                                                <ZackbotEditor oItems={formItemData} oSetItems={setFormItemData} oIsEditable={isEditMode} oClick={setFormItemData} oSetActive={setActiveItem} oOpenSidePanel={setSidePanelOpen} />
                                            </div>
                                        </div>
                                    )}
                                </DndContext>
                            </div>
                        </div>
                    </section>
                </div>                
            </div>
             <RightSidePanel isOpen={sidePanelOpen}>
                <div className="flex flex-col h-full">
                <div className="flex flex-col h-[125px] w-full">
                    <div className='font-bold mb-2 text-[#EB7100] text-4xl'>Form Item Manager</div>
                    <div className='font-bold text-[#EB7100] text-xl'>Edit Item Details</div>
                </div>
                <div className="flex-1">
                    {formItemData.length > 0 && (
                    <>
                        <Select oKey='Type' oLabel='Data Type' oOptions={dataTypes()}  oSize='col12' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setFormItemData, activeItem)} oData={formItemData.find(item => item.id === activeItem).Type} />
                        <Input oKey='Name' oType='text' oLabel='Name' oSize='col12' oDescription='Internal reference only in the Request Builder' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setFormItemData, activeItem)} oData={formItemData.find(item => item.id === activeItem).Name} />
                        <Input oKey='Label' oType='text' oLabel="Label" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setFormItemData, activeItem)} oData={formItemData.find(item => item.id === activeItem).Label} />
                        <Input oKey='Description' oType='text' oLabel='Description' oSize='col12' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setFormItemData, activeItem)} oData={formItemData.find(item => item.id === activeItem).Description} />
                        { formItemData.find(item => item.id === activeItem).Type === "select" && (
                            <>
                                <Input oKey='Options' oType='text' oLabel='Enter Options' oSize='col12' oDescription='Seperate each value with a comma. For ex: Option 1,Option 2,Option 3' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChangeFiltered(e, setFormItemData, activeItem)} oData={formItemData.find(item => item.id === activeItem).Options} />
                            </>
                        )}
                        <div className="col12" style={{marginTop:'25px'}}>
                            <div className='col12'>Question Preview</div>
                            <div className="col12 align-top-center">
                                <DataInputs oData={formItemData.find(item => item.id === activeItem)} oChange='' oEditable={true} />
                            </div>
                            </div>
                        
                    </>
                    )}
                </div>
                <div className="flex h-[100px] items-center justify-center w-full">
                    <StandardButton 
                        oAction={() => setSidePanelOpen(false)}
                        oText="Save & Close"/>
                </div>
                </div>
            </RightSidePanel> 
        </>
    );

}

export default FormBuilder;