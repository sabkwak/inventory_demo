import { Shapes } from "lucide-react";
import Image from "next/image";
import React from "react";

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2">
      <Image 
        src="/project_85_logo-512x512.svg" 
        alt="Logo" 
        width={64}
        height={48}
        className="h-12 w-16"
      />
      <p className="text-3xl font-bold leading-tight tracking-tighter text-blue-600">
        
      </p>
    </a>
  );
}

export function LogoMobile() {
  return (
    <a href="/" className="flex items-center gap-2">
      <p className="text-3xl font-bold leading-tight tracking-tighter text-blue-600">
        
      </p>
    </a>
  );
}

export default Logo;