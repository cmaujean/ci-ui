import React from 'react';

import Client from '../../lib/client/client';
import * as format from '../../lib/table-formatters';
import muiTheme from '../../muitheme.js';

import {handleError} from '../error-messages';
import {TopButton} from '../top-button';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import grey from '@material-ui/core/colors/grey';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';

const StatusLabel = props => {
  return (
    <Box
      style={{
        marginLeft: '2em',
        borderRight: '1px solid ' + muiTheme.palette.primary.light,
        height: '100%',
      }}>
      <Button
        disabled
        size="small"
        variant="outlined"
        style={{
          marginTop: '1em',
          border: '1px solid ' + props.borderColor,
          color: props.color,
        }}>
        {props.text}
      </Button>
    </Box>
  );
};

class RunGrid extends React.Component {
  state = {run: null};
  client = new Client();
  interval = null;

  refreshRun() {
    this.client.runRunIdGet(this.props.run_id, (err, run, resp) => {
      if (!handleError(err, resp)) {
        this.setState({run: run});
      }
    });
  }

  formatStatus(status) {
    if (status === undefined || status === null) {
      return (
        <StatusLabel
          borderColor={grey[200]}
          color={grey[100]}
          text="Unfinished"
        />
      );
    }

    if (status) {
      return (
        <StatusLabel
          borderColor={green[600]}
          color={green[700]}
          text="Success"
        />
      );
    }

    return (
      <StatusLabel borderColor={red[200]} color={red[100]} text="Failure" />
    );
  }

  componentDidMount() {
    this.refreshRun();
    this.interval = window.setInterval(this.refreshRun.bind(this), 5000);
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
    this.interval = null;
  }

  render() {
    var refURL, refText;

    if (this.state.run && this.state.run.task.pull_request_id) {
      refURL =
        this.state.run.task.parent.github.html_url +
        '/pull/' +
        this.state.run.task.pull_request_id;
      refText = this.state.run.task.pull_request_id;
    }

    if (this.state.run && !this.state.run.started_at) {
      handleError({message: 'Run has not started'}, {});
    }

    return (
      <React.Fragment>
        {this.state.run ? (
          <React.Fragment>
            <Grid item xs={1}>
              <Box style={{height: '100%', paddingLeft: '1em', margin: 'auto'}}>
                <TopButton
                  flavor={
                    <React.Fragment>
                      <Typography variant="subtitle2">
                        Run ID: <b>{this.props.run_id}</b>{' '}
                      </Typography>
                      {refURL && refText ? (
                        <Box style={{height: '100%', margin: 'auto'}}>
                          <Button
                            size="small"
                            href={refURL}
                            variant="contained">
                            PR #{refText}
                          </Button>
                        </Box>
                      ) : (
                        ''
                      )}
                    </React.Fragment>
                  }
                />
              </Box>
            </Grid>
            <Grid item xs={1}>
              {this.formatStatus(this.state.run.status)}
            </Grid>
            <Grid item xs={2}>
              <Box style={{height: '100%', paddingLeft: '1em', margin: 'auto'}}>
                <TopButton
                  flavor={
                    <React.Fragment>
                      <Typography variant="subtitle2">
                        <b>{this.state.run.task.ref.repository.name}</b>
                      </Typography>
                      {this.state.run.task.parent &&
                      this.state.run.task.parent.name !==
                        this.state.run.task.ref.repository.name ? (
                        <Typography>
                          (fork of {this.state.run.task.parent.name})
                        </Typography>
                      ) : (
                        ''
                      )}
                    </React.Fragment>
                  }
                />
              </Box>
            </Grid>
            <Grid item xs={2}>
              <TopButton
                flavor={
                  <Box style={{marginLeft: '3em'}}>
                    <Typography variant="subtitle2">
                      Test: <b>{this.state.run.name}</b>
                    </Typography>
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={2}>
              <TopButton
                flavor={format.ref({value: this.state.run.task.ref})}
              />
            </Grid>
            <Grid item xs={2}>
              <Box
                style={{
                  height: '100%',
                  marginLeft: '3em',
                  marginTop: '0.5em',
                }}>
                {format.history({value: this.state.run})}
              </Box>
            </Grid>
            <Grid item xs={this.props.size - 10} />
          </React.Fragment>
        ) : (
          <Grid item xs={this.props.size} />
        )}
      </React.Fragment>
    );
  }
}

export default RunGrid;
