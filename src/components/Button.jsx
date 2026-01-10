/**
 * Enhanced Navigation Button Component
 * 
 * Features:
 * - Smooth scale transformations (1.05x to 1.1x) on hover with 300ms ease-in-out transitions
 * - Vibrant active button styling with glow effects and WCAG AA compliant contrast
 * - Theme-appropriate inactive styling with 30-40% opacity reduction
 * - Performance-optimized CSS transforms for responsive behavior
 * - Maintains original position during scaling to prevent layout shifts
 */
export const NavButton = ({
  children,
  isActive,
  onClick,
  className = "",
  variant = "default",
  disabled = false,
  ariaLabel,
  ariaPressed,
  onKeyDown,
  ...props
}) => {
  const baseClasses = `
    relative px-4 py-2 rounded-lg font-medium text-sm
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-primary-500/50 
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
    overflow-hidden group
  `;

  const variantClasses = {
    default: isActive
      ? `bg-white/10 text-white shadow-sm border border-white/10`
      : `text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5`,

    danger: `text-neutral-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10`,

    mobile: `p-2 aspect-square text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent`,
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e);
    }
    onKeyDown?.(e);
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      {...props}
    >
      {/* Active Indicator Dot */}
      {isActive && variant === 'default' && (
        <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] animate-pulse"></span>
      )}

      <span className={`relative z-10 flex items-center gap-2 ${isActive && variant === 'default' ? 'mb-0.5' : ''}`}>
        {children}
      </span>
    </button>
  );
};

// Primary Button Component
export const PrimaryButton = ({ children, onClick, disabled = false, className = "" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-8 py-4 font-semibold rounded-xl
        transition-all duration-300 ease-in-out transform
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:scale-105 hover:shadow-xl active:scale-95'
        }
        ${className}
      `}
      style={{
        background: disabled
          ? 'var(--dark-gradient-secondary)'
          : 'var(--dark-button-primary-bg)',
        color: disabled
          ? 'var(--dark-text-disabled)'
          : 'var(--dark-text-primary)',
        border: `1px solid ${disabled ? 'var(--dark-border-tertiary)' : 'var(--dark-border-primary)'}`,
        boxShadow: disabled ? 'none' : 'var(--dark-shadow-md)'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.background = 'var(--dark-button-primary-hover)';
          e.target.style.borderColor = 'var(--dark-border-hover)';
          e.target.style.boxShadow = 'var(--dark-shadow-lg)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.background = 'var(--dark-button-primary-bg)';
          e.target.style.borderColor = 'var(--dark-border-primary)';
          e.target.style.boxShadow = 'var(--dark-shadow-md)';
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.target.style.background = 'var(--dark-button-primary-active)';
          e.target.style.boxShadow = 'var(--dark-shadow-sm)';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.target.style.background = 'var(--dark-button-primary-hover)';
          e.target.style.boxShadow = 'var(--dark-shadow-lg)';
        }
      }}
    >
      {children}
    </button>
  );
};



// LinkButton - For text-based buttons
export const LinkButton = ({ children, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`
        underline underline-offset-4
        transition-colors duration-200 ease-in-out
        ${className}
      `}
      style={{
        color: 'var(--dark-text-secondary)'
      }}
      onMouseEnter={(e) => {
        e.target.style.color = 'var(--dark-text-primary)';
      }}
      onMouseLeave={(e) => {
        e.target.style.color = 'var(--dark-text-secondary)';
      }}
    >
      {children}
    </button>
  );
};

// MobileMenuButton - Specialized for mobile navigation toggle
export const MobileMenuButton = ({ isOpen, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`
        md:hidden p-2 rounded-lg
        transition-all duration-200 ease-in-out
        ${className}
      `}
      style={{
        color: 'var(--dark-text-secondary)',
        background: 'transparent'
      }}
      onMouseEnter={(e) => {
        e.target.style.color = 'var(--dark-text-primary)';
        e.target.style.background = 'var(--dark-button-ghost-hover)';
      }}
      onMouseLeave={(e) => {
        e.target.style.color = 'var(--dark-text-secondary)';
        e.target.style.background = 'transparent';
      }}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <span
          className={`block w-5 h-0.5 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1' : ''}`}
          style={{ backgroundColor: 'currentColor' }}
        />
        <span
          className={`block w-5 h-0.5 transition-all duration-300 mt-1 ${isOpen ? 'opacity-0' : ''}`}
          style={{ backgroundColor: 'currentColor' }}
        />
        <span
          className={`block w-5 h-0.5 transition-all duration-300 mt-1 ${isOpen ? '-rotate-45 -translate-y-1' : ''}`}
          style={{ backgroundColor: 'currentColor' }}
        />
      </div>
    </button>
  );
};

// MobileNavItem - For mobile navigation menu items
export const MobileNavItem = ({
  children,
  onClick,
  onKeyDown,
  active = false,
  className = "",
  ariaLabel,
  ariaPressed,
  style = {},
  ...props
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e);
    }
    onKeyDown?.(e);
  };

  // Remove active from props to prevent it from being passed to DOM
  const { active: _, ...domProps } = { active, ...props };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`
        w-full p-3 rounded-lg text-left
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        min-h-[60px] flex items-center
        ${active ? 'scale-[0.98]' : 'hover:scale-[1.02]'}
        ${className}
      `}
      style={{
        background: active
          ? 'var(--dark-button-primary-bg)'
          : 'var(--dark-glass-subtle)',
        color: active
          ? 'var(--dark-text-primary)'
          : 'var(--dark-text-secondary)',
        border: `1px solid ${active ? 'var(--dark-border-primary)' : 'var(--dark-border-subtle)'}`,
        boxShadow: active
          ? 'var(--dark-shadow-md)'
          : 'var(--dark-shadow-sm)',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.target.style.background = 'var(--dark-button-ghost-hover)';
          e.target.style.borderColor = 'var(--dark-border-primary)';
          e.target.style.color = 'var(--dark-text-primary)';
          e.target.style.boxShadow = 'var(--dark-shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.target.style.background = 'var(--dark-glass-subtle)';
          e.target.style.borderColor = 'var(--dark-border-subtle)';
          e.target.style.color = 'var(--dark-text-secondary)';
          e.target.style.boxShadow = 'var(--dark-shadow-sm)';
        }
      }}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      role="button"
      tabIndex={0}
      {...domProps}
    >
      {children}
    </button>
  );
};

export default {
  NavButton,
  PrimaryButton,
  LinkButton,
  MobileMenuButton,
  MobileNavItem,
};
