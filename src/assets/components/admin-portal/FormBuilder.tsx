

import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource.ts'
import FormList from './FormList'
import CopyAndSortDemo from './FormDetails.tsx'

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
    const [activeForm, setActiveForm] = useState<number>(-1);
    const [newForm, setNewForm] = useState(false);

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

    async function getFormsItems( oItem : number ) {

        const currentItems: any = await client.models.FormItems.list({
            limit:500,
            filter: {FormID: { eq: formData[oItem].id }}
        });  

        const sortedItems = currentItems.data.sort((a: any, b: any) => Number(a.Order) - Number(b.Order));

        setFormItemData( sortedItems );
        setActiveForm( oItem );

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
        <div className="col12 component-layout-columns" style={{ '--gridColumns': '30% 1fr' } as React.CSSProperties} >
            <FormList
                oUserOrg={props.oUserOrg}
                oIsEditMode={isEditMode}
                oForms={formData}
                oSetFormItems={setFormItemData}
                oSetIsEditMode={setIsEditMode}
                oSetActiveForm={setActiveForm}
                oSetFormData={setFormData}
                oSetNewForm={setNewForm}
                oNoForms={noForms}
                oGetFormsItems={getFormsItems}
                oLoading={loading}
            />
            <CopyAndSortDemo
                oItems={itemData}
                oForms={formData}
                oFormItems={formItemData}
                oActiveForm={activeForm}
                oIsEditMode={isEditMode}
                oNewForm={newForm}
                oSetIsEditMode={setIsEditMode}
                oSetNewForm={setNewForm}
                oSetFormData={setFormData}
                oSetFormItemData={setFormItemData}
                oSetActiveForm={setActiveForm}
            />
        </div>
    );

}

export default FormBuilder;