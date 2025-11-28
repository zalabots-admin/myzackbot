

import React from "react";

interface SideBarProps {
  isOpen: boolean;
  children?: React.ReactNode;
}

const SideBar: React.FC<SideBarProps> = ({ isOpen, children }) => {
  
  const sidebarClass = isOpen ? "sidebar open" : "sidebar";

  return (
    <div className={sidebarClass}>
      {children}
    </div>
  );
};

export default SideBar;
