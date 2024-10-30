// src/app/components/NavItem.tsx
//test
import React from 'react';

interface NavItemProps {
  emoji: string;
  title: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ emoji, title, onClick }) => {
  return (
    <div className="relative">
      <button
        className="emoji-button"
        onClick={onClick}
        onMouseEnter={(e) => handleHover(e, true)}
        onMouseLeave={(e) => handleHover(e, false)}
      >
        {emoji}
      </button>
      <span className="nav-title">{title}</span>
    </div>
  );
};

const handleHover = (e: React.MouseEvent<HTMLButtonElement>, isHovered: boolean) => {
  const titleElement = e.currentTarget.nextElementSibling as HTMLElement;
  if (titleElement) {
    titleElement.style.opacity = isHovered ? '1' : '0';
    titleElement.style.transform = isHovered ? 'translateY(-10px)' : 'translateY(0)';
  }
};

export default NavItem;
