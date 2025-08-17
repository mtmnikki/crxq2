/**
 * SafeText component to prevent XSS attacks
 * Renders text content safely without executing scripts
 */

import React from 'react';

interface SafeTextProps {
  value: string;
  className?: string;
}

/**
 * Renders text content safely by escaping HTML
 */
const SafeText: React.FC<SafeTextProps> = ({ value, className = '' }) => {
  // Simple escaping to prevent XSS
  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: escapeHtml(value) }}
    />
  );
};

export default SafeText;
