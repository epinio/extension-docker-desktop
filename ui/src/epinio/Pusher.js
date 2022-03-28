import React from "react";
import { Box, Button, Grid, Input } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';

export function Pusher(props) {
  const [folder, setFolder] = React.useState("");
  const [name, setName] = React.useState("test");
  const [progress, setProgress] = React.useState(null);

  const drag = (ev) => {
    setFolder(ev.dataTransfer.files[0].path);
  };

  const epinio = async (args) => {
    try {
      setProgress(true);
      var result = await window.ddClient.extension.host.cli.exec("epinio", args);
      setProgress(null);
      return result;
    } catch (error) {
      setProgress(null);
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
  };

  const send = async (ev) => {
    // TODO remove debug
    props.onPushed("debug");

    if (folder !== "" && name !== "") {
      console.log(folder);
      await epinio([
        "settings", "update",
      ]);
      const result = epinio([
        "apps", "push",
        "-n", name,
        "-p", folder
      ]);
      console.log(result.stderr);
      // TODO display errors for pushing
      props.onPushed(name);
    }
  };

  const spinner = progress ? <CircularProgress /> : null;
  return (
    <Grid container m={2}>
      <Grid item xs={4}>
        <label htmlFor="contained-input-name">
          <Input value={name} onChange={e => setName(e.target.value)} />
          <p>Name</p>
        </label>
      </Grid>

      <Grid item xs={5}>
        <Input onDrop={drag} value={folder} disabled={props.disabled} />
        <p>Drag 'n' drop a folder here</p>
      </Grid>

      <Grid item xs={1}>
        <Box sx={{display: 'flex'}}>
          {spinner}
        </Box>
      </Grid>
      <Grid item xs={2}>
        <label htmlFor="contained-button-file">
          <Button variant="outlined" startIcon={<SendIcon />} onClick={send} disabled={props.disabled}>Upload</Button>
        </label>
      </Grid>

      <Grid item xs={12}>
        {props.list}
      </Grid>
    </Grid>
  )
}

export default Pusher;
