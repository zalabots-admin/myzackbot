

import React from "react";

interface ButtonProps {
  oAction?: any;
  oTitle?: string;
  oIcon?: string;
  oText?: string;
  oState?: any;
}

export const IconButtonLarge: React.FC<ButtonProps> = ({ oAction, oTitle, oIcon }) => {
  
    const oClass = "border border-[#808080] hover:border-[#EB7100] text-[#005566] hover:text-[#EB7100] mb-4 rounded-full p-2 w-18 h-18 flex items-center justify-center cursor-pointer bg-white";
    
    return (
        <div className={oClass} onClick={oAction} title={oTitle} >
            <i className={"fa-sharp fa-thin " + oIcon + " text-3xl m-4 cursor-pointer hover:text-[#EB7100]"}></i>
        </div>
    );

};


export const IconButtonMedium: React.FC<ButtonProps> = ({ oAction, oTitle, oIcon }) => {
  
    const oClass = "border border-[#808080] hover:border-[#EB7100] text-[#005566] hover:text-[#EB7100] m-2 rounded-full p-2 w-12 h-12 flex items-center justify-center cursor-pointer bg-white";
    
    return (
        <div className={oClass} onClick={oAction} title={oTitle} >
            <i className={ oIcon + " text-xl m-4 cursor-pointer hover:text-[#EB7100]"}></i>
        </div>
    );

};

export const SmallButton: React.FC<ButtonProps> = ({ oAction, oText }) => {
  
    const oClass = "flex items-center justify-center border border-[#4E6E5D] rounded-[20px] text-[#4E6E5D] h-[40px] w-[135px] mx-[5px] hover:border-[#EB7100] hover:text-[#EB7100] cursor-pointer";

    return (
        <div className={oClass} onClick={oAction} >
            <p>{oText}</p>
        </div>
    ); 

};

export const StandardButton: React.FC<ButtonProps> = ({ oAction, oText }) => {
  
    const oClass = "flex items-center justify-center border border-[#4E6E5D] rounded-[20px] text-[#4E6E5D] h-[40px] w-[215px] mx-[5px] hover:border-[#EB7100] hover:text-[#EB7100] cursor-pointer";

    return (
        <div className={oClass} onClick={oAction} >
            <p>{oText}</p>
        </div>
    ); 

};

export const NavigationButton: React.FC<ButtonProps> = ({ oAction, oTitle, oIcon, oState }) => {

    return (
    
        <div className={`flex items-center hover:cursor-pointer ${ oState[oTitle as keyof typeof oState] ? ' text-[#005566]' : ' text-gray-300 hover:text-[#EB7100]' }` } onClick={oAction} title={oTitle}>
            <i className={ oIcon + " mr-2 text-3xl lg:text-2xl"}></i>
            <p>{oTitle}</p>
        </div>
        
    ); 

};

export const StaticNavigationButton: React.FC<ButtonProps> = ({ oTitle, oIcon }) => {

    return (
    
        <div className={`flex items-center text-[#005566]` } title={oTitle}>
            <i className={ oIcon + " mr-2 text-3xl lg:text-2xl"}></i>
            <p>{oTitle}</p>
        </div>
        
    ); 

};

export const LogOutButton: React.FC<ButtonProps> = ({ oAction, oTitle, oIcon }) => {

    return (
        
        <div className="flex items-center hover:cursor-pointer text-gray-300 hover:text-gray-500" onClick={oAction} title={oTitle}>
            <i className={ oIcon + " mr-2 text-3xl lg:text-2xl" } onClick={oAction} title={oTitle}></i>
            <p>{oTitle}</p>
        </div>
    ); 

};