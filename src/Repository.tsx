import React, { Component, FormEvent, ChangeEvent, createRef } from "react";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import { WithStyles } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import Radio from "@material-ui/core/Radio";
import Link from "@material-ui/core/Link";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { red, green } from "@material-ui/core/colors";
import Grid from "@material-ui/core/Grid";
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import Popover from "@material-ui/core/Popover";
import Box from "@material-ui/core/Box";
import FormHelperText from "@material-ui/core/FormHelperText";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";

import asyncProcess from "./utils/async-process";

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

type ActiveParametersGroupType = "REVISION-BRANCH" | "TAG";

type RepositoryType = {
  id: string;
  name: string;
  organisation: string;
  vcsType: string;
};

type FormDataType = {
  tag: string;
  branch: string;
  revision: string;
};

function* triggerWorkflow(
  repository: RepositoryType,
  token: string,
  data: object
) {
  const response = yield fetch(
    process.env.REACT_APP_PROXY_URL + prepareRequestUrl(repository, token),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );

  if (response.ok) {
    return true;
  }

  const body = yield response.json();

  throw new Error(body.message);
}

function prepareRequestUrl(repository: RepositoryType, token: string) {
  const { vcsType, organisation, name } = repository;

  return `https://circleci.com/api/v1.1/project/${vcsType}/${organisation}/${name}/build?circle-token=${token}`;
}

function prepareRequestPayload(
  formDataType: FormDataType,
  activeParametersGroup: ActiveParametersGroupType
) {
  const { tag, branch, revision } = formDataType;

  if (activeParametersGroup === "REVISION-BRANCH") {
    return {
      branch: branch || undefined,
      revision: revision || undefined
    };
  }

  return { tag };
}

const styles = (theme: Theme) =>
  createStyles({
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
      justifyContent: "flex-end"
    },
    triggerButton: {
      height: "40px"
    },
    parametersGroup: {
      marginBottom: theme.spacing(1),
      padding: theme.spacing(1),
      borderRadius: 2,
      "&:last-child": {
        marginBottom: 0
      }
    },
    curl: {
      fontSize: "0.6em",
      flexGrow: 1,
      marginRight: theme.spacing(1),
      "& input": {
        padding: 0
      }
    },
    curlWrapper: {
      marginBottom: theme.spacing(1),
      display: "flex",
      alignItems: "center"
    },
    curlButton: {
      textTransform: "none",
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      marginTop: theme.spacing(2),
      backgroundColor: theme.palette.grey[200]
    },
    curlInput: {
      position: "absolute",
      opacity: 0,
      zIndex: -1,
      pointerEvents: "none"
    },
    curlIcon: {
      fontSize: 20,
      marginLeft: theme.spacing(1)
    },
    error: {
      color: theme.palette.error.dark,
      border: `1px solid ${theme.palette.error.dark}`,
      borderRadius: 2,
      padding: 4
    },
    iconSmall: {
      fontSize: 20
    },
    description: {
      marginBottom: theme.spacing(4)
    },
    dividerWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      color: theme.palette.grey[400]
    },
    divider: {
      width: "1px",
      flexGrow: 1,
      background: theme.palette.grey[300],
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    },
    actions: {
      marginTop: theme.spacing(4),
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    resourceLink: {
      marginBottom: theme.spacing(1),
      fontSize: 12
    },
    buttonWrapper: {
      position: "relative"
    },
    popover: {
      padding: theme.spacing(1)
    },
    popoverSuccess: {
      color: "white",
      backgroundColor: green[600]
    },
    popoverError: {
      color: "white",
      backgroundColor: red[600],
      "& a": {
        color: "inherit"
      }
    }
  });

interface Props extends WithStyles<typeof styles> {
  expanded: boolean;
  token: string;
  repository: RepositoryType;
  onToggle: (id: PropType<RepositoryType, "id">) => any;
}

interface State extends FormDataType {
  tagError?: string;
  branchRevisionError?: string;
  error?: string;
  pending: boolean;
  clipboardPopoverVisible: boolean;
  triggerPopoverVisible: boolean;
  activeParametersGroup: "REVISION-BRANCH" | "TAG";
}

class Repository extends Component<Props, State> {
  curlInputRef = createRef<HTMLInputElement>();
  curlButtonRef = createRef<HTMLButtonElement>();
  triggerButtonRef = createRef<HTMLButtonElement>();
  cancelRequest?: () => void = undefined;

