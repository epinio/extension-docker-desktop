import React from "react";
import "./App.css";
import { DockerMuiThemeProvider } from '@docker/docker-mui-theme';
import CssBaseline from '@mui/material/CssBaseline';
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import {Paper} from "@mui/material";

class Kubernetes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {running: false, context: ""};
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    var state = false
    if (state) {
      this.setState({
        running: true,
        context: "foo",
      });
    } else {
      this.setState({
        running: false,
        context: "",
      });
    }
  }

  kubernetesOK(props) {
    return (
      <Alert severity="success">
      Kubernetes is running, selected context is "{props.context}"
      </Alert>
    )
  }

  kubernetesMissing(props) {
    return (
      <Alert severity="error">
      You need a Kubernetes cluster to use Epinio. Go to 'Settings -&gt; Kubernetes' and enable it.
      </Alert>
    )
  }

  render() {
    if (this.state.running)
      return (
        <div>
          <this.kubernetesOK context={this.state.context} />
        </div>
      );
    else
      return (
        <div>
          <this.kubernetesMissing/>
        </div>
      );
  }
}

function App() {
  const [response, setResponse] = React.useState("");
  const get = async () => {
    const result = await window.ddClient.extension.host.cli.exec("helm", ["-h"], {
      stream: {
        onOutput(data: { stdout: string } | { stderr: string }): void {
          console.error(data.stdout);
        },
        onError(error: any): void {
          console.error(error);
        },
        onClose(exitCode: number): void {
          console.log("onClose with exit code " + exitCode);
        },
      },
    });
    setResponse(JSON.stringify(result));
  };

  return (
    <DockerMuiThemeProvider>
      <CssBaseline />
      <div className="App">
        <Paper>
          <Kubernetes />
        </Paper>
        <Paper>
          <Button variant="contained" onClick={get}>
            Debug
          </Button>
          <pre>{response}</pre>
        </Paper>
      </div>
    </DockerMuiThemeProvider>
  );
}

export default App;
