import HomePage from './pages/HomePage';
import DesignFormPage from './pages/DesignFormPage';
import ResultsPage from './pages/ResultsPage';
import GalleryPage from './pages/GalleryPage';
import StyleExplorerPage from './pages/StyleExplorerPage';
import VirtualTourPage from './pages/VirtualTourPage';
import NotFound from './pages/NotFound';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />,
    public: true,
  },
  {
    name: 'Create Design',
    path: '/design',
    element: <DesignFormPage />,
    public: true,
  },
  {
    name: 'Results',
    path: '/results',
    element: <ResultsPage />,
    public: true,
  },
  {
    name: 'Gallery',
    path: '/gallery',
    element: <GalleryPage />,
    public: true,
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
    public: true,
  },
  {
    name: 'Not Found',
    path: '*',
    element: <NotFound />,
    public: true,
  },
];