  state: State = {
    activeParametersGroup: "REVISION-BRANCH",
    tag: "",
    branch: "",
    revision: "",
    pending: false,
    clipboardPopoverVisible: false,
    triggerPopoverVisible: false
  };

  componentWillUnmount() {
    if (this.cancelRequest) {
      this.cancelRequest();
    }
  }

  triggerWorkflow() {
    const { repository, token } = this.props;
    let { tag, branch, revision, activeParametersGroup } = this.state;

    const [promise, cancel] = asyncProcess(
      triggerWorkflow.bind(
        null,
        repository,
        token,
        prepareRequestPayload({ tag, branch, revision }, activeParametersGroup)
      )
    );

    this.cancelRequest = cancel;

    promise
      .catch(error => {
        this.setState({
          error: error.message
        });
      })
      .finally(() => {
        this.cancelRequest = undefined;

        this.setState({
          pending: false,
          triggerPopoverVisible: true
        });
      });
  }

  onTriggerWorkflow = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { tag, branch, revision, activeParametersGroup } = this.state;

    this.setState({
      error: undefined,
      tagError: undefined,
      branchRevisionError: undefined
    });

    if (activeParametersGroup === "TAG" && tag.trim().length === 0) {
      this.setState({
        tagError: "Tag is required"
      });

      return;
    }

    if (
      activeParametersGroup === "REVISION-BRANCH" &&
      branch.trim().length === 0 &&
      revision.trim().length === 0
    ) {
      this.setState({
        branchRevisionError: "Branch and/or revision is required"
      });

      return;
    }

    this.setState({
      pending: true
    });

