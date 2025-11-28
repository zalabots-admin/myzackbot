

import { useDraggable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  oActiveItem?: number;
  oList?: any[];
}

export const ListItem = ( props:ListItem ) => {

  return (
      
    <>
      {(() => {
        switch (props.oType) {
          case 'number':
            return <div key={props.oKey} className={"request-item" + (props.oActive ? ' notSelectable' : '')} onClick={() => {props.oClick(props.oKey)}}><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-hashtag " + (props.oActive ? ' notSelectable' : '')}></i></div><div>{props.oName}</div></div>;
          case 'date':
            return <div key={props.oKey} className={"request-item" + (props.oActive ? ' notSelectable' : '')} onClick={() => {props.oClick(props.oKey)}}><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-calendar-day " + (props.oActive ? ' notSelectable' : '')}></i></div><div>{props.oName}</div></div>;
          case 'radio':
            return <div key={props.oKey} className={"request-item" + (props.oActive ? ' notSelectable' : '')} onClick={() => {props.oClick(props.oKey)}}><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-circle-check " + (props.oActive ? ' notSelectable' : '')}></i></div><div>{props.oName}</div></div>;
          case 'checkbox':
            return <div key={props.oKey} className={"request-item" + (props.oActive ? ' notSelectable' : '')} onClick={() => {props.oClick(props.oKey)}}><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-square-check " + (props.oActive ? ' notSelectable' : '')}></i></div><div>{props.oName}</div></div>;
          case 'select':
            return <div key={props.oKey} className={"request-item" + (props.oActive ? ' notSelectable' : '')} onClick={() => {props.oClick(props.oKey)}}><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-angle-double-down " + (props.oActive ? ' notSelectable' : '')}></i></div><div>{props.oName}</div></div>;
          case 'question':
            return <div key={props.oKey} className={"request-item" + (props.oActive ? ' notSelectable' : '')} onClick={() => {props.oClick(props.oKey)}}><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-angle-double-down " + (props.oActive ? ' notSelectable' : '')}></i></div><div>{props.oName}</div></div>;
          case 'textarea':
            return <div key={props.oKey} className={"request-item" + (props.oActive ? ' notSelectable' : '')} onClick={() => {props.oClick(props.oKey)}}><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-paragraph " + (props.oActive ? ' notSelectable' : '')}></i></div><div>{props.oName}</div></div>;
          case 'file':
            return <div key={props.oKey} className={"request-item" + (props.oActive ? ' notSelectable' : '')} onClick={() => {props.oClick(props.oKey)}}><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-file-lines " + (props.oActive ? ' notSelectable' : '')}></i></div><div>{props.oName}</div></div>;
          case 'form':
            return <div key={props.oKey} className={"request-item" + (props.oActive ? ' notSelectable' : '')} onClick={() => {props.oClick(props.oKey)}}><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-angle-double-down " + (props.oActive ? ' notSelectable' : '')}></i></div><div>{props.oName}</div></div>;
          default:
            return <div key={props.oKey} className={"request-item" + (props.oActive ? ' notSelectable' : '')} onClick={() => {props.oClick(props.oKey)}}><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-font " + (props.oActive ? ' notSelectable' : '')}></i></div><div>{props.oName}</div></div>;
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
    cursor: 'grab',
    transition: 'opacity 0.2s ease',
    zIndex: props.isDragging ? 999 : 'auto',

  };

  return (
  
        <>
      {(() => {
        switch (props.oType) {
          case 'number':
            return <div ref={setNodeRef} className={"request-item" + (props.oActive ? '' : ' notSelectable')} style={style} {...listeners} {...attributes} ><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-hashtag " + (props.oActive ? '' : ' notSelectable')}></i></div><div>{props.oName}</div></div>;
          case 'date':
            return <div ref={setNodeRef} className={"request-item" + (props.oActive ? '' : ' notSelectable')} style={style} {...listeners} {...attributes} ><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-calendar-day " + (props.oActive ? '' : ' notSelectable')}></i></div><div>{props.oName}</div></div>;
          case 'select':
            return <div ref={setNodeRef} className={"request-item" + (props.oActive ? '' : ' notSelectable')} style={style} {...listeners} {...attributes} ><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-angle-double-down " + (props.oActive ? '' : ' notSelectable')}></i></div><div>{props.oName}</div></div>;
          case 'form':
            return <div ref={setNodeRef} className={"request-item" + (props.oActive ? '' : ' notSelectable')} style={style} {...listeners} {...attributes} ><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-file-invoice " + (props.oActive ? '' : ' notSelectable')}></i></div><div>{props.oName}</div></div>;
          case 'file':
            return <div ref={setNodeRef} className={"request-item" + (props.oActive ? '' : ' notSelectable')} style={style} {...listeners} {...attributes} ><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-file-lines " + (props.oActive ? '' : ' notSelectable')}></i></div><div>{props.oName}</div></div>;
            default:
            return <div ref={setNodeRef} className={"request-item" + (props.oActive ? '' : ' notSelectable')} style={style} {...listeners} {...attributes} ><div className='request-item-icon'><i className={"fa-sharp fa-thin fa-font " + (props.oActive ? '' : ' notSelectable')}></i></div><div>{props.oName}</div></div>;
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

    oList?.map((item:any, index:number) => {
      if (item.id === oId) {
        props.oSetActive(index);
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


