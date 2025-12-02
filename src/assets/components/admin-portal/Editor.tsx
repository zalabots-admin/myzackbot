

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, } from '@dnd-kit/sortable';
import { SortableFormItem } from '../RequestItems.tsx';

interface Prop {
  oItems: any[];
  oSetItems: (items: any[]) => void;
  oIsEditable: boolean;
  oClick?: any;
  oSetActive?: any;
  oOpenSidePanel?: any;
}

function Editor( props: Prop ) {

      const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });
    
      const style: React.CSSProperties = {
            borderColor: isOver ? '#005566' : '#ccc',
            padding: '12px 12px 200px 12px',
            backgroundColor: isOver ? '#00556640' : '#fafafa',
            border: '2px dashed #ccc',
            borderRadius: '5px',
            width: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'flex-start',
            justifyContent: 'center',
            gap: '8px',
      };
    
      return (
        <div className="h-full" ref={setNodeRef} style={style}>
          <SortableContext items={props.oItems.map( (item ) => item.id)} strategy={rectSortingStrategy}>
            {props.oItems.filter((item) => !item.deleted).map((item, index) => (
              <SortableFormItem oKey={item.id} oName={item.Name} oActive={props.oIsEditable} oClick={props.oClick} oSetActive={props.oSetActive} oOpenSidePanel={props.oOpenSidePanel} oActiveItem={index} oList={props.oItems} />
            ))}
          </SortableContext>
        </div>
      );

}
export default Editor;