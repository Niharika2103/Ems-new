import { HashRouter as Router } from "react-router-dom";
import AppRoutes from "./app/routes";

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
