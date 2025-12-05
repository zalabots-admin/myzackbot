

import React from "react";

interface ButtonProps {
  oAction?: any;
  oTitle?: string;
  oIcon?: string;
  oText?: string;
}

export const IconButtonLarge: React.FC<ButtonProps> = ({ oAction, oTitle, oIcon }) => {
  
    const oClass = "border border-[#808080] hover:border-[#D58936] text-[#005566] hover:text-[#D58936] mb-4 rounded-full p-2 w-18 h-18 flex items-center justify-center cursor-pointer bg-white";
    
    return (
        <div className={oClass} onClick={oAction} title={oTitle} >
            <i className={"fa-sharp fa-thin " + oIcon + " text-3xl m-4 cursor-pointer hover:text-[#D58936]"}></i>
        </div>
    );

};


export const IconButtonMedium: React.FC<ButtonProps> = ({ oAction, oTitle, oIcon }) => {
  
    const oClass = "border border-[#808080] hover:border-[#D58936] text-[#005566] hover:text-[#D58936] m-2 rounded-full p-2 w-12 h-12 flex items-center justify-center cursor-pointer bg-white";
    
    return (
        <div className={oClass} onClick={oAction} title={oTitle} >
            <i className={ oIcon + " text-xl m-4 cursor-pointer hover:text-[#D58936]"}></i>
        </div>
    );

};

export const SmallButton: React.FC<ButtonProps> = ({ oAction, oText }) => {
  
    const oClass = "flex items-center justify-center border border-[#4E6E5D] rounded-[20px] text-[#4E6E5D] h-[40px] w-[135px] mx-[5px] hover:border-[#D58936] hover:text-[#D58936] cursor-pointer";

    return (
        <div className={oClass} onClick={oAction} >
            <p>{oText}</p>
        </div>
    ); 

};

export const StandardButton: React.FC<ButtonProps> = ({ oAction, oText }) => {
  
    const oClass = "flex items-center justify-center border border-[#4E6E5D] rounded-[20px] text-[#4E6E5D] h-[40px] w-[215px] mx-[5px] hover:border-[#D58936] hover:text-[#D58936] cursor-pointer";

    return (
        <div className={oClass} onClick={oAction} >
            <p>{oText}</p>
        </div>
    ); 

};
