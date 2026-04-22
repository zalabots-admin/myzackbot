

import Document from "./Document";
import KyleBotImage from '../../images/KBT_Logo_Default.png';

interface Prop {
    oData: any;
    oChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    oUpdate: any;
    oValueChange: any;
    oEditable: boolean;
    oSecondaryColor?: string;
}

function Table ( props:Prop ) {

  if ( typeof props.oData.Value === 'string' ) {
    props.oData.Value = JSON.parse(props.oData.Value);
  }

  function handleAddRow( oIndex:number ) {

    if ( props.oEditable === false ) return;

    const columnCount = props.oData.Options.split(',').length;
    const newRow: Record<string, string> = {};
    for (let i = 0; i < columnCount; i++) {
      newRow[props.oData.Options.split(',')[i].replace(/\s+/g, '')] = '';
    }
    props.oUpdate( oIndex, newRow );
    
  };

  function handleDeleteRow( rowIndex:number ) {

    if ( props.oEditable === false ) return;

    const updatedTableData = [...props.oData.Value];
    updatedTableData.splice(rowIndex, 1);
    props.oValueChange( props.oData.id, updatedTableData );

  }

  function handleInputChange( event: React.ChangeEvent<HTMLInputElement>, rowIndex: number, colName: string ) {

    const updatedValue = event.target.value;
    const updatedTableData = [...props.oData.Value];
    updatedTableData[rowIndex] = {
      ...updatedTableData[rowIndex],
      [colName.replace(/\s+/g, '')]: updatedValue
    };
    props.oValueChange( props.oData.id, updatedTableData );

  };

  const handleDocumentUpload = ( event: React.ChangeEvent<HTMLInputElement> ) => {
    // Handle document upload logic here
  };

  return (

    <div className={"flex flex-col w-full"}>
      <div className="flex flex-row w-full mb-2">
        <div className="flex flex-col w-1/3 justify-center items-start">
          <div className="font-bold">{props.oData.Label}</div>
          <div className="text-sm text-gray-500 ml-2">{props.oData.Description}</div>
        </div>
        <div className="flex flex-col w-2/3 justify-center items-start text-sm text-gray-500">
          <div>Upload your CSV/Excel data in any format & let <span className="text-[#829E2E]">KYLE<span className="font-bold">BOT</span></span> extract the needed information</div>
          <div className="flex flex-row w-full items-center justify-end">
            <img src={KyleBotImage} alt="KyleBot Logo" className="max-h-12"/>
            <Document isEditable={props.oEditable} oSize="col12" oData={{}} oChange={handleDocumentUpload} />
          </div>
        </div>
      </div>
      <div id="tableHeader" className="flex flex-row bg-gray-200 font-bold">
        {props.oData.Options.split(',').map((option: any, index: number) => (
          <div key={index} className="border border-gray-300 px-2 py-1 w-full">{option}</div>
        ))}
        <div className="flex items-center p-2 bg-white cursor-pointer" title="Add Row" onClick={() => handleAddRow(props.oData.id)}>
          <div className="flex items-center p-1 bg-white border rounded-full" style={{ color: props.oSecondaryColor ? props.oSecondaryColor : '#005566' }}>
            <i className="fas fa-plus" style={{ color: props.oSecondaryColor ? props.oSecondaryColor : '#005566' }}></i>
          </div>
        </div>
      </div>
      <div id="tableBody" className="flex flex-col w-full h-64 overflow-y-auto">
        {props.oData.Value && props.oData.Value.length > 0 ? (
          props.oData.Value.map((row: any, rowIndex: number) => (
            <div key={rowIndex} className="flex flex-row w-full">
              {props.oData.Options.split(',').map((option: any, colIndex: number) => (
                <input
                  key={colIndex}
                  readOnly={!props.oEditable}
                  type="text"
                  className="border border-gray-300 px-2 py-1 w-full"
                  value={row[option.replace(/\s+/g, '')] || ''} 
                  onChange={(event) => handleInputChange(event, rowIndex, option)}
                />
              ))}
              <div className="flex items-center p-3">
                <i className={`fas fa-x ${props.oEditable ? 'text-red-500 hover:text-red-700 cursor-pointer' : 'text-gray-300'}`} onClick={() => handleDeleteRow(rowIndex)}></i>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 italic p-4">No data available</div>
        )}
      </div>
    </div>
    
  );
}

export default Table;