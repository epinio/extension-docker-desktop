
import React from "react";
import {Alert, Box, Button, Card, CardActions, CardContent, LinearProgress, Typography} from "@mui/material";

class Installer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: null, progress: 0};
    this.install = this.install.bind(this);
  }

  async helm(args) {
    try {
      return await window.ddClient.extension.host.cli.exec("helm", args);
    } catch(error) {
      if (error instanceof Error) {
        console.error(error.message);
        throw error;
      } else {
        console.error(JSON.stringify(error));
        if (error.stderr) {
          throw Error(error.stderr);
        } else {
          throw Error(JSON.stringify(error));
        }
      }
    }
  }

  async install() {
    this.setState({error: null, progress: 0});

    try {
      console.log("installing NGINX chart");
      this.setState({progress: 10});
      let result = await this.helm([
        "upgrade", "--install", "--wait", "ingress-nginx",
        "--create-namespace", "--namespace", "ingress-nginx",
        "plugins/epinio_extension-docker-desktop/ui/ui/charts/ingress-nginx-4.0.18.tgz"
      ]);
      console.debug(JSON.stringify(result));
      console.log(result.stdout);
      // https://github.com/docker/for-mac/issues/4903
      console.log("installed: you might need to restart docker-desktop if localhost:443 doesn't forward to nginx");
      this.setState({progress: 25});

      console.log("installing cert-manager chart");
      this.setState({progress: 30});
      result = await this.helm([
        "upgrade", "--install", "--wait", "cert-manager",
        "--create-namespace", "--namespace", "cert-manager",
        "--set", "installCRDs=true",
        "--set", "extraArgs[0]=--enable-certificate-owner-ref=true",
        "plugins/epinio_extension-docker-desktop/ui/ui/charts/cert-manager-v1.7.1.tgz"
      ]);
      console.debug(JSON.stringify(result));
      console.log(result.stdout);
      console.log("installed: cert-manager");
      this.setState({progress: 50});

      console.log("installing Epinio chart");
      this.setState({progress: 55});
      result = await this.helm([
        "upgrade", "--install", "epinio",
        "--create-namespace", "--namespace", "epinio",
        "--set", "global.domain=" + this.props.domain,
        "--set", "ingress.ingressClassName=nginx",
        "--set", "'ingress.annotations.nginx\\.ingress\\.kubernetes\\.io/ssl-redirect=false" + "'",
        "plugins/epinio_extension-docker-desktop/ui/ui/charts/epinio-0.7.2.tgz"
      ]);
      console.debug(JSON.stringify(result));
      console.log(result.stdout);
      console.log("installed: epinio");
      this.setState({progress: 100});
    } catch (error) {
      this.setState({error: error.message});
      return;
    }

  }

  render() {
    // TODO install is idempotent, but maybe also detect working installation?
    var error = null;
    if (this.state.error != null) {
      error = (
        <Alert severity="error">
          {this.state.error}
        </Alert>
      );
    }
    const disabled = !this.props.enabled;
    return (
      <Card>
        <CardContent>
          <Typography>
            Install Epinio in Kubernetes
          </Typography>

          <Box sx={{ width: '50%' }}>
            {error}
          </Box>
        </CardContent>
        <CardActions>
          <Button onClick={this.install} disabled={disabled}>
            Install
          </Button>
        </CardActions>
        <Box sx={{ width: '100%' }}>
          <LinearProgress variant="determinate" value={this.state.progress} />
        </Box>
      </Card>
    );
  }
}

export default Installer;
