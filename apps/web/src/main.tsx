import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext.js';
import { NavVisibilityProvider } from './hooks/useNavVisibility.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        {/* AuthProvider inside BrowserRouter so useNavigate works inside the context */}
        <AuthProvider>
          {/* Hidden-page list is fetched once here and shared by the header, footer and
              every card grid, rather than refetched per component on each navigation. */}
          <NavVisibilityProvider>
            <App />
          </NavVisibilityProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
