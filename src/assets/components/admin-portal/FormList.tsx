

import { useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import  SearchBar from '../SearchBar'
import { ListItem } from '../RequestItems'

interface Prop {
    oUserOrg: string;
    oForms: any;
    oIsEditMode: boolean;
    oSetIsEditMode: any;
    oSetActiveForm: any;
    oSetFormData: (value: any) => void;
    oSetNewForm: (value: boolean) => void;
    oNoForms: boolean;
    oGetFormsItems: any;
    oSetFormItems: (value: any) => void;
    oLoading?: boolean;
}



function FormList ( props:Prop ) {

    const [searchedValue, setSearchedValue] = useState("");
    
    function createNewItem() {

        props.oSetFormData( (prevItems:any) => [...prevItems, { Name: '', Type: 'form', Description: '', OrganizationID: props.oUserOrg }] );
        props.oSetIsEditMode( true );
        props.oSetNewForm( true );
        props.oSetActiveForm( props.oForms.length );
        props.oSetFormItems( [] );

    };


    return (
        <div className="col11 component-layout-rows" style={{ '--gridRows': '75px 75px 1fr' } as React.CSSProperties} >
            <div className='col12 align-bottom-center'>
                <button className={"standard" + (props.oIsEditMode ? ' notSelectable' : '')} onClick={() => {createNewItem()}}>Create New Form</button>
            </div>
            <div className='col12 align-bottom-center'>
                <SearchBar
                    oSearchedValue={searchedValue}
                    oSetSearchedValue={setSearchedValue}
                />
            </div>
            <div key='requestBuilderItems' className="col12 align-top-left flex-column" style={{height:'80%'}}>
                { props.oLoading ? (
                    <div className='col12 align-center-center'>
                        <BeatLoader color = "#D58936" />
                    </div>
                ) : (
                    props.oNoForms ? (
                        <div className='col12 align-center-center'>No Current Forms</div>
                    ) : (
                        <div className="col12 overflow-scroll">
                            {props.oForms.filter((row:any) => row.Name.toString().toLowerCase().includes(searchedValue.toString().toLowerCase())).map((item:any, index:number) => (
                                <ListItem oKey={index} oName={item.Name} oType={item.Type} oClick={props.oGetFormsItems} oActive={props.oIsEditMode} />
                            ))}
                        </div>
                )
                )}
            </div>
        </div>
    )

}

export default FormList;