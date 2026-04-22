

import Input from './Input'
import Select from './Select'
import Document from './Document'
import Table from './Table'

interface Prop {
    oData: any;
    oChange: any;
    oEditable: boolean;
    oUpdate?: any;
    oValueChange?: any;
    oSecondaryColor?: string;
}

function DataInputs ( props:Prop ) {

    if ( typeof props.oData.Value !== 'string' ) {
        props.oData.Value = JSON.stringify(props.oData.Value);
    }

    return (
        <>
            {(() => {
                switch (props.oData.Type) {
                    case 'select':
                        return <Select 
                            oKey={props.oData.id} 
                            oLabel={props.oData.Label}
                            oDescription={props.oData.Description} 
                            oOptions={props.oData.Options?.split(",")} 
                            oSize="col10" 
                            isRequired={false} 
                            isEditable={props.oEditable} 
                            oChange={props.oChange} 
                            oData={props.oData.Value}   
                        />;
                    case 'file':
                        return <Document
                            oSize="col10" 
                            isRequired={false} 
                            isEditable={props.oEditable} 
                            oChange={props.oChange} 
                            oData={props.oData} 
                        />;
                    case 'table':
                        return <Table
                            oData={props.oData} 
                            oChange={props.oChange}
                            oUpdate={props.oUpdate}
                            oValueChange={props.oValueChange}
                            oEditable={props.oEditable}
                            oSecondaryColor={props.oSecondaryColor}
                        />;
                    default:
                        return <Input 
                            oKey={props.oData.Key} 
                            oType={props.oData.Type} 
                            oLabel={props.oData.Label} 
                            oDescription={props.oData.Description} 
                            oSize="col10" 
                            isRequired={false} 
                            isEditable={props.oEditable} 
                            oChange={props.oChange} 
                            oData={props.oData.Value} 
                        />;
                }
            })()}
        </>

    );

};

export default DataInputs;