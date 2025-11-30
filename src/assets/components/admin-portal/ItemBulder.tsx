

import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource.ts'
import ItemList from './ItemList.tsx'
import ItemDetails from './ItemDetails.tsx'

interface Prop {
  oUserOrg: string;
}

const client = generateClient<Schema>();


function ItemBuilder ( props:Prop ) {

    const [loading, setLoading] = useState( true );
    const [itemData, setItemData] = useState<any[]>( [] );
    const [noItems, setNoItems] = useState( false );
    const [isEditMode, setIsEditMode] = useState( false );
    const [activeItem, setActiveItem] = useState<number>( -1 );
    const [newItem, setNewItem] = useState( false );

    async function getItems() {

        const currentItems: any = await client.models.Items.list({
            limit:500,
            filter: {OrganizationID: { eq: props.oUserOrg }}
        });  

        const sortedItems = currentItems.data.sort((a: any, b: any) => a['Name'].localeCompare(b['Name']));
        setItemData(sortedItems);
        setLoading( false );

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
    
        < div className='col12 align-top-center'>
            <ItemList 
                oUserOrg={props.oUserOrg}
                oIsEditMode={isEditMode}
                oItems={itemData}
                oSetIsEditMode={setIsEditMode}
                oSetActiveItem={setActiveItem}
                oSetItemData={setItemData}
                oSetNewItem={setNewItem}
                oNoItems={noItems}
                oIsLoading={loading}
            />
            <ItemDetails 
                oUserOrg={props.oUserOrg}
                oItemData={itemData}
                oIsEditMode={isEditMode}
                oActiveItem={activeItem}
                oNewItem={newItem}
                oSetIsEditMode={setIsEditMode}
                oSetItemData={setItemData}
                oSetActiveItem={setActiveItem}
                oSetNewItem={setNewItem}
            />
        </div>
    
    );

};

export default ItemBuilder;