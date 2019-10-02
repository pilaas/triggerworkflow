import React, { Component, FormEvent } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import { WithStyles } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import FormGroup from "@material-ui/core/FormGroup";
import Link from "@material-ui/core/Link";
import Box from "@material-ui/core/Box";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/Info";
import CloseIcon from "@material-ui/icons/Close";
import Container from "@material-ui/core/Container";

import Repositories from "./Repositories";
import About from "./About";

const styles = (theme: Theme) =>
  createStyles({
    "@global": {
      body: {
        backgroundColor: theme.palette.common.white
      }
    },
    root: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh"
    },
    spinner: {
      alignSelf: "center"
    },
    footer: {
      padding: theme.spacing(2),
      marginTop: "auto"
    },
    main: {
      flex: "1 1"
    },
    header: {
      marginBottom: theme.spacing(6),
      position: "relative",
      alignSelf: "center"
    },
    paper: {
      marginTop: theme.spacing(4),
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch"
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
  page: "LOGIN" | "REPOSITORIES" | "ABOUT";
  error?: string;
  showError: boolean;
  rememberMe: boolean;
  token?: string;
  fetchingRepositories: boolean;
}

interface FormElements extends HTMLFormControlsCollection {
  token: HTMLInputElement;
}

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const token = localStorage.getItem("circleci-token");

    this.state = {
      page: token ? "REPOSITORIES" : "LOGIN",
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

  onLogout = () => {
    this.setState({
      repositories: undefined,
      token: undefined
    });

    localStorage.removeItem("circleci-token");
  };

  renderLoader() {
    return <CircularProgress className={this.props.classes.spinner} />;
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
              <InfoIcon className={`${classes.errorPopupIcon} ${classes.errorPopupIconVariant}`} />
              {this.state.error}
            </span>
          }
          action={[
            <IconButton key="close" aria-label="close" color="inherit" onClick={this.onErrorClose}>
              <CloseIcon className={classes.errorPopupIcon} />
            </IconButton>
          ]}
        />
      </Snackbar>
    );
  }

  renderAbout() {
    return <About />;
  }

  showAbout = () => {
    this.setState({
      page: "ABOUT"
    });
  };

  render() {
    const { classes } = this.props;
    const { repositories, token, rememberMe, fetchingRepositories, page } = this.state;

    return (
      <div className={classes.root}>
        <Container component="main" maxWidth="md" className={classes.main}>
          <CssBaseline />
          <div className={classes.paper}>
            <Typography component="h1" variant="h5" className={classes.header}>
              Trigger workflow
              {page === "REPOSITORIES" && this.renderLogout()}
            </Typography>
            {page === "LOGIN" ? (
              <Grid container justify="center">
                <Grid item sm={6}>
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
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <FormGroup>
                        <FormControlLabel
                          className={classes.rememberMe}
                          control={<Switch size="small" checked={rememberMe} onChange={this.toggleRememberMe} />}
                          label="Keep token in browser"
                        />
                      </FormGroup>
                      <Link href="https://circleci.com/account/api" target="_blank">
                        Get token <OpenInNewIcon fontSize="inherit" />
                      </Link>
                    </Box>
                    <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
                      Fetch projects
                    </Button>
                  </form>
                </Grid>
              </Grid>
            ) : null}
            {page === "REPOSITORIES"
              ? fetchingRepositories
                ? this.renderLoader()
                : repositories !== undefined && <Repositories token={token!} repositories={repositories} />
              : null}
            {page === "ABOUT" ? this.renderAbout() : null}
          </div>
        </Container>
        {this.renderError()}
        <footer className={classes.footer}>
          <Container maxWidth="sm">
            <Typography variant="body1">
              <a href="#" onClick={this.showAbout}>
                about
              </a>
              <a href="https://twitter.com/MariuszPilarczy" target="_new">
                author
              </a>
            </Typography>
          </Container>
        </footer>
      </div>
    );
  }
}

export default withStyles(styles)(App);
