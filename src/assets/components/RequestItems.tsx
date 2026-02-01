

import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import "../styles/Main.css"

interface ListItem {
  oName: string;
  oType?: string;
  oKey: number | string;
  oClick?: any;
  oSetActive?: any;
  oOpenSidePanel?: any;
  oActive?: boolean;
  isOverlay?: boolean;
  isDragging?: boolean;
  oActiveItem?: string | number;
  oList?: any[];
  oDescription?: string;
}

export const dataTypes = () => {

  return ( ['Text Field|text','Date Field|date','Number Field|number','Dropdown Menu|select', 'File Upload|file'] );

};
 
export const ListItem = ( props:ListItem ) => {

  return (
      
    <>
      {(() => {
        switch (props.oType) {
          case 'number':
            return <div key={props.oKey} className={`flex items-center p-2 border shadow m-2 rounded-lg ${props.oActiveItem === props.oKey ? `border-[#EB7100] bg-[#EB710020]` : `border-[#005566] bg-[#00556620] hover:border-[#EB7100]`} ${props.oActive ? `opacity-50 cursor-not-allowed`:`cursor-pointer`}`} onClick={props.oActive ? undefined : () => {props.oClick(props.oKey)}}><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 ${props.oActiveItem === props.oKey ? 'bg-[#EB7100]':'bg-[#005566]'}`}><i className="fa-sharp fa-hashtag text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
          case 'date':
            return <div key={props.oKey} className={`flex items-center p-2 border shadow m-2 rounded-lg ${props.oActiveItem === props.oKey ? `border-[#EB7100] bg-[#EB710020]` : `border-[#005566] bg-[#00556620] hover:border-[#EB7100]`} ${props.oActive ? `opacity-50 cursor-not-allowed`:`cursor-pointer`}`} onClick={props.oActive ? undefined : () => {props.oClick(props.oKey)}}><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 ${props.oActiveItem === props.oKey ? 'bg-[#EB7100]':'bg-[#005566]'}`}><i className="fa-sharp fa-calendar-day text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
          case 'radio':
            return <div key={props.oKey} className={`flex items-center p-2 border shadow m-2 rounded-lg ${props.oActiveItem === props.oKey ? `border-[#EB7100] bg-[#EB710020]` : `border-[#005566] bg-[#00556620] hover:border-[#EB7100]`} ${props.oActive ? `opacity-50 cursor-not-allowed`:`cursor-pointer`}`} onClick={props.oActive ? undefined : () => {props.oClick(props.oKey)}}><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 ${props.oActiveItem === props.oKey ? 'bg-[#EB7100]':'bg-[#005566]'}`}><i className="fa-sharp fa-circle-check text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
          case 'checkbox':
            return <div key={props.oKey} className={`flex items-center p-2 border shadow m-2 rounded-lg ${props.oActiveItem === props.oKey ? `border-[#EB7100] bg-[#EB710020]` : `border-[#005566] bg-[#00556620] hover:border-[#EB7100]`} ${props.oActive ? `opacity-50 cursor-not-allowed`:`cursor-pointer`}`} onClick={props.oActive ? undefined : () => {props.oClick(props.oKey)}}><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 ${props.oActiveItem === props.oKey ? 'bg-[#EB7100]':'bg-[#005566]'}`}><i className="fa-sharp fa-square-check text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
          case 'select':
            return <div key={props.oKey} className={`flex items-center p-2 border shadow m-2 rounded-lg ${props.oActiveItem === props.oKey ? `border-[#EB7100] bg-[#EB710020]` : `border-[#005566] bg-[#00556620] hover:border-[#EB7100]`} ${props.oActive ? `opacity-50 cursor-not-allowed`:`cursor-pointer`}`} onClick={props.oActive ? undefined : () => {props.oClick(props.oKey)}}><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 ${props.oActiveItem === props.oKey ? 'bg-[#EB7100]':'bg-[#005566]'}`}><i className="fa-sharp fa-angle-double-down text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
          case 'question':
            return <div key={props.oKey} className={`flex items-center p-2 border shadow m-2 rounded-lg ${props.oActiveItem === props.oKey ? `border-[#EB7100] bg-[#EB710020]` : `border-[#005566] bg-[#00556620] hover:border-[#EB7100]`} ${props.oActive ? `opacity-50 cursor-not-allowed`:`cursor-pointer`}`} onClick={props.oActive ? undefined : () => {props.oClick(props.oKey)}}><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 ${props.oActiveItem === props.oKey ? 'bg-[#EB7100]':'bg-[#005566]'}`}><i className="fa-sharp fa-angle-double-down text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
          case 'textarea':
            return <div key={props.oKey} className={`flex items-center p-2 border shadow m-2 rounded-lg ${props.oActiveItem === props.oKey ? `border-[#EB7100] bg-[#EB710020]` : `border-[#005566] bg-[#00556620] hover:border-[#EB7100]`} ${props.oActive ? `opacity-50 cursor-not-allowed`:`cursor-pointer`}`} onClick={props.oActive ? undefined : () => {props.oClick(props.oKey)}}><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 ${props.oActiveItem === props.oKey ? 'bg-[#EB7100]':'bg-[#005566]'}`}><i className="fa-sharp fa-paragraph text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
          case 'file':
            return <div key={props.oKey} className={`flex items-center p-2 border shadow m-2 rounded-lg ${props.oActiveItem === props.oKey ? `border-[#EB7100] bg-[#EB710020]` : `border-[#005566] bg-[#00556620] hover:border-[#EB7100]`} ${props.oActive ? `opacity-50 cursor-not-allowed`:`cursor-pointer`}`} onClick={props.oActive ? undefined : () => {props.oClick(props.oKey)}}><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 ${props.oActiveItem === props.oKey ? 'bg-[#EB7100]':'bg-[#005566]'}`}><i className="fa-sharp fa-file-lines text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
          case 'form':
            return <div key={props.oKey} className={`flex items-center p-2 border shadow m-2 rounded-lg ${props.oActiveItem === props.oKey ? `border-[#EB7100] bg-[#EB710020]` : `border-[#005566] bg-[#00556620] hover:border-[#EB7100]`} ${props.oActive ? `opacity-50 cursor-not-allowed`:`cursor-pointer`}`} onClick={props.oActive ? undefined : () => {props.oClick(props.oKey)}}><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 ${props.oActiveItem === props.oKey ? 'bg-[#EB7100]':'bg-[#005566]'}`}><i className="fa-sharp fa-file-invoice text-lg text-[#FFFFFF]" ></i></div><div className="flex flex-col justify-center ml-4">{props.oName}<br/><span className="text-xs italic">{props.oDescription}</span></div></div>;
          default:
            return <div key={props.oKey} className={`flex items-center p-2 border shadow m-2 rounded-lg ${props.oActiveItem === props.oKey ? `border-[#EB7100] bg-[#EB710020]` : `border-[#005566] bg-[#00556620] hover:border-[#EB7100]`} ${props.oActive ? `opacity-50 cursor-not-allowed`:`cursor-pointer`}`} onClick={props.oActive ? undefined : () => {props.oClick(props.oKey)}}><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 ${props.oActiveItem === props.oKey ? 'bg-[#EB7100]':'bg-[#005566]'}`}><i className="fa-sharp fa-font text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
        }
      })()}
    </>
      
  );
}


export const DraggableListItem = ( props:ListItem ) => {

  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: props.oKey.toString() });
  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    //cursor: 'grab',
    transition: 'opacity 0.2s ease',
    zIndex: props.isDragging ? 999 : 'auto',
  };

  return (
  
        <>
      {(() => {
        switch (props.oType) {
          case 'number':
            return <div ref={setNodeRef} className={`flex p-2 border shadow m-2 rounded-lg border-gray-300 bg-[#00556620] ${props.oActive ? `cursor-grab hover:border-[#EB7100]`:`opacity-50 cursor-not-allowed`}`} style={style} {...listeners} {...attributes} ><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 bg-[#005566]`}><i className="fa-sharp fa-hashtag text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
          case 'date':
            return <div ref={setNodeRef} className={`flex p-2 border shadow m-2 rounded-lg border-gray-300 bg-[#00556620] ${props.oActive ? `cursor-grab hover:border-[#EB7100]`:`opacity-50 cursor-not-allowed`}`} style={style} {...listeners} {...attributes} ><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 bg-[#005566]`}><i className="fa-sharp fa-calendar text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
          case 'select':
            return <div ref={setNodeRef} className={`flex p-2 border shadow m-2 rounded-lg border-gray-300 bg-[#00556620] ${props.oActive ? `cursor-grab hover:border-[#EB7100]`:`opacity-50 cursor-not-allowed`}`} style={style} {...listeners} {...attributes} ><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 bg-[#005566]`}><i className="fa-sharp fa-angle-double-down text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
          case 'form':
            return <div ref={setNodeRef} className={`flex p-2 border shadow m-2 rounded-lg border-gray-300 bg-[#00556620] ${props.oActive ? `cursor-grab hover:border-[#EB7100]`:`opacity-50 cursor-not-allowed`}`} style={style} {...listeners} {...attributes} ><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 bg-[#005566]`}><i className="fa-sharp fa-file-invoice text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}<br/><span className="text-xs italic">{props.oDescription}</span></div></div>;
          case 'file':
            return <div ref={setNodeRef} className={`flex p-2 border shadow m-2 rounded-lg border-gray-300 bg-[#00556620] ${props.oActive ? `cursor-grab hover:border-[#EB7100]`:`opacity-50 cursor-not-allowed`}`} style={style} {...listeners} {...attributes} ><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 bg-[#005566]`}><i className="fa-sharp fa-file-lines text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
            default:
            return <div ref={setNodeRef} className={`flex p-2 border shadow m-2 rounded-lg border-gray-300 bg-[#00556620] ${props.oActive ? `cursor-grab hover:border-[#EB7100]`:`opacity-50 cursor-not-allowed`}`} style={style} {...listeners} {...attributes} ><div className={`flex justify-center items-center aspect-square rounded-full shadow p-2 bg-[#005566]`}><i className="fa-sharp fa-font text-lg text-[#FFFFFF]"></i></div><div className="flex justify-center items-center ml-4">{props.oName}</div></div>;
        }
      })()}
    </>

  );

};

export const SortableFormItem = ( props:ListItem ) => {

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform } = useSortable({ id: props.oKey.toString() || '' });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    padding: '8px',
    marginBottom: '4px',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '90%',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  function handeleDelete( oKey: any ) {

    if ( oKey.startsWith('T') ) {
      props.oClick((prevItems:any) => prevItems.filter((item:any) => item.id !== oKey));
      props.oSetActive(0);
    } else {
      props.oClick((prevItems:any) =>
        prevItems.map((item:any) =>
          item.id === oKey ? { ...item, deleted: true } : item
        )
      );
    };

  }

  function handeleEdit( oId:any, oList?: any[] ) {

    oList?.map(( item:any ) => {
      if (item.id === oId) {
        props.oSetActive(oId);
        props.oOpenSidePanel(true);
      }
    });
    
  }

  return (
    <div ref={setNodeRef} className={"request-item" + (props.oActive ? '' : ' notSelectable')} style={style}>
      <div className='col10'>{props.oName}</div>
        <button
            onClick={() => handeleEdit(props.oKey, props.oList)}
            style={{
              marginLeft: '8px',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              fontSize: '16px',
            }}
            aria-label={`Edit ${props.oName}`}
          >
            <i className="fa-sharp fa-thin fa-pencil" />
          </button>
        <button
            onClick={() => handeleDelete(props.oKey)}
            style={{
              marginLeft: '8px',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              fontSize: '16px',
            }}
            aria-label={`Delete ${props.oName}`}
          >
            <i className="fa-sharp fa-thin fa-xmark" />
          </button>
      <button ref={setActivatorNodeRef} {...listeners} {...attributes} style={{
          marginLeft: '8px',
          cursor: 'grab',
          background: 'transparent',
          border: 'none',
          fontSize: '16px',
        }}
        aria-label="Drag handle"
      >
        <i className="fa-sharp fa-thin fa-bars" />
      </button>

    </div>
  );
};


