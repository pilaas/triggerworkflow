import React, { Component, FormEvent } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import { WithStyles } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/Info";
import CloseIcon from "@material-ui/icons/Close";
import Container from "@material-ui/core/Container";

import Repository from "./Repository";

interface RepositoryType {
  id: string;
  name: string;
  organisation: string;
  vcsType: string;
}

const styles = (theme: Theme) =>
  createStyles({
    "@global": {
      body: {
        backgroundColor: theme.palette.common.white
      }
    },
    header: {
      marginBottom: theme.spacing(6),
      position: "relative"
    },
    paper: {
      marginTop: theme.spacing(4),
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    form: {
      width: "100%", // Fix IE 11 issue.
      marginTop: theme.spacing(1)
    },
    submit: {
      margin: theme.spacing(3, 0, 2)
    },
    rememberMe: {
      marginLeft: 0,
      marginRight: 0
    },
    errorPopup: {
      backgroundColor: theme.palette.error.dark
    },
    errorPopupIcon: {
      fontSize: 20
    },
    errorPopupIconVariant: {
      opacity: 0.9,
      marginRight: theme.spacing(1)
    },
    errorMessage: {
      display: "flex",
      alignItems: "center"
    },
    logoutButton: {
      position: "absolute",
      marginLeft: "20px"
    }
  });

interface Props extends WithStyles<typeof styles> {}
interface State {
  repositories?: {
    id: string;
    name: string;
    organisation: string;
    vcsType: string;
  }[];
  error?: string;
  showError: boolean;
  rememberMe: boolean;
  token?: string;
  fetchingRepositories: boolean;
}

interface FormElements extends HTMLFormControlsCollection {
  token: HTMLInputElement;
}

const repositoriesStyles = (theme: Theme) =>
  createStyles({
    root: {
      width: "100%"
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: "70%",
      flexShrink: 0
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary
    },
    panelDetails: {
      flexDirection: "column"
    },
    triggerButtonWrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    },
    parametersGroup: {
      marginBottom: theme.spacing(1),
      padding: theme.spacing(1),
      border: `1px solid ${theme.palette.grey[200]}`,
      borderRadius: 2
    }
  });

interface TriggerFormElements extends HTMLFormControlsCollection {
  revision: HTMLInputElement;
  tag: HTMLInputElement;
  branch: HTMLInputElement;
}

interface RepositoriesProps extends WithStyles<typeof repositoriesStyles> {
  repositories: RepositoryType[];
  token: string;
  onClose: () => void;
}

interface RepositoriesState {
  expandedRepositoryId: string | undefined;
}

const triggerWorkflow = function(
  vcsType: string,
  organisation: string,
  name: string,
  token: string,
  queryString: string
): [() => void, Promise<void>] {
  let canceled = false;
  let cancel = () => {
    console.log("canceled called");
    canceled = true;
  };

  const generator = function*() {
    yield fetch(
      `https://circleci.com/api/v1.1/project/${vcsType}/${organisation}/${name}/build?circle-token=${token}&=${queryString}`,
      {
        method: "POST",
        mode: "no-cors"
      }
    );

    performance.mark("A");

    const array = new Array(1024 * 10000).fill(0).map((item, index) => true);

    performance.mark("B");

    performance.measure("C", "A", "B");

    let tries = 5;

    while (tries > 0) {
      const builds = yield fetch(
        `https://circleci.com/api/v1.1/project/${vcsType}/${organisation}/${name}?circle-token=${token}&limit=1`
      );

      yield new Promise(resolve => setTimeout(resolve, 1000));

      tries--;
    }
  };

  const promise = new Promise<void>(async (resolve, reject) => {
    const iterator = generator();
    let resumeValue;

    while (true) {
      const next = iterator.next(resumeValue);

      if (next.done) {
        return resolve();
      }

      resumeValue = await next.value;

      if (canceled) {
        return;
      }
    }
  });

  return [cancel, promise];
};

