import React from "react";
import "./App.css";
import { DockerMuiThemeProvider } from '@docker/docker-mui-theme';
import CssBaseline from '@mui/material/CssBaseline';
import Button from "@mui/material/Button";

function App() {
  const [response, setResponse] = React.useState("");
  const get = async () => {
    const result = await window.ddClient.extension.vm.service.get("/hello");
    setResponse(JSON.stringify(result));
  };

  return (
    <DockerMuiThemeProvider>
      <CssBaseline />
      <div className="App">
        <Button variant="contained" onClick={get}>
          Call backend
        </Button>
        <pre>{response}</pre>
      </div>
    </DockerMuiThemeProvider>
  );
}

export default App;
