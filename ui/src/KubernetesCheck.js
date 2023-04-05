import React from 'react'
import Alert from '@mui/material/Alert'

class KubernetesCheck extends React.Component {
  constructor(props) {
    super(props);
    this.state = {node: "", error: ""};
  }

  componentDidMount() {
    this.check();
    this.timerID = setInterval(
      () => this.check(),
      20000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  setRunning(val, node, error) {
    this.props.onEnabledChanged(val);
    this.setState({ node: node, error: error });
  }

  async check() {
    try {
      const result = await window.ddClient.extension.host.cli.exec("kubectl", ["get", "nodes", "-o", "json"])

      const obj = result.parseJsonObject();
      if (obj.items.length < 1) {
        this.setRunning(false, "", "no nodes found in cluster")
        return;
      }

      const node = obj.items[0].metadata.name;
      this.setRunning(true, node, "");

    } catch(error) {
      if (error instanceof Error) {
        this.setRunning(false, "", error.message)
      } else {
        //console.error(JSON.stringify(error));
        this.setRunning(false, "", error.stderr)
      }
    }
  }

  render() {
    if (this.props.running)
      return <KubernetesOK node={this.state.node} />;
    else
      return <KubernetesMissing error={this.state.error} />;
  }
}

function KubernetesOK(props) {
  if (props.node === "docker-desktop")
    return null;
  else
    return <Alert severity="info">
      Kubernetes is running, however you are not connected to a Docker Desktop node.
      The "Install" button might not work with other clusters.
    </Alert>
}

function KubernetesMissing(props) {
  const errmsg = props.error ? <p>{props.error}</p> : null;
  return (
    <Alert severity="error">
      You need a Kubernetes cluster to use Epinio. Go to 'Preferences -&gt; Kubernetes' and enable it. Make sure to select the right Kubernetes context.

      {errmsg}
    </Alert>
  );
}

export default KubernetesCheck;
