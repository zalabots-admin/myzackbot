

import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          width: '100%',
          padding: '0.5rem 0',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        <div className='col11 align-center-left'><h3>{title}</h3></div>
        <span style={{ marginRight: '0.5rem' }}>
          {isOpen ? <i className={"fa-sharp fa-thin fa-angle-up text-xl m-4 cursor-pointer hover:text-[#D58936]"}></i> : <i className={"fa-sharp fa-thin fa-angle-down text-xl m-4 cursor-pointer hover:text-[#D58936]"}></i>}
        </span>
        
      </button>
      <div
        style={{
          maxHeight: isOpen ? '1000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div style={{ padding: isOpen ? '0.5rem 0' : '0' }}>{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleSection;