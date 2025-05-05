import { Routes, Route } from 'react-router-dom';
import Claims from './Claims';
import ClaimDetail from './ClaimDetail';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Claims />} />
      <Route path="/claims/:" element={<ClaimDetail />} />
    </Routes>
  );
}

export default AppRoutes;
