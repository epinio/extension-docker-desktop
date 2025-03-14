import React from 'react'
import Alert from '@mui/material/Alert'

class KubernetesCheck extends React.Component {
  constructor(props) {
    super(props)
    this.state = { node: '', error: '' }
  }

  componentDidMount() {
    this.check()
    this.timerID = setInterval(
      () => this.check(),
      20000
    )
  }

  componentWillUnmount() {
    clearInterval(this.timerID)
  }

  setRunning(val, node, error) {
    this.props.onEnabledChanged(val)
    this.setState({ node, error })
  }

  async check() {
    try {
      const result = await window.ddClient.extension.host.cli.exec('kubectl', ['config', 'current-context'])

      if (result.stderr.length > 0) {
        console.log(result.stderr)
      }
      if (result.stdout.length === 0) {
        this.setRunning(false, '', 'no kube context found')
        return
      }

      const node = result.stdout.trimEnd()
      this.setRunning(true, node, '')
    } catch (error) {
      if (error instanceof Error) {
        this.setRunning(false, '', error.message)
      } else {
        // console.error(JSON.stringify(error));
        this.setRunning(false, '', error.stderr)
      }
    }
  }

  render() {
    if (this.props.running) {
      return <KubernetesOK node={this.state.node} />
    }
    return <KubernetesMissing error={this.state.error} />
  }
}

function KubernetesOK(props) {
  if (props.node.endsWith('-desktop')) {
    return null
  }

  return <Alert severity="info">
    Kubernetes is running, however you are not connected to a Docker Desktop or Rancher Desktop node.
    The &quot;Install&quot; button might not work with other contexts.
  </Alert>
}

function KubernetesMissing(props) {
  const errmsg = props.error ? <p>{props.error}</p> : null
  return (
    <Alert severity="error">
      You need a Kubernetes cluster to use Epinio. Go to &apos;Preferences -&gt; Kubernetes&apos; and enable it. Make sure to select the right Kubernetes context.

      {errmsg}
    </Alert>
  )
}

export default KubernetesCheck
