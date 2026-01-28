import 'bootstrap/dist/css/bootstrap.min.css'
import Register from './Register'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import Login from './Login'
import VoterDashboard from './VoterDashboard'
import EcLayout from "./EcLayout";
import EcHomePage from "./EcHomePage";
import EcReferendumsPage from "./EcReferendumsPage";
import EcResponsesPage from "./EcResponsesPage";


function RequireEC({ children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || role !== 'ec') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RequireVoter({ children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || role !== 'voter') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {

  return (
    <BrowserRouter>
      <Routes>        
        <Route path='/register' element={<Register/>}></Route>
        <Route path='/' element={<Navigate to="/login" replace />} />
        <Route path='/login' element={<Login />} />
        <Route path='/voterDashboard' element={
            <RequireVoter>
              <VoterDashboard />
            </RequireVoter>
          }
        ></Route>
        <Route
          path="/ec"
          element={
            <RequireEC>
              <EcLayout />
            </RequireEC>
          }>
          <Route index element={<EcHomePage />} />
          <Route path="referendums" element={<EcReferendumsPage />} />
          <Route path="responses" element={<EcResponsesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
