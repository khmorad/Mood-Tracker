// app/layout.tsx
import React, { ReactNode } from 'react';
import Navbar from './components/Navbar';
import Background from './components/Background'; // Adjust the import path

interface LayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <title>BPD App</title>
        <meta name="description" content="A BPD app to help manage mental health" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Background /> {/* Background component */}
        <Navbar />     {/* Navbar component */}
        <div className="relative z-20">
          {children}
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
