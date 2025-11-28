

import { useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import  SearchBar from '../SearchBar'
import { ListItem } from '../RequestItems'

interface Prop {
    oUserOrg: string;
    oItems: any;
    oIsEditMode: boolean;
    oSetIsEditMode: any;
    oSetActiveItem: any;
    oSetItemData: (value: any) => void;
    oSetNewItem: (value: boolean) => void;
    oNoItems: boolean;
    oIsLoading?: boolean;
}


function ItemList ( props:Prop ) {

    const [searchedValue, setSearchedValue] = useState("");
    
    
    function createNewItem() {

        props.oSetItemData((prevItems:any) => [...prevItems, { Name: '', Type: 'text', Label: '', Description: '', Options: '', Layout: '', DocumentId: '' }]);
        props.oSetIsEditMode( true );
        props.oSetNewItem( true );
        props.oSetActiveItem( props.oItems.length );

    };


    return (
        <div className="col4 component-layout-rows" style={{ '--gridRows': '75px 75px 1fr' } as React.CSSProperties} >
            <div className='col12 align-bottom-center'>
                <button className={"standard" + (props.oIsEditMode ? ' notSelectable' : '')} onClick={() => {createNewItem()}}>Create New Item</button>
            </div>
            <div className='col12 align-bottom-center'>
                <SearchBar
                    oSearchedValue={searchedValue}
                    oSetSearchedValue={setSearchedValue}
                />
            </div>
            <div key='requestBuilderItems' className="col12 align-top-left flex-column overflow-scroll" style={{height:'450px'}}>
                { props.oIsLoading ? (
                    <div className='col12 align-center-center'>
                        <BeatLoader color = "#D58936" />
                    </div>
                ) : (
                    props.oNoItems ? (
                        <div className='col12 align-center-center'>No Current Items</div>
                    ) : (
                        <div className="col12">
                            {props.oItems.filter((row:any) => row.Name.toString().toLowerCase().includes(searchedValue.toString().toLowerCase())).map((item:any, index:number) => (
                                <ListItem oKey={index} oName={item.Name} oType={item.Type} oClick={props.oSetActiveItem} oActive={props.oIsEditMode} />
                            ))}
                        </div>
                )
                )}
            </div>
        </div>
    )

}

export default ItemList;