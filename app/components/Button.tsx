interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Button = ({
  size = 'md',
  variant = 'primary',
  className = '',
  children,
  disabled = false,
  ...props
}: ButtonProps) => {
  const coreButtonStyles = 'font-medium rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-300 hover:bg-gray-400 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'bg-white border-2 border-blue-400 hover:bg-blue-100 text-gray-900',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  return (
    <button
      className={`${coreButtonStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}