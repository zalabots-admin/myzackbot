

// components/ToggleSwitch.tsx
import React from 'react';
import Switch from 'react-switch';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  onColor?: string;
  offColor?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  onColor = '#4E6E5D',
  offColor = '#CCCCCC',
}) => {
  return (
    <label className="flex items-center gap-2 mt-4 ml-2 text-sm">
      {label && <div className='w-full'><span>{label}</span></div>}
      <Switch
        onChange={onChange}
        checked={checked}
        onColor={onColor}
        offColor={offColor}
        handleDiameter={20}
        uncheckedIcon={false}
        checkedIcon={false}
        height={24}
        width={48}
      />
    </label>
  );
};

export default ToggleSwitch;