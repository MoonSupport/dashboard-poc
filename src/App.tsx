import { QueryClient, QueryClientProvider } from "react-query";
import DashBoardPage from "./components/DashBoardPage";

const queryClient = new QueryClient();

// SPA ROOT
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashBoardPage />
    </QueryClientProvider>
  );
}

export default App;
