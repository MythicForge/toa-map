import { Routes, Route, Navigate } from 'react-router-dom';
import { AppStateProvider } from './hooks/useAppState';
import GMView from './views/GMView';
import PlayerView from './views/PlayerView';

export default function App() {
  return (
    <AppStateProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/gm" replace />} />
        <Route path="/gm" element={<GMView />} />
        <Route path="/player" element={<PlayerView />} />
      </Routes>
    </AppStateProvider>
  );
}
