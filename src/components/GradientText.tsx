import { ReactNode } from 'react';

export default function GradientText({ children }: { children: ReactNode }) {
  return (
    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#456BBD] via-[#4535A3] to-[#A425AA]">
      {children}
    </span>
  );
}