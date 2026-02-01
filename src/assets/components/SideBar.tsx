


interface RightSidePanelProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  width?: string;
  className?: string;
  isOpen?: boolean;
}

export default function RightSidePanel({
  children,
  width = 'w-1/4',
  className = '',
  isOpen = false,
}: RightSidePanelProps) {

  return (
    <div
      className={`
        absolute
        flex-1
        pt-16
        top-0
        right-0
        h-full
        bg-white
        border-l
        border-t 
        border-gray-300
        transition-all
        duration-300
        ease-in-out
        overflow-hidden
        ${isOpen ? width : 'w-0'}
        ${className}
      `}
    >

      {/* Content */}
      <div className="h-full p-4">
        {children}
      </div>
    </div>
  );
}
