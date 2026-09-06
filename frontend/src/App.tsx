import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { MainApp } from './MainApp';

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
