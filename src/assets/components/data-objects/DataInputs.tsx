

import Input from './Input'
import Select from './Select'
import Document from './Document'

interface Prop {
    oData: any;
    oChange: any;
    oEditable: boolean;
}

function DataInputs ( props:Prop ) {

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