

interface Prop {
    oKey: string;
    oLabel: string;
    oDescription?: string;
    oSize: string;
    isRequired: boolean;
    isEditable: boolean;
    oOptions: string[];
    oData: any;
    oChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

function Select ( props:Prop ) {

const classSize ="input-container " + props.oSize

  return (

    <>
    { props.isRequired ? (
      <>
      {props.isEditable ? (
        <div className={classSize}>
          <div><label className="input-label">{props.oLabel}</label><span className='input-label-required'> *</span></div>
          <div className="input-description">{props.oDescription}</div>
          <select required name={props.oKey} value={props.oData} onChange={props.oChange} >
            {props.oOptions.map((item:any) => (
                <option value={item.split('|')[1]}>{item.split('|')[0]}</option>
            ))}
          </select>
        </div> 
      ) : (
        <div className={classSize}>
          <label className="input-label">{props.oLabel}</label>
          <div className="input-description">{props.oDescription}</div>
          <select required disabled className="read-only-input" name={props.oKey} value={props.oData} onChange={props.oChange} >
            {props.oOptions.map((item:any) => (
                <option value={item.split('|')[1]}>{item.split('|')[0]}</option>
            ))}
          </select>
        </div>             
      )}
      </>
    ) : ( 
      <>
      {props.isEditable ? (
        <div className={classSize}>
          <label className="input-label">{props.oLabel}</label>
          <div className="input-description">{props.oDescription}</div>
          <select name={props.oKey} value={props.oData} onChange={props.oChange} >
            {props.oOptions.map((item:any) => (
                <option value={item.split('|')[1]}>{item.split('|')[0]}</option>
            ))}
          </select>
        </div> 
      ) : (
        <div className={classSize}>
          <label className="input-label">{props.oLabel}</label>
          <div className="input-description">{props.oDescription}</div>
          <select disabled className="read-only-input" name={props.oKey} value={props.oData} onChange={props.oChange} >
            {props.oOptions.map((item:any) => (
                <option value={item.split('|')[1]}>{item.split('|')[0]}</option>
            ))}
          </select>
        </div>
      )}
      </>
    )}
  </>

  );

}

export default Select;