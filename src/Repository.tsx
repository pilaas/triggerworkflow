import React, { Component, FormEvent, ChangeEvent, createRef } from "react";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import { WithStyles } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import Radio from "@material-ui/core/Radio";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Input from "@material-ui/core/Input";
import Icon from "@material-ui/core/Icon";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import GetAppIcon from "@material-ui/icons/GetApp";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

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
      marginBottom: theme.spacing(1.5),
      height: "40px"
    },
    parametersGroup: {
      marginBottom: theme.spacing(1),
      padding: theme.spacing(1),
      // border: `1px solid ${theme.palette.grey[200]}`,
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
      "flex-shrink": 1,
      minWidth: "auto"
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
    }
  });

interface RepositoryType {
  id: string;
  name: string;
  organisation: string;
  vcsType: string;
}

interface Props extends WithStyles<typeof styles> {
  expanded: boolean;
  token: string;
  repository: RepositoryType;
  onToggle: (id: PropType<RepositoryType, "id">) => any;
  onTriggerWorkflow: (
    repository: RepositoryType,
    parameters: { branch: string; tag: string; revision: string }
  ) => any;
}

interface State {
  tag: string;
  branch: string;
  revision: string;
  error?: string;
  pending: boolean;
  activeParametersGroup: "REVISION-BRANCH" | "TAG";
}

class Repository extends Component<Props, State> {
  curlRef = createRef<HTMLInputElement>();

  constructor(props: Props) {
    super(props);

    this.state = {
      activeParametersGroup: "REVISION-BRANCH",
      tag: "",
      branch: "",
      revision: "",
      pending: false
    };
  }

  onTriggerWorkflow = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { repository } = this.props;
    const { tag, branch, revision, activeParametersGroup } = this.state;

    if (activeParametersGroup === "TAG" && tag.trim().length === 0) {
      this.setState({
        error: "Tag is required"
      });

      return;
    }

    if (
      activeParametersGroup === "REVISION-BRANCH" &&
      (branch.trim().length === 0 || revision.trim().length === 0)
    ) {
      this.setState({
        error: "Branch and/or revision is required"
      });

      return;
    }

    this.setState({
      error: undefined,
      pending: true
    });

    // this.props.onTriggerWorkflow(repository, {
    //   tag: tag!,
    //   branch: branch!,
    //   revision: revision!
    // });
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

  prepareCurl() {
    const {
      repository: { name, vcsType, organisation },
      token
    } = this.props;
    const { branch } = this.state;

    return `curl -X POST 'https://circleci.com/api/v1.1/project/${vcsType}/${organisation}/${name}/build?circle-token=${token}' -F branch=${branch}`;
  }

  copyCurlToClipboard = () => {
    if (this.curlRef.current) {
      this.curlRef.current.select();
      document.execCommand("copy");
      this.curlRef.current.setSelectionRange(0, 0);
    }
  };

  render() {
    const { expanded, onToggle, classes, repository } = this.props;
    const {
      tag,
      branch,
      revision,
      activeParametersGroup,
      error,
      pending
    } = this.state;
    const { id, organisation, name } = repository;

    return (
      <ExpansionPanel expanded={expanded} onChange={() => onToggle(id)}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>{name}</Typography>
          <Typography className={classes.secondaryHeading}>
            {organisation}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          <Typography
            variant="body1"
            gutterBottom
            className={classes.description}
          >
            To trigger workflow, you need to define revision, branch or tag.
            <br />
            Tag can't be used together with revision or branch.
          </Typography>
          <form onSubmit={this.onTriggerWorkflow}>
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
                  variant="outlined"
                  onChange={this.handleInputChange("revision")}
                  margin="dense"
                  fullWidth
                  id="revision"
                  label="revision"
                  name="revision"
                  autoComplete="off"
                  disabled={pending}
                  value={revision}
                />
                <TextField
                  variant="outlined"
                  margin="dense"
                  onChange={this.handleInputChange("branch")}
                  fullWidth
                  id="branch"
                  label="branch"
                  name="branch"
                  autoComplete="off"
                  disabled={pending}
                  value={branch}
                />
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
                  name="tag"
                  autoComplete="off"
                  disabled={pending}
                  value={tag}
                />
              </Grid>
            </Grid>
            {/* <div className={classes.curlWrapper}>
              <Input
                placeholder="curl"
                className={classes.curl}
                value={this.prepareCurl()}
                inputRef={this.curlRef}
                disableUnderline={true}
                readOnly
              />
              <Button
                variant="contained"
                size="small"
                className={classes.curlButton}
                aria-label="Copy cURL to clipboard"
                title="Copy cURL to clipboard"
                onClick={this.copyCurlToClipboard}
              >
                <GetAppIcon className={classes.iconSmall} />
              </Button>
            </div> */}
            <div className={classes.actions}>
              <Grid container justify="center">
                <Grid item xs={6}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={pending}
                    className={classes.triggerButton}
                  >
                    {pending ? "Loading..." : "Trigger"}
                  </Button>
                </Grid>
              </Grid>
            </div>
          </form>
          {error && (
            <Typography component="p" className={classes.error}>
              {error}
            </Typography>
          )}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(Repository);
