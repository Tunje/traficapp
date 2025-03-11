import "./App.css";
import { HomePage } from "./pages/HomePage";
import { LocationProvider } from "./hooks/useLocation";

function App() {
  return (
    <LocationProvider>
      <HomePage />
    </LocationProvider>
  );
}

export default App;
