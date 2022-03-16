import React from "react";
import "./App.css";
import KubernetesCheck from "./KubernetesCheck";
import Installer from "./Installer";
import { DockerMuiThemeProvider } from '@docker/docker-mui-theme';
import CssBaseline from '@mui/material/CssBaseline';
import Button from "@mui/material/Button";
import {BottomNavigation, Box, Card, CardActions, CardContent, Grid, Typography} from "@mui/material";

class Opener extends React.Component {
  constructor(props) {
    super(props);
    this.state = {username: "", password: ""};
    this.open = this.open.bind(this);
  }

  componentDidMount() {
    this.getCredentials();
  }

  async getCredentials() {
    try {
      const result = await window.ddClient.extension.host.cli.exec(
        "kubectl",
        ["get", "secret", "-n", "epinio", "default-epinio-user", "-o", "jsonpath='{.data}'"]
      )
      const obj = result.parseJsonObject();
      console.debug(obj);
      this.setState({username: atob(obj.username), password: atob(obj.password)});

    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
      } else {
        console.log(JSON.stringify(error));
      }
      this.setState({username: "", password: ""});
    }
  }

  async open() {
    await this.getCredentials();
    window.ddClient.host.openExternal("https://" + this.props.domain);
  }

  render() {
    const disabled = !this.props.enabled;
    return (
      <Card>
        <CardContent>
          <Typography>
            Open the Epinio UI in a browser.
          </Typography>
          <br/>
          <Typography variant="body2" align="left">
            User: {this.state.username} <br/>
            Password: {this.state.password} <br/>
          </Typography>
        </CardContent>
        <CardActions>
          <Button onClick={this.open} disabled={disabled}>
            Open
          </Button>
        </CardActions>
      </Card>
    );
  }
}


function App() {
  const domain = "localdev.me";
  const uiDomain = "ui.localdev.me";
  const [enabled, setEnabled] = React.useState("");

  return (
    <DockerMuiThemeProvider>
      <CssBaseline />
      <div className="App">

        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle1" component="div" gutterBottom>
            Epinio - From Source To Deployment
          </Typography>
        </Box>

        <Grid container spacing={2}>

          <Grid item>
            <Installer domain={domain} enabled={enabled} />
          </Grid>

          <Grid item>
            <Opener domain={uiDomain} enabled={enabled} key={enabled} />
          </Grid>

        </Grid>

        <br/>

        <BottomNavigation>
          <KubernetesCheck onEnabledChanged={setEnabled} />
        </BottomNavigation>
      </div>
    </DockerMuiThemeProvider>
  );
}

export default App;
