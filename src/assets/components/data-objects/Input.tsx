


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

  const classSize= "input-container " + props.oSize

  return (
      
    <>
      { props.isRequired ? (
        <>
        {props.isEditable ? (
          <div className={classSize}>
            <div><label className="input-label">{props.oLabel}</label><span className='input-label-required'> *</span></div>
            <input key={props.oKey} name={props.oKey} required type={props.oType} value={props.oData} onChange={props.oChange}></input>
            <div className='input-description'>{props.oDescription}</div>
          </div> 
        ) : (
          <div className={classSize}>
            <label className="input-label">{props.oLabel}</label>
            <input key={props.oKey} className="read-only-input" name={props.oKey} readOnly disabled required type={props.oType} value={props.oData} onChange={props.oChange}></input>
            <div className='input-description'>{props.oDescription}</div>
          </div>             
        )}
        </>
      ) : ( 
        <>
        {props.isEditable ? (
          <div className={classSize}>
            <label className="input-label">{props.oLabel}</label>
            <input key={props.oKey} name={props.oKey} type={props.oType} value={props.oData} onChange={props.oChange}></input>
            <div className='input-description'>{props.oDescription}</div>
          </div> 
        ) : (
          <div className={classSize}>
            <label className="input-label">{props.oLabel}</label>
            <input key={props.oKey} name={props.oKey} readOnly disabled type={props.oType} value={props.oData} onChange={props.oChange}></input>
            <div className='input-description'>{props.oDescription}</div>
          </div>
        )}
        </>
      )}
    </>
      
  );
}

export default Input;