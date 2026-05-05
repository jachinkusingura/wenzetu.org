import React from 'react';

interface IconProps {
  name: 'star' | 'hospital' | 'calendar' | 'phone' | 'mail' | 'map-pin' | 'clock' | 'stethoscope' | 'brain' | 'eye' | 'user' | 'apple' | 'google' | 'facebook' | 'twitter' | 'heart' | 'check' | 'x-mark' | 'navigation' | 'chart-bar' | 'bell' | 'logout';
  className?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, className = '', size = 24 }) => {
  return (
    <img 
      src={`/src/assets/icons/svg/${name}.svg`} 
      alt={name} 
      className={className} 
      style={{ width: size, height: size, display: 'inline-block' }}
    />
  );
};

export default Icon;
