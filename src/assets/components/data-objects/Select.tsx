

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
          <div><label className="text-sm">{props.oLabel}</label><span className='text-sm text-[#FD6800]'> *</span></div>
          <div className="text-sm text-gray-500 italic">{props.oDescription}</div>
          <select className="w-full border border-gray-300 rounded-sm p-2 mb-2 outline-none bg-white h-8" required name={props.oKey} value={props.oData} onChange={props.oChange} >
              <option value="" disabled hidden>-- Select an Option --</option>
            {props.oOptions.map((item:any) => (
                <option value={item.split('|')[1]}>{item.split('|')[0]}</option>
            ))}
          </select>
        </div> 
      ) : (
        <div className={classSize}>
          <label className="text-sm">{props.oLabel}</label>
          <div className="text-sm text-gray-500 italic">{props.oDescription}</div>
          <select required disabled className="read-only-input" name={props.oKey} value={props.oData} onChange={props.oChange} >
            <option value="" disabled hidden>-- Select an Option --</option>
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
          <label className="text-sm">{props.oLabel}</label>
          <div className="text-sm text-gray-500 italic">{props.oDescription}</div>
          <select className="w-full border border-gray-300 rounded-sm p-2 mb-2 outline-none bg-white h-8" name={props.oKey} value={props.oData} onChange={props.oChange} >
            <option value="" disabled hidden>-- Select an Option --</option>
            {props.oOptions.map((item:any) => (
                <option value={item.split('|')[1]}>{item.split('|')[0]}</option>
            ))}
          </select>
        </div> 
      ) : (
        <div className={classSize}>
          <label className="text-sm">{props.oLabel}</label>
          <div className="text-sm text-gray-500 italic">{props.oDescription}</div>
          <select disabled className="read-only-input" name={props.oKey} value={props.oData} onChange={props.oChange} >
            <option value="" disabled hidden>-- Select an Option --</option>
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