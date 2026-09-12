import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ContentProvider } from './context/ContentContext';
import { MainApp } from './MainApp';

export default function App() {
  return (
    <ContentProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </ContentProvider>
  );
}
