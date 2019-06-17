import React from 'react';

import Client from '../../lib/client/client';

import {handleError} from '../error-messages';
import RepoSearch from '../repo-search';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Snackbar from '@material-ui/core/Snackbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import blueGrey from '@material-ui/core/colors/blueGrey';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import PeopleIcon from '@material-ui/icons/People';

class AddToCI extends React.Component {
  state = {
    scanning: false,
  };

  client = new Client();

  startScan() {
    this.setState({scanning: true});
    this.client.repositoriesScanGet((err, res, resp) => {
      this.setState({scanning: false});
      handleError(err, resp);
    });
  }

  removeFromCI(repository, promise) {
    var [owner, repo] = repository.split('/', 2);
    this.client.repositoriesCiDelOwnerRepoGet(owner, repo, (err, res, resp) => {
      handleError(err, resp);
      promise();
    });
  }

  addToCI(repository, promise) {
    var [owner, repo] = repository.split('/', 2);
    this.client.repositoriesCiAddOwnerRepoGet(owner, repo, (err, res, resp) => {
      handleError(err, resp);
      promise();
    });
  }

  render() {
    return (
      <React.Fragment>
        <List
          style={{
            backgroundColor: blueGrey.A400,
            zIndex: 2,
            position: 'absolute',
            minWidth: '35%',
            maxWidth: '50%',
          }}>
          <ListItem key="tinyci-scanupgradeitem">
            <Box>
              <Typography>Actions:</Typography>
              <Box>
                <Tooltip title="Scan remote repositories">
                  <Button
                    onClick={this.startScan.bind(this)}
                    variant="outlined">
                    {this.state.scanning ? (
                      <MoreHorizIcon />
                    ) : (
                      <CloudUploadIcon />
                    )}
                  </Button>
                </Tooltip>
                <Tooltip title="Upgrade your oauth account to allow repository adding">
                  <Button href="/uisvc/login/upgrade" variant="outlined">
                    <PeopleIcon />
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </ListItem>
          <RepoSearch
            onAdd={(elem, promise) => {
              this.addToCI(elem.name, promise);
            }}
            onRemove={(elem, promise) => {
              this.removeFromCI(elem.name, promise);
            }}
          />
        </List>
        <Snackbar
          anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
          open={this.state.scanning}
          message="Scanning repositories from the remote resource. This can take some time, please be patient."
        />
      </React.Fragment>
    );
  }
}

export default AddToCI;