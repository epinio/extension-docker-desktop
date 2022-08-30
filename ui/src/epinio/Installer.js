import React from "react";
import {Box, Button, Card, CardActions, CardContent, LinearProgress, Typography} from "@mui/material";
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';

class EpinioInstaller extends React.Component {
  constructor(props) {
    super(props);
    this.state = {progress: 0};
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
    try {
      console.log("installing NGINX chart");
      this.setState({progress: 10});
      let result = await this.helm([
        "upgrade", "--install", "--wait", "ingress-nginx",
        "--create-namespace", "--namespace", "ingress-nginx",
        "https://github.com/kubernetes/ingress-nginx/releases/download/helm-chart-4.0.18/ingress-nginx-4.0.18.tgz"
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
        "https://charts.jetstack.io/charts/cert-manager-v1.8.2.tgz"
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
        "https://github.com/epinio/helm-charts/releases/download/epinio-1.1.0/epinio-1.1.0.tgz"
      ]);
      console.debug(JSON.stringify(result));
      console.log(result.stdout);
      console.log("installed: epinio");
      this.setState({progress: 100});
      this.props.onInstallationChanged(true);

    } catch (error) {
      this.props.onInstallationChanged(false);
      var msg = "If the nginx service is stuck in pending state, you might need to restart docker desktop." + <br/> + error.message;
      this.props.onError(msg);
      return;
    }

  }

  render() {
    // TODO install is idempotent, but maybe also detect working installation?
    const progress = this.state.progress === 100 || this.state.progress === 0 ? null : <LinearProgress variant="determinate" value={this.state.progress} />;
    const disabled = !this.props.enabled;
    return (
      <Card sx={{ height: '160px' }}>
        <CardContent>
          <Typography>
            Install Epinio in Kubernetes
          </Typography>
          <br/>
          <Typography variant="body2" align="left">
          The Application Development Engine for Kubernetes.
          Epinio uses build packs to create container images from source code.
          </Typography>
        </CardContent>
        <CardActions>
          <Button startIcon={<InstallDesktopIcon/>} variant="outlined" onClick={this.install} disabled={disabled}>
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