    this.triggerWorkflow();
  };

  onParametersSetChose = (e: ChangeEvent<HTMLInputElement>) => {
    this.setParametersSet(e.currentTarget.value as PropType<
      State,
      "activeParametersGroup"
    >);
  };

  handleInputChange(inputName: "revision" | "tag" | "branch") {
    return (e: ChangeEvent<HTMLInputElement>) => {
      if (inputName === "revision") {
        this.setState({
          revision: e.currentTarget.value! as string
        });
      }

      if (inputName === "tag") {
        this.setState({
          tag: e.currentTarget.value! as string
        });
      }

      if (inputName === "branch") {
        this.setState({
          branch: e.currentTarget.value! as string
        });
      }
    };
  }

  setParametersSet = (
    parametersSet: PropType<State, "activeParametersGroup">
  ) => {
    this.setState({
      activeParametersGroup: parametersSet
    });
  };

  onCopyCurl() {
    const { repository, token } = this.props;
    const { branch, tag, revision, activeParametersGroup } = this.state;

    return `curl -X POST ${prepareRequestUrl(
      repository,
      token
    )} -H "Content-Type: application/json" -d '${JSON.stringify(
      prepareRequestPayload({ branch, tag, revision }, activeParametersGroup)
    )}'`;
  }

  copyCurlToClipboard = () => {
    if (this.curlInputRef.current) {
      this.curlInputRef.current.select();
      document.execCommand("copy");

      this.setState({
        clipboardPopoverVisible: true
      });
    }
  };

  onClipboardPopoverClose = () => {
    this.setState({
      clipboardPopoverVisible: false
    });
  };

  onTriggerPopoverClose = () => {
    this.setState({
      triggerPopoverVisible: false
    });
  };

  render() {
    const { expanded, onToggle, classes, repository } = this.props;
    const {
      tag,
      branch,
      revision,
      activeParametersGroup,
      error,
      pending,
      clipboardPopoverVisible,
      triggerPopoverVisible,
      tagError,
      branchRevisionError
    } = this.state;
    const { id, organisation, name, vcsType } = repository;

    return (
      <ExpansionPanel expanded={expanded} onChange={() => onToggle(id)}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>{name}</Typography>
          <Typography className={classes.secondaryHeading}>
            {organisation}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          <Grid container>
            <Grid item sm={8}>
              <Typography
                variant="body1"
                gutterBottom
                className={classes.description}
              >
                To trigger workflow, you need to define revision, branch or tag.
                <br />
                Tag can't be used together with revision or branch.
                <br />
              </Typography>
            </Grid>
            <Grid item sm={4}>
              <Box display="flex" alignItems="flex-end" flexDirection="column">
                <Link
                  className={classes.resourceLink}
                  href={`https://${
                    vcsType ? "github.com" : "bitbucket.org"
                  }/${organisation}/${name}`}
                  target="_blank"
                >
                  Go to repository <OpenInNewIcon fontSize="inherit" />
                </Link>
                <Link
                  className={classes.resourceLink}
                  href={`https://circleci.com/${
                    vcsType ? "gh" : "bb"
                  }/${organisation}/${name}`}
                  target="_blank"
                >
                  Go to CircleCI project <OpenInNewIcon fontSize="inherit" />
                </Link>
              </Box>
            </Grid>
          </Grid>
          <form onSubmit={this.onTriggerWorkflow} autoComplete="off">
            <Grid container spacing={1} justify="space-between">
              <Grid item xs={5}>
                <Box justifyContent="center" display="flex">
                  <FormControlLabel
                    control={
                      <Radio
                        name="parameters-set"
                        value="REVISION-BRANCH"
                        checked={activeParametersGroup === "REVISION-BRANCH"}
                        onChange={this.onParametersSetChose}
                      />
                    }
                    label="Revision and/or branch"
                  />
                </Box>
                <TextField
                  InputLabelProps={{
                    shrink: true
                  }}
                  variant="outlined"
                  margin="dense"
                  onChange={this.handleInputChange("branch")}
                  fullWidth
                  id="branch"
                  placeholder="e.g. develop"
                  label="branch"
                  name="branch"
                  disabled={pending}
                  value={branch}
                />
                <TextField
                  variant="outlined"
                  onChange={this.handleInputChange("revision")}
                  margin="dense"
                  InputLabelProps={{
                    shrink: true
                  }}
                  fullWidth
                  id="revision"
                  label="revision"
                  placeholder="e.g. 13c5a2d689eea3803c267a"
                  name="revision"
                  disabled={pending}
                  value={revision}
                />
                <FormHelperText error={true}>
                  {branchRevisionError}
                </FormHelperText>
              </Grid>
              <Grid item xs={2} className={classes.dividerWrapper}>
                <div className={classes.divider}></div>
                <span>or</span>
                <div className={classes.divider}></div>
              </Grid>
              <Grid item xs={5}>
                <Box justifyContent="center" display="flex">
                  <FormControlLabel
                    control={
                      <Radio
                        value="TAG"
                        name="parameters-set"
                        checked={activeParametersGroup === "TAG"}
                        onChange={this.onParametersSetChose}
                      />
                    }
                    label="Tag"
                  />
                </Box>
                <TextField
                  variant="outlined"
                  margin="dense"
                  onChange={this.handleInputChange("tag")}
                  fullWidth
                  id="tag"
                  label="tag"
                  InputLabelProps={{
                    shrink: true
                  }}
                  placeholder="e.g. v1.4.1"
                  name="tag"
                  autoComplete="off"
                  disabled={pending}
                  value={tag}
                />
                <FormHelperText error={true}>{tagError}</FormHelperText>
              </Grid>
            </Grid>
            <div className={classes.actions}>
              <Grid container justify="center">
                <Grid item xs={4}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Popover
                      open={triggerPopoverVisible}
                      anchorEl={this.triggerButtonRef.current}
                      onClose={this.onTriggerPopoverClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center"
                      }}
                      transformOrigin={{
                        vertical: "center",
                        horizontal: "center"
                      }}
                    >
                      {error ? (
                        <Typography
                          className={`${classes.popover} ${classes.popoverError}`}
                          dangerouslySetInnerHTML={{ __html: error || "" }}
                        ></Typography>
                      ) : (
                        <Typography
                          className={`${classes.popover} ${classes.popoverSuccess}`}
                        >
                          Workflow triggered!
                        </Typography>
                      )}
                    </Popover>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      ref={this.triggerButtonRef}
                      fullWidth
                      disabled={pending}
                      className={classes.triggerButton}
                    >
                      {pending ? "Loading..." : "Trigger"}
                    </Button>
                    <Popover
                      open={clipboardPopoverVisible}
                      anchorEl={this.curlButtonRef.current}
                      onClose={this.onClipboardPopoverClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center"
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "center"
                      }}
                    >
                      <Typography className={classes.popover}>
                        cURL copied to clipboard
                      </Typography>
                    </Popover>
                    <Button
                      size="small"
                      type="button"
                      variant="contained"
                      className={classes.curlButton}
                      ref={this.curlButtonRef}
                      onClick={this.copyCurlToClipboard}
                    >
                      cURL
                      <SaveAltIcon className={classes.curlIcon} />
                    </Button>
                    <input
                      placeholder="curl"
                      className={classes.curlInput}
                      value={this.onCopyCurl()}
                      ref={this.curlInputRef}
                      tabIndex={-1}
                      readOnly
                    />
                  </Box>
                </Grid>
              </Grid>
            </div>
          </form>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(Repository);
