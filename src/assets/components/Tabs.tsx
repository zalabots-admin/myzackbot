

import React from "react";

interface TabProps {
    oAction?: any;
    oIndex?: string | number;
    oText?: string;
    oIsActive?: boolean;
    oState?: boolean;
    children?: React.ReactNode;
    oCustomClass?: string;
}

export const Tab: React.FC<TabProps> = ({ oAction, oIndex, oText, oIsActive, oState, oCustomClass }) => {

    let oClass = "";
    if ( oState || oState === undefined ) {
        oClass = "rounded-t-lg px-4 py-1 cursor-pointer ";
    } else {
        oClass = "hidden ";
    }
    if ( oCustomClass !== undefined ) {
        oClass += oCustomClass;
    }

    return (
        
        <div key={oIndex} className={ oClass + ( oIsActive ? ' border-t border-l border-r border-gray-300 bg-white text-[#005566] font-bold' : ' bg-[#00556620] text-[#4E6E5D] border-b border-gray-300') } onClick={() => oAction(oIndex)}>{oText}</div>
    
    );

};

export const Panel: React.FC<TabProps> = ({ children, oIsActive, oIndex, oState }) => {

    return (

        <div key={oIndex} className={ `flex-1 min-h-0 bg-gray-100 ${ oIsActive  && oState ? ' flex' : ' hidden'}`  }>
            {children}
        </div>

    );

}