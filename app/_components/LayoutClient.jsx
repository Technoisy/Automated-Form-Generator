'use client';

import { Toaster } from 'react-hot-toast';
import Header from './Header';

export default function LayoutClient({ children }) {
  return (
    <>
      <Header />
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </>
  );
}
