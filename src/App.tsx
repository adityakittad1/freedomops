import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

const Landing = lazy(() => import('./pages/Landing'));
const Overview = lazy(() => import('./pages/Overview'));
const Assistant = lazy(() => import('./pages/Assistant'));
const Infrastructure = lazy(() => import('./pages/Infrastructure'));
const Diagnostics = lazy(() => import('./pages/Diagnostics'));
const Activity = lazy(() => import('./pages/Activity'));
const Settings = lazy(() => import('./pages/Settings'));
const About = lazy(() => import('./pages/About'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<Landing />} />

          {/* App shell */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Overview />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="infrastructure" element={<Infrastructure />} />
            <Route path="diagnostics" element={<Diagnostics />} />
            <Route path="activity" element={<Activity />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
