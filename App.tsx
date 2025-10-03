
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Composer } from './components/Composer';
import { Queue } from './components/Queue';
import { Analytics } from './components/Analytics';
import type { Page } from './types';
import { Drafts } from './components/Drafts';

const App: React.FC = () => {
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
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
