// src/components/Navbar.tsx
import React from 'react';
import { Github } from 'lucide-react';
import { Button } from './ui/button';
import { ModeToggle } from './mode-toggle';
import GradientText from './GradientText';

const Navbar: React.FC = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">
            <GradientText>PixelPerfect</GradientText>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <a href="https://github.com/Aditya-en" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;