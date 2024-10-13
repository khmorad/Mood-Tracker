// src/app/layout.tsx
"use client";

import React, { ReactNode } from 'react';
import Navbar from './components/Navbar';
import Background from './components/Background'; // Import the Background component

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
// In src/app/layout.tsx
return (
  <html lang="en">
    <head>
      <title>BPD App</title>
      <meta name="description" content="A BPD app to help manage mental health" />
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body>
      <Background /> {/* Add the background component here */}
      <Navbar />
      <div className="relative z-20">{children}</div> {/* Add z-index to ensure content is above background */}
    </body>
  </html>
);

};

export default Layout;
