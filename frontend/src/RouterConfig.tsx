import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { App } from './App';

export const RouterConfig: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
      </Routes>
    </BrowserRouter>
  );
};
