function SearchIcon({ size = 20, strokeWidth = 2 }) {
  return (
    <svg 
        width={size}
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        >
        <circle cx="11" cy="11" r="7.5" />
        <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default SearchIcon;