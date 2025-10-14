
import React, { useState } from 'react';
// FIX: Use the correct 'sidebar' component with lowercase casing to resolve module ambiguity.
// FIX: Use alias to resolve name collision with Next.js Sidebar component
import { Sidebar } from './components/Sidebar';
import { Composer } from './components/Composer';
import { Queue } from './components/Queue';
import { Analytics } from './components/Analytics';
import type { Page } from './types';
import { Drafts } from './components/Drafts';
import { GoalsProvider } from '@/app/providers/goals';

const App: React.FC = () => {
  // FIX: Re-instated state for page navigation. This was removed previously, but is required for the correct sidebar to function and also fixes type errors in `renderContent`.
  const [currentPage, setCurrentPage] = useState<Page>('composer');

  const renderContent = () => {
    switch (currentPage) {
      case 'composer':
        return <Composer />;
      case 'queue':
        return <Queue />;
      case 'drafts':
        return <Drafts />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Composer />;
    }
  };

  return (
    <GoalsProvider>
      <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
        {/* FIX: Pass required props to the Sidebar component to enable navigation. */}
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">{renderContent()}</main>
      </div>
    </GoalsProvider>
  );
};

export default App;
