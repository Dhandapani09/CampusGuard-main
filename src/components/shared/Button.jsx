import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  fullWidth = false, 
  onClick, 
  disabled, 
  type = 'button',
  className = ''
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const widthClass = fullWidth ? 'btn-full' : '';
  const classes = [baseClass, variantClass, sizeClass, widthClass, className].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="btn-icon" size={size === 'sm' ? 16 : 20} />}
      {children && <span className="btn-text">{children}</span>}
    </button>
  );
};

export default Button;