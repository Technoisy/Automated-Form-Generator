import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

function Header() {
  return (
    <div className="p-5 border-b shadow-sm flex items-center justify-between">
      <Image
        src="/logo.jpeg"
        alt="Logo"
        width={100}
        height={50}
        className="object-contain"
      />
      <Button className="bg-blue-500 text-white px-4 py-2 rounded-md">
        Dashboard
      </Button>
    </div>
  );
}

export default Header;