const Repositories = withStyles(repositoriesStyles)(
  class extends Component<RepositoriesProps, RepositoriesState> {
    state: RepositoriesState = {
      expandedRepositoryId: undefined
    };

    cancelHandlers = new Set<() => void>();

    togglePanel = (id: string) => {
      this.setState(({ expandedRepositoryId }) => ({
        expandedRepositoryId: expandedRepositoryId === id ? undefined : id
      }));
    };

    triggerWorkflow = (
      repository: RepositoryType,
      parameters: { branch: string; tag: string; revision: string }
    ) => {
      console.log(repository, parameters);
      return;

      const { token, repositories } = this.props;
      const { expandedRepositoryId } = this.state;

      const { name, vcsType, organisation } = repositories.find(
        repository => repository.id === expandedRepositoryId
      )!;

      const { branch, tag, revision } = parameters;

      const parametersList = [
        {
          type: "branch",
          value: branch
        },
        {
          type: "tag",
          value: tag
        },
        {
          type: "revision",
          value: revision
        }
      ].filter(({ value }) => Boolean(value));

      const queryString = parametersList
        .map(({ type, value }) => `${type}=${value}`)
        .join("&");

      const [cancel, promise] = triggerWorkflow(
        vcsType,
        organisation,
        name,
        token,
        queryString
      );

      setTimeout(() => this.props.onClose(), 2000);

      this.cancelHandlers.add(cancel);

      promise
        .then(() => {
          console.log("done");
        })
        .catch(() => {
          console.log("catch");
        })
        .finally(() => {
          console.log("finally");
          this.cancelHandlers.delete(cancel);
        });
    };

    componentWillUnmount() {
      this.cancelHandlers.forEach(cancel => cancel());
    }

    onParametersSetChose = () => {};

    render() {
      const { repositories, classes } = this.props;
      const { expandedRepositoryId } = this.state;

      return (
        <>
          {repositories.map(({ id, name, organisation, vcsType }) => (
            <Repository
              key={id}
              expanded={expandedRepositoryId === id}
              repository={{ id, name, organisation, vcsType }}
              onToggle={this.togglePanel}
              onTriggerWorkflow={this.triggerWorkflow}
            />
          ))}
        </>
      );
    }
  }
);

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const token = localStorage.getItem("circleci-token");

    this.state = {
      repositories: undefined,
      token: token === null ? undefined : token,
      rememberMe: false,
      fetchingRepositories: false,
      showError: false
    };
  }

  componentDidMount() {
    const { token } = this.state;

    if (token) {
      this.fetchRepositories(token as string);
    }
  }

  fetchRepositories(token: string) {
    this.setState({
      fetchingRepositories: true
    });

    fetch(`https://circleci.com/api/v1.1/projects?circle-token=${token}`)
      .then(async response => {
        if (response.status === 401) {
          this.setState({
            error: "Incorrect access token",
            showError: true,
            token: undefined
          });

          return;
        }

        const data = await response.json();

        this.setState({
          repositories: data.map(
            ({
              vcs_url,
              vcs_type,
              reponame,
              username
            }: {
              vcs_url: string;
              vcs_type: string;
              reponame: string;
              username: string;
            }) => ({
              id: vcs_url,
              vcsType: vcs_type,
              name: reponame,
              organisation: username
            })
          )
        });
      })
      .finally(() => {
        this.setState({
          fetchingRepositories: false
        });
      });
  }

  onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { rememberMe } = this.state;
    const elements: FormElements = e.currentTarget.elements as FormElements;
    const token = elements.token.value;

    if (rememberMe) {
      localStorage.setItem("circleci-token", token);
    }

    this.setState({
      token
    });

    this.fetchRepositories(token);
  };

  toggleRememberMe = () => {
    this.setState(({ rememberMe }) => ({
      rememberMe: !rememberMe
    }));
  };

  onClose = () => {
    this.setState({
      repositories: undefined
    });
  };

  onLogout = () => {
    this.setState({
      repositories: undefined,
      token: undefined
    });

    localStorage.removeItem("circleci-token");
  };

  renderLoader() {
    return <CircularProgress />;
  }

  renderLogout() {
    const { classes } = this.props;

    return (
      <Button
        variant="contained"
        color="secondary"
        size="small"
        className={classes.logoutButton}
        onClick={this.onLogout}
      >
        logout
      </Button>
    );
  }

  onErrorClose = () => {
    this.setState({
      showError: false
    });
  };

  onErrorClosed = () => {
    this.setState({
      error: undefined
    });
  };

  renderError() {
    const { classes } = this.props;

    return (
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
        open={this.state.showError}
        autoHideDuration={6000}
        onClose={this.onErrorClose}
        onExited={this.onErrorClosed}
      >
        <SnackbarContent
          className={classes.errorPopup}
          aria-describedby="client-snackbar"
          message={
            <span id="client-snackbar" className={classes.errorMessage}>
              <InfoIcon
                className={`${classes.errorPopupIcon} ${classes.errorPopupIconVariant}`}
              />
              {this.state.error}
            </span>
          }
          action={[
            <IconButton
              key="close"
              aria-label="close"
              color="inherit"
              onClick={this.onErrorClose}
            >
              <CloseIcon className={classes.errorPopupIcon} />
            </IconButton>
          ]}
        />
      </Snackbar>
    );
  }

  render() {
    const { classes } = this.props;
    const {
      repositories,
      token,
      rememberMe,
      fetchingRepositories
    } = this.state;

    return (
      <>
        <Container component="main" maxWidth="sm">
          <CssBaseline />
          <div className={classes.paper}>
            <Typography component="h1" variant="h5" className={classes.header}>
              Trigger workflow
              {repositories !== undefined && this.renderLogout()}
            </Typography>
            {token === undefined ? (
              <form className={classes.form} onSubmit={this.onSubmit}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="token"
                  label="CircleCI token"
                  name="token"
                  autoFocus
                  autoComplete="off"
                />
                <FormGroup>
                  <FormControlLabel
                    className={classes.rememberMe}
                    control={
                      <Switch
                        size="small"
                        checked={rememberMe}
                        onChange={this.toggleRememberMe}
                      />
                    }
                    label="Keep token in browser"
                  />
                </FormGroup>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                >
                  Continue
                </Button>
              </form>
            ) : null}
            {fetchingRepositories && this.renderLoader()}
            {repositories !== undefined ? (
              <Repositories
                token={token!}
                repositories={repositories}
                onClose={this.onClose}
              />
            ) : null}
          </div>
        </Container>
        {this.renderError()}
      </>
    );
  }
}

export default withStyles(styles)(App);
