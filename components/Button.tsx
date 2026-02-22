
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:brightness-110 shadow-md",
    secondary: "bg-[var(--color-card)] text-[var(--color-text-main)] border border-[var(--color-border)] hover:bg-[var(--color-hover)]",
    danger: "bg-red-100 text-red-600 hover:bg-red-200",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
