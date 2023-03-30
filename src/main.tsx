import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App'
import './index.css'
import Home from './routes/home';
import MultiplayerRoom from './routes/multiplayer-room';
import Play from './routes/play';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [{
      path: "/",
      element: <Home />
    },
    {
      path: "/play",
      element: <Play />,
    },
    {
      path: "/room/:roomId",
      element: <MultiplayerRoom />,
    },
    ]
  },
]);

<RouterProvider router={router} />


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
