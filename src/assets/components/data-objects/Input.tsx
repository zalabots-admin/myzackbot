


interface Prop {
    oKey: string;
    oLabel: string;
    oDescription?: string;
    oSize: string;
    isRequired: boolean;
    isEditable: boolean;
    oType: string;
    oData: any;
    oChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function Input ( props:Prop ) {

  const classSize= "flex flex-col p-1 " + props.oSize

  return (
      
    <>
      { props.isRequired ? (
        <>
        {props.isEditable ? (
          <div className={classSize}>
            <div><label className="text-sm">{props.oLabel}</label><span className="text-sm text-[#FD6800]"> *</span></div>
            <input key={props.oKey} className="w-full border border-gray-300 rounded-sm p-2 outline-none mb-2 bg-white h-8" name={props.oKey} required type={props.oType} value={props.oData} onChange={props.oChange}></input>
            <div className="text-sm text-gray-500 italic">{props.oDescription}</div>
          </div> 
        ) : (
          <div className={classSize}>
            <label className="text-sm">{props.oLabel}</label>
            <input key={props.oKey} className="w-full border border-gray-300 rounded-sm p-2 outline-none mb-2 bg-white h-8" name={props.oKey} readOnly disabled required type={props.oType} value={props.oData} onChange={props.oChange}></input>
            <div className="text-sm text-gray-500 italic">{props.oDescription}</div>
          </div>             
        )}
        </>
      ) : ( 
        <>
        {props.isEditable ? (
          <div className={classSize}>
            <label className="text-sm">{props.oLabel}</label>
            <input key={props.oKey} className="w-full border border-gray-300 rounded-sm p-2 outline-none mb-2 bg-white h-8" name={props.oKey} type={props.oType} value={props.oData} onChange={props.oChange}></input>
            <div className="text-sm text-gray-500 italic">{props.oDescription}</div>
          </div> 
        ) : (
          <div className={classSize}>
            <label className="text-sm">{props.oLabel}</label>
            <input key={props.oKey} className="w-full border border-gray-300 rounded-sm p-2 outline-none mb-2 bg-white h-8" name={props.oKey} readOnly disabled type={props.oType} value={props.oData} onChange={props.oChange}></input>
            <div className="text-sm text-gray-500 italic">{props.oDescription}</div>
          </div>
        )}
        </>
      )}
    </>
      
  );
}

export default Input;