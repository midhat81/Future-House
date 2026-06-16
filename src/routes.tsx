import BuilderPage from './pages/BuilderPage';
import HomePage from './pages/HomePage';
import DesignFormPage from './pages/DesignFormPage';
import ResultsPage from './pages/ResultsPage';
import GalleryPage from './pages/GalleryPage';
import StyleExplorerPage from './pages/StyleExplorerPage';
import VirtualTourPage from './pages/VirtualTourPage';
import AuthPage from './pages/AuthPage';
import NotFound from './pages/NotFound';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  public?: boolean;
  protected?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />,
    public: true,
  },
  {
    name: 'Auth',
    path: '/auth',
    element: <AuthPage />,
    public: true,
  },
  {
    name: 'Create Design',
    path: '/design',
    element: <DesignFormPage />,
    protected: true,
  },
  {
    name: 'Results',
    path: '/results',
    element: <ResultsPage />,
    protected: true,
  },
  {
    name: 'Gallery',
    path: '/gallery',
    element: <GalleryPage />,
    protected: true,
  },
  {
    name: 'Styles',
    path: '/styles',
    element: <StyleExplorerPage />,
    public: true,
  },
  {
    name: 'Virtual Tour',
    path: '/virtual-tour',
    element: <VirtualTourPage />,
    protected: true,
  },
  {
    name: 'Not Found',
    path: '*',
    element: <NotFound />,
    public: true,
  },

  {
    name: 'Floor Plan Builder',
    path: '/builder',
    element: <BuilderPage />,
    protected: true,
  },
];