

import { FileUploader } from "react-drag-drop-files";
import '../../styles/Task.css'

interface Prop {
    isRequired: boolean;
    isEditable: boolean;
    oSize: string;
    oData: any;
    oChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function Document ( props:Prop ) {

    const classSize= "input-container " + props.oSize
    let dragDrop;
    let documentLink;

    if ( props.isEditable === true ) {
        dragDrop = 
        <div className="flex items-center space-x-4 border border-gray-300 border-dashed rounded p-4 hover:border-gray-500">
          <div className="flex items-center">
            <button className="bg-white text-gray-700 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100">
              Upload
            </button>
          </div>
          <div className="flex items-center">
            {props.oData.UploadText}
          </div>
        </div>

    } else {
        dragDrop = 
          <div className="flex items-center space-x-4 border border-gray-300 border-dashed rounded p-4 hover:border-gray-500">
            <div className="flex items-center">
              <button className="bg-white text-gray-700 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100 notSelectable">
                Upload
              </button>
            </div>
            <div className="flex items-center">
              {props.oData.UploadText}
            </div>
          </div>
        }
    
  /*  if ( props.oData.DocumentId === '' || props.oData.DocumentId === null || props.oData.DocumentId === undefined ) {
        documentLink = <></>
    } else {
        documentLink = <label className='input-label'>View/Download Document: <a href={props.oData.DocumentId} target='_blank'>{props.oData.Label}</a></label>;
    }*/

    const captureDocument = async ( event:any ) => {

        props.oChange(event);
        
    };


    return (
    <>
      { props.isRequired ? (
        <>
        {props.isEditable ? (
          <div className={classSize}>
            <div><label className="input-label">{props.oData.Label}</label><span className='input-label-required'> *</span></div>
            <FileUploader name="file" classes="col12" children={dragDrop} handleChange={captureDocument} />
            <div className='input-description'>{props.oData.Description}</div>
            {documentLink}
          </div> 
        ) : (
          <div className={classSize}>
            <label className="input-label">{props.oData.Label}</label>
            <FileUploader name="file" disabled={true} classes="col12" children={dragDrop} />
            <div className='input-description'>{props.oData.Description}</div>
            {documentLink}
          </div>             
        )}
        </>
      ) : ( 
        <>
        {props.isEditable ? (
          <div className={classSize}>
            <label className="input-label">{props.oData.Label}</label>
            <FileUploader name="file" classes="col12" children={dragDrop} handleChange={captureDocument} />
            <div className='input-description'>{props.oData.Description}</div>
            {documentLink}
          </div> 
        ) : (
          <div className={classSize}>
            <label className="input-label">{props.oData.Label}</label>
            <FileUploader name="file" disabled={true} classes="col12" children={dragDrop} />
            <div className='input-description'>{props.oData.Description}</div>
            {documentLink}
          </div>
        )}
        </>
      )}
    </>
  )

};

export default Document;