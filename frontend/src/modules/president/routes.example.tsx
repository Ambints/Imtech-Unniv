/**
 * Exemple de configuration des routes pour le module Président
 * À intégrer dans votre App.tsx ou routes.tsx principal
 */

import { RouteObject } from 'react-router-dom';
import { PresidentLayout } from './layout/PresidentLayout';
import { 
  DashboardPage, 
  RecrutementsPage, 
  DiplomesPage 
} from './pages';

/**
 * Routes du module Président
 * À ajouter dans votre configuration de routes principale
 */
export const presidentRoutes: RouteObject = {
  path: '/president',
  element: <PresidentLayout />,
  children: [
    {
      index: true,
      element: <DashboardPage />,
    },
    {
      path: 'recrutements',
      element: <RecrutementsPage />,
    },
    {
      path: 'diplomes',
      element: <DiplomesPage />,
    },
    // TODO: Ajouter les autres pages quand elles seront créées
    // {
    //   path: 'investissements',
    //   element: <InvestissementsPage />,
    // },
    // {
    //   path: 'conventions',
    //   element: <ConventionsPage />,
    // },
    // {
    //   path: 'discipline',
    //   element: <DisciplinePage />,
    // },
    // {
    //   path: 'parcours',
    //   element: <ParcoursPage />,
    // },
    // {
    //   path: 'calendrier',
    //   element: <CalendrierPage />,
    // },
    // {
    //   path: 'delegations',
    //   element: <DelegationsPage />,
    // },
  ],
};

/**
 * Exemple d'intégration dans App.tsx:
 * 
 * import { createBrowserRouter, RouterProvider } from 'react-router-dom';
 * import { presidentRoutes } from './modules/president/routes.example';
 * 
 * const router = createBrowserRouter([
 *   {
 *     path: '/',
 *     element: <RootLayout />,
 *     children: [
 *       // ... autres routes
 *       presidentRoutes,
 *     ],
 *   },
 * ]);
 * 
 * function App() {
 *   return <RouterProvider router={router} />;
 * }
 */

// Made with Bob