// app/layout.tsx
import React, { ReactNode } from "react";
import Navbar from "./components/Navbar";
import Background from "./components/Background"; // Adjust the import path

interface LayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <title>MSA</title>
        <meta
          name="description"
          content="An app leveraging ai power to help with stabilize mood"
        />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Background />
        <Navbar />
        <div className="relative z-20">{children}</div>
      </body>
    </html>
  );
};

export default RootLayout;
