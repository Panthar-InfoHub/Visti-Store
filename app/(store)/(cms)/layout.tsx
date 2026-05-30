import React from "react";

const CmsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="prose prose-sm prose-h1:text-center max-w-4xl px-2 md:px-4 py-3 md:py-6 mx-auto ">
      {children}
    </div>
  );
};

export default CmsLayout;
