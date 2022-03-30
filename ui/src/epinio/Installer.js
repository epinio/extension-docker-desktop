import React from "react";
import {Alert, Box, Button, Card, CardActions, CardContent, LinearProgress, Typography} from "@mui/material";

class EpinioInstaller extends React.Component {
  constructor(props) {
    super(props);
    this.state = {progress: 0};
    this.install = this.install.bind(this);
  }

  async helm(args) {
    try {
      return await window.ddClient.extension.host.cli.exec("helmwrapper", args);
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
    try {
      console.log("installing NGINX chart");
      this.setState({progress: 10});
      let result = await this.helm([
        "upgrade", "--install", "--wait", "ingress-nginx",
        "--create-namespace", "--namespace", "ingress-nginx",
        "ingress-nginx-4.0.18.tgz"
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
        "cert-manager-v1.7.1.tgz"
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
        "--set", "ingress.nginxSSLRedirect=false",
        "epinio-0.7.3.tgz"
      ]);
      console.debug(JSON.stringify(result));
      console.log(result.stdout);
      console.log("installed: epinio");
      this.setState({progress: 100});
      this.props.onInstallationChanged(true);

    } catch (error) {
      this.props.onInstallationChanged(false);
      this.props.onError(error.message);
      return;
    }

  }

  render() {
    // TODO install is idempotent, but maybe also detect working installation?
    const progress = this.state.progress === 100 || this.state.progress === 0 ? null : <LinearProgress variant="determinate" value={this.state.progress} />;
    const disabled = !this.props.enabled;
    return (
      <Card sx={{ height: '140px' }}>
        <CardContent>
          <Typography>
            Install Epinio in Kubernetes
          </Typography>
        </CardContent>
        <CardActions>
          <Button onClick={this.install} disabled={disabled}>
            Install
          </Button>
        </CardActions>
        <Box sx={{ width: '100%' }}>
          {progress}
        </Box>
      </Card>
    );
  }
}

export default EpinioInstaller;
