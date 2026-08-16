import React from "react";

export function parseCountry(countryStr: string | null) {
  if (!countryStr) return { code: null, name: null };
  if (countryStr.includes('|')) {
    const [code, name] = countryStr.split('|');
    return { code, name };
  }
  // Strip emojis if they exist from previous implementation
  const name = countryStr.replace(/[\uD83C][\uDDE6-\uDDFF]/g, '').trim();
  return { code: null, name };
}

export function CountryWithFlag({ countryStr, showName = true }: { countryStr: string | null, showName?: boolean }) {
  const { code, name } = parseCountry(countryStr);
  
  if (!name) return null;
  
  if (!code) {
    return <span>{name}</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <img 
        src={`https://flagcdn.com/${code.toLowerCase()}.svg`} 
        alt={name} 
        className="w-4 h-3 object-cover rounded-sm shadow-sm shrink-0" 
      />
      {showName && <span>{name}</span>}
    </span>
  );
}
