import React from "react";
import Alert from "@mui/material/Alert";

class KubernetesCheck extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: ""};
  }

  componentDidMount() {
    this.check();
    this.timerID = setInterval(
      () => this.check(),
      10000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  setRunning(val, error) {
    this.props.onEnabledChanged(val);
    this.setState({ error: error });
  }

  async check() {
    try {
      const result = await window.ddClient.extension.host.cli.exec("kubectl", ["get", "nodes", "-o", "json"])

      const obj = result.parseJsonObject();
      if (obj.items.length < 1) {
        this.setRunning(false, "no nodes found in cluster")
        return;
      }

    } catch(error) {
      if (error instanceof Error) {
        this.setRunning(false, error.message)
      } else {
        //console.error(JSON.stringify(error));
        this.setRunning(false, error.stderr)
      }
      return;
    }

    this.setRunning(true, "");
  }

  kubernetesOK(props) {
    return (
      <Alert severity="success">
      Kubernetes is running
      </Alert>
    );
  }

  kubernetesMissing(props) {
    return (
      <Alert severity="error">
        You need a Kubernetes cluster to use Epinio. Go to 'Preferences -&gt; Kubernetes' and enable it.<br/> Make sure to select the right Kubernetes context.

        <p>
        {props.error}
        </p>
      </Alert>
    );
  }

  render() {
    if (this.props.running)
      return (
        <div>
          <this.kubernetesOK />
        </div>
      );
    else
      return (
        <div>
          <this.kubernetesMissing error={this.state.error} />
        </div>
      );
  }
}

export default KubernetesCheck;
