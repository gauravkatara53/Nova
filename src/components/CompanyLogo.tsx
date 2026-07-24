"use client";

import { useState } from "react";
import { getCompanyLogo } from "@/utils/getCompanyLogo";

interface CompanyLogoProps {
  logo?: string | null;
  website?: string | null;
  name?: string | null;
  className?: string;
}

export function CompanyLogo({
  logo,
  website,
  name,
  className = "h-7 w-7 object-contain rounded",
}: CompanyLogoProps) {
  const [error, setError] = useState(false);

  const finalLogoUrl = logo || getCompanyLogo(website);

  if (!finalLogoUrl || error) {
    if (name) {
      return (
        <div
          className={`flex items-center justify-center bg-violet-100 text-violet-700 font-semibold uppercase ${className}`}
          style={{ objectFit: 'unset' }}
        >
          {name.charAt(0)}
        </div>
      );
    }
    
    // Generic fallback if no name is provided
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}
        style={{ objectFit: 'unset' }}
      >
        ?
      </div>
    );
  }
  return (
    <img
      src={finalLogoUrl}
      alt={name || "Company Logo"}
      className={className}
      onError={() => setError(true)}
    />
  );
}
