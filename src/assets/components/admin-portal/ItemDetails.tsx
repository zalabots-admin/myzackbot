

import { useState } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource'
import DataInputs from '../data-objects/DataInputs'
import Input from '../data-objects/Input'
import Select from '../data-objects/Select';
import { handleDataInputChange } from '../../functions/data'

interface Props {
    oUserOrg: string;
    oItemData: any;
    oActiveItem: number;
    oIsEditMode: boolean;
    oNewItem: boolean;
    oSetIsEditMode: (value: boolean) => void;
    oSetItemData: (value: any) => void;
    oSetActiveItem: (value: number) => void;
    oSetNewItem: (value: boolean) => void;
}

const typeSelect = ['Text Field|text','Date Field|date','Number Field|number','Dropdown Menu|select','Document Upload|file'/*'Single Choice Option|radio','Multiple Choice Option|checkbox','Y/N Question|question','Large Text Field|textarea'*/]
const client = generateClient<Schema>();


function ItemDetails ( props:Props ) {

    const [originalItemData, setOriginalItemData] = useState<any[]>([]);

    function cancelEdit() {

        const updatedItems = [ ...props.oItemData ];
        updatedItems[props.oActiveItem] = originalItemData;
        props.oSetItemData( updatedItems );
        props.oSetIsEditMode( false );

    };

    function saveEdit() {

        client.models.Items.update( props.oItemData[props.oActiveItem] );
        props.oSetIsEditMode( false );

    };

    function enableEdit() {

        const currentItem = props.oItemData[props.oActiveItem];
        setOriginalItemData( currentItem );
        props.oSetIsEditMode( true );

    };

    function cancelNew() {

        props.oSetItemData(( prevItems:any ) => {
            const updatedItems = [ ...prevItems ];
            updatedItems.pop();
            return updatedItems;
        });
        props.oSetActiveItem( -1 );
        props.oSetIsEditMode( false );
        props.oSetNewItem( false );

    };

    function saveNew() {

        client.models.Items.create( { ...props.oItemData[props.oActiveItem], OrganizationID: props.oUserOrg } );
        props.oSetIsEditMode( false );
        props.oSetNewItem( false );

    };

    return (
        
        <div className="col8 component-layout-rows" style={{ '--gridRows': '75px 1fr' } as React.CSSProperties} >
            <div className="align-top-center">
                {props.oIsEditMode ? (
                    <>
                        {props.oNewItem ? (
                            <div className="col11 align-bottom-right">
                            <button className="small" onClick={() => {cancelNew()}}>Cancel</button>
                            <button className="small" onClick={() => {saveNew()}}>Add</button>
                            </div>
                        ) : (
                            <div className="col11 align-bottom-right">
                            <button className="small" onClick={() => {cancelEdit()}}>Cancel</button>
                            <button className="small" onClick={() => {saveEdit()}}>Update</button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {props.oActiveItem >= 0 && (
                            <div className="col11 align-bottom-right">
                            <button className="standard" onClick={() => {enableEdit()}}>Edit Item</button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="align-top-center">
                <div className='col11 align-top-center'>
                    {props.oActiveItem >= 0 && (
                        <>
                            <Select oKey='Type' oLabel='Data Type' oOptions={typeSelect}  oSize='col6' isRequired={true} isEditable={props.oIsEditMode} oChange={(e) => handleDataInputChange(e, props.oSetItemData, props.oActiveItem)} oData={props.oItemData[props.oActiveItem].Type} />
                            <Input oKey='Name' oType='text' oLabel='Name' oSize='col6' isRequired={true} isEditable={props.oIsEditMode} oChange={(e) => handleDataInputChange(e, props.oSetItemData, props.oActiveItem)} oData={props.oItemData[props.oActiveItem].Name} />
                            <Input oKey='Label' oType='text' oLabel="Label" oSize="col12" isRequired={true} isEditable={props.oIsEditMode} oChange={(e) => handleDataInputChange(e, props.oSetItemData, props.oActiveItem)} oData={props.oItemData[props.oActiveItem].Label} />
                            <Input oKey='Description' oType='text' oLabel='Description' oSize='col12' isRequired={false} isEditable={props.oIsEditMode} oChange={(e) => handleDataInputChange(e, props.oSetItemData, props.oActiveItem)} oData={props.oItemData[props.oActiveItem].Description} />
                            { props.oItemData[props.oActiveItem].Type === "select" && (
                                <>
                                    <Input oKey='Options' oType='text' oLabel='Enter Options' oSize='col12' oDescription='Seperate each value with a comma. For ex: Option 1,Option 2,Option 3' isRequired={true} isEditable={props.oIsEditMode} oChange={(e) => handleDataInputChange(e, props.oSetItemData, props.oActiveItem)} oData={props.oItemData[props.oActiveItem].Options} />
                                </>
                            )}
                            <div className="col11 align-top-center" style={{marginTop:'25px'}}>
                                <div className='col12'>Item Preview</div>
                                <div className="col11 align-top-center">
                                    {props.oItemData[props.oActiveItem].Type === "file" ? (
                                        <DataInputs oData={{ UploadText:'Drag & Drop or Click to Upload', DocumentLink: '', documentData: '', Label: props.oItemData[props.oActiveItem].Label, Type:'file' }} oChange='' oEditable={true} />
                                    ) : (
                                        <DataInputs oData={props.oItemData[props.oActiveItem]} oChange='' oEditable={true} />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

    );

};

export default ItemDetails;