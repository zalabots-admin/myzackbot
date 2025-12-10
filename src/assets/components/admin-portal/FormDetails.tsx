

import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource'
import { DndContext, DragEndEvent, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { arrayMove, } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { DraggableListItem } from '../RequestItems.tsx';
import ZackbotEditor from './Editor.tsx';
import DataInputs from '../data-objects/DataInputs'
import Input from '../data-objects/Input'
import Select from '../data-objects/Select.tsx';
import  SearchBar from '../SearchBar'
import { handleDataInputChange } from '../../functions/data'
import SideBar from '../SideBar';


interface Prop {
  oItems: any[];
  oForms: any[];
  oFormItems: any[];
  oActiveForm: number;
  oIsEditMode: boolean;
  oNewForm: boolean;
  oSetIsEditMode: (value: boolean) => void;
  oSetNewForm: (value: boolean) => void;
  oSetFormData: (value: any) => void;
  oSetFormItemData: (value: any) => void;
  oSetActiveForm: (value: number) => void;
}

const typeSelect = ['Text Field|text','Date Field|date','Number Field|number','Dropdown Menu|select', 'File Upload|file']
const client = generateClient<Schema>();

export default function CopyAndSortDemo( props:Prop ) {

  const [searchedValue, setSearchedValue] = useState("");
  const [originalFormData, setOriginalFormData] = useState<any[]>([]);
  const [originalFormItemsData, setOriginalFormItemsData] = useState<any[]>([]);
  const [sidebarOpen, setSideBarOpen] = useState( false );
  const [activeItem, setActiveItem] = useState( 0 );

  function handleDragEnd ( event: DragEndEvent ) {
    
    const { active, over } = event;

    if (!over) return;
    if (over.id === 'canvas') {
      const original = props.oItems.find((item) => item.id === active.id);
      if ( original.Type === 'custom' ) {
        const clone: any = {
            id: 'T' + uuidv4(),
            FormID: props.oForms[props.oActiveForm].id,
            Name: original.Name,
            Type: 'text',
            Label: '',
            Description: '',
            Options: '',
            Layout: '',
            DocumentId: '',
            Order: props.oFormItems.length + 1,
            Organization: original.Organization
        }
        setActiveItem( props.oFormItems.length );
        handleViewSidebar();
        props.oSetFormItemData((prev:any) => [...prev, clone]);
      } else {
        const clone: any = {
          id: 'T' +uuidv4(),
          FormID: props.oForms[props.oActiveForm].id,
          Name: original.Name,
          Type: original.Type,
          Label: original.Label,
          Description: original.Description,
          Options: original.Options,
          Layout: original.Layout,
          DocumentId: original.DocumentId,
          Order: props.oFormItems.length + 1,
          Organization: original.Organization
        };
        props.oSetFormItemData((prev:any) => [...prev, clone]);
      }
    } else if (active.id !== over.id) {
      const oldIndex = props.oFormItems.findIndex((i) => i.id === active.id);
      const newIndex = props.oFormItems.findIndex((i) => i.id === over.id);
      props.oSetFormItemData(arrayMove(props.oFormItems, oldIndex, newIndex));
    };

  };

  function handleViewSidebar() {

    setSideBarOpen(!sidebarOpen);

};

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // require 5px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,     // press-and-hold for 150ms
        tolerance: 5,   // allow 5px movement during delay
      },
    })
  );

  function enableEdit() {

      const currentForm = props.oForms[props.oActiveForm];
      setOriginalFormData( currentForm );
      const originalFormItems = [ ...props.oFormItems ];
      setOriginalFormItemsData( originalFormItems );
      props.oSetIsEditMode( true );
    
  };

  function cancelEdit() {

    const updatedItems = [ ...props.oForms ];
    updatedItems[props.oActiveForm] = originalFormData;
    props.oSetFormData( updatedItems );
    props.oSetFormItemData( originalFormItemsData );
    props.oSetIsEditMode( false );
  };

  async function saveEdit() {

    await client.models.Forms.update( props.oForms[props.oActiveForm] );

    const currentFormItems = props.oFormItems;
    for (const [index, item] of currentFormItems.entries()) {
console.log(item);
      item.Order = index + 1;
      if (item.id.toString().startsWith( 'T' )) {
        item.id = undefined;
        const result = await client.models.FormItems.create( item );
console.log(result);
        item.id = result.data?.id;
      } else if ( item.deleted ) {
        await client.models.FormItems.delete({ id: item.id });
      } else {
        await client.models.FormItems.update( item );
      }

    }

    props.oSetFormItemData( currentFormItems );
    props.oSetIsEditMode( false );

  }

  function cancelNew() {

      props.oSetFormData(( prevItems:any ) => {
          const updatedItems = [ ...prevItems ];
          updatedItems.pop();
          return updatedItems;
      });
      props.oSetFormItemData( [] );
      props.oSetActiveForm( -1 );
      props.oSetIsEditMode( false );
      props.oSetNewForm( false );

  };

  async function saveNew() {

    const formResult = await client.models.Forms.create( props.oForms[props.oActiveForm] );

    const currentFormItems = props.oFormItems;
    for (const [index, item] of currentFormItems.entries()) {
      item.Order = index + 1;
      item.id = undefined; 
      item.FormID = formResult.data?.id;
      const result = await client.models.FormItems.create( item );
console.log(result);
      item.id = result.data?.id;
    }

    props.oSetFormData(( prevItems:any ) => {
        const updatedItems = [...prevItems];
        updatedItems[props.oActiveForm] = { ...updatedItems[props.oActiveForm], id: formResult.data?.id };
        return updatedItems;
    });
    props.oSetFormItemData( currentFormItems );
    props.oSetIsEditMode( false );
    props.oSetNewForm( false );
    
  };

  return (
    <>
      <SideBar isOpen={sidebarOpen}>
        <div className="flex flex-col h-full">
          <div className="flex flex-col h-[125px] w-full">
              <div className='font-bold mb-2 text-[#005566] text-4xl'>Form Item Manager</div>
              <div className='font-bold text-[#005566] text-xl'>Edit Item Details</div>
          </div>
          <div className="flex-1">
            {props.oFormItems.length > 0 && (
              <>
                  <Select oKey='Type' oLabel='Data Type' oOptions={typeSelect}  oSize='col12' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, props.oSetFormItemData, activeItem)} oData={props.oFormItems[activeItem].Type} />
                  <Input oKey='Name' oType='text' oLabel='Name' oSize='col12' oDescription='Internal reference only in the Request Builder' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, props.oSetFormItemData, activeItem)} oData={props.oFormItems[activeItem].Name} />
                  <Input oKey='Label' oType='text' oLabel="Label" oSize="col12" isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, props.oSetFormItemData, activeItem)} oData={props.oFormItems[activeItem].Label} />
                  <Input oKey='Description' oType='text' oLabel='Description' oSize='col12' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, props.oSetFormItemData, activeItem)} oData={props.oFormItems[activeItem].Description} />
                  { props.oFormItems[activeItem].Type === "select" && (
                      <>
                          <Input oKey='Options' oType='text' oLabel='Enter Options' oSize='col12' oDescription='Seperate each value with a comma. For ex: Option 1,Option 2,Option 3' isRequired={false} isEditable={true} oChange={(e) => handleDataInputChange(e, props.oSetFormItemData, activeItem)} oData={props.oFormItems[activeItem].Options} />
                      </>
                  )}
                  <div className="col12" style={{marginTop:'25px'}}>
                      <div className='col12'>Question Preview</div>
                      <div className="col12 align-top-center">
                          <DataInputs oData={props.oFormItems[activeItem]} oChange='' oEditable={true} />
                      </div>
                    </div>
                
              </>
            )}
          </div>
          <div className="flex h-[100px] items-center justify-center w-full">
              <button className="standard" style={{bottom:'25'}} onClick={handleViewSidebar}>Save & Close</button>
          </div>
        </div>
      </SideBar>
      <DndContext sensors={sensors} modifiers={[restrictToWindowEdges]} onDragEnd={handleDragEnd}>
        {props.oActiveForm >= 0 && (
          <div className="col12 component-layout-columns section-layout" style={{ '--gridColumns': '30% 1fr', marginTop:'25px' } as React.CSSProperties} >
            <div className="col12 component-layout-rows" style={{ '--gridRows': '200px 1fr' } as React.CSSProperties} >
              <div>
                <h3>Form Details</h3>
                <div className='align-top-center'>
                  <Input oKey='Name' oType='text' oLabel='Name' oSize='col12' isRequired={true} isEditable={props.oIsEditMode} oChange={(e) => handleDataInputChange(e, props.oSetFormData, props.oActiveForm)} oData={props.oForms[props.oActiveForm].Name} />
                  <Input oKey='Description' oType='text' oLabel='Description' oSize='col12' isRequired={true} isEditable={props.oIsEditMode} oChange={(e) => handleDataInputChange(e, props.oSetFormData, props.oActiveForm)} oData={props.oForms[props.oActiveForm].Description} />
                </div>
              </div>
              <div>
                <SearchBar
                  oSearchedValue={searchedValue}
                  oSetSearchedValue={setSearchedValue}
                />
                {props.oItems.filter(( row:any ) => row.Name.toString().toLowerCase().includes(searchedValue.toString().toLowerCase())).map(( item:any ) => (
                  <DraggableListItem oKey={item.id} oName={item.Name} oType={item.Type} oActive={props.oIsEditMode} />
                ))}
              </div>
            </div>
            <div className="col12 component-layout-rows" style={{ '--gridRows': '75px 1fr' } as React.CSSProperties} >
              <div className="align-top-center">
                <div className=" col12 align-top-center">
                  {props.oIsEditMode ? (
                      <>
                        {props.oNewForm ? (
                            <div className="col11 align-center-right">
                            <button className="small" onClick={() => {cancelNew()}}>Cancel</button>
                            <button className="small" onClick={() => {saveNew()}}>Add</button>
                            </div>
                        ) : (
                            <div className="col11 align-center-right">
                            <button className="small" onClick={() => {cancelEdit()}}>Cancel</button>
                            <button className="small" onClick={() => {saveEdit()}}>Update</button>
                            </div>
                        )}
                      </>
                  ) : (
                      <>
                        {props.oActiveForm >= 0 && (
                            <div className="col11 align-center-right">
                            <button className="standard" onClick={() => {enableEdit()}}>Edit Form</button>
                            </div>
                        )}
                      </>
                  )}
                  </div>  
                </div>
              <ZackbotEditor oItems={props.oFormItems} oSetItems={props.oSetFormItemData} oIsEditable={props.oIsEditMode} oClick={props.oSetFormItemData} oSetActive={setActiveItem} oOpenSidePanel={handleViewSidebar} />
            </div>
          </div>
        )}
      </DndContext>
    </>
  );
};

