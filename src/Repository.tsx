import React, { Component, FormEvent, ChangeEvent } from "react";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import { WithStyles } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import Radio from "@material-ui/core/Radio";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
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
      justifyContent: "center"
    },
    parametersGroup: {
      marginBottom: theme.spacing(1),
      padding: theme.spacing(1),
      border: `1px solid ${theme.palette.grey[200]}`,
      borderRadius: 2
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
  repository: RepositoryType;
  onToggle: (id: PropType<RepositoryType, "id">) => any;
  onTriggerWorkflow: (
    repository: RepositoryType,
    parameters: { branch: string; tag: string; revision: string }
  ) => any;
}

interface State {
  tag?: string;
  branch?: string;
  revision?: string;
  activeParametersGroup: "REVISION-BRANCH" | "TAG";
}

class Repository extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      activeParametersGroup: "REVISION-BRANCH",
      tag: "",
      branch: "",
      revision: ""
    };
  }

  onTriggerWorkflow = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { repository } = this.props;
    const { tag, branch, revision, activeParametersGroup } = this.state;

    this.props.onTriggerWorkflow(repository, {
      tag: tag!,
      branch: branch!,
      revision: revision!
    });
  };

  onParametersSetChose = (e: ChangeEvent<HTMLInputElement>) => {
    this.setParametersSet(e.currentTarget.value as PropType<
      State,
      "activeParametersGroup"
    >);
  };

  handleInputChange(inputName: "revision" | "tag" | "branch") {
    return (e: ChangeEvent<HTMLInputElement>) => {
      this.setState<"revision" | "tag" | "branch">({
        [inputName]: e.currentTarget.value! as string
      });
    };
  }

  setParametersSet = (
    parametersSet: PropType<State, "activeParametersGroup">
  ) => {
    this.setState({
      activeParametersGroup: parametersSet
    });
  };

  render() {
    const { expanded, onToggle, classes, repository } = this.props;
    const { tag, branch, revision, activeParametersGroup } = this.state;
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
          <Grid container>
            <Grid item xs={12}>
              <Typography component="p"></Typography>
            </Grid>
          </Grid>
          <form onSubmit={this.onTriggerWorkflow}>
            <Grid container justify="space-between">
              <Grid item xs={8}>
                <div className={classes.parametersGroup}>
                  <Grid container spacing={0} justify="space-between">
                    <Grid item xs={2}>
                      <Box height="100%" display="flex" alignItems="center">
                        <Radio
                          checked={activeParametersGroup === "REVISION-BRANCH"}
                          onChange={this.onParametersSetChose}
                          value="REVISION-BRANCH"
                          name="radio-button-demo"
                          inputProps={{ "aria-label": "a" }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={10}>
                      <TextField
                        variant="outlined"
                        onChange={this.handleInputChange("revision")}
                        onFocus={() => this.setParametersSet("REVISION-BRANCH")}
                        margin="dense"
                        fullWidth
                        id="revision"
                        label="revision"
                        name="revision"
                        autoFocus
                        autoComplete="off"
                        value={revision}
                      />
                      <TextField
                        variant="outlined"
                        margin="dense"
                        onChange={this.handleInputChange("branch")}
                        onFocus={() => this.setParametersSet("REVISION-BRANCH")}
                        fullWidth
                        id="branch"
                        label="branch"
                        name="branch"
                        autoFocus
                        autoComplete="off"
                        value={branch}
                      />
                    </Grid>
                  </Grid>
                </div>
                <div className={classes.parametersGroup}>
                  <Grid container spacing={0} justify="space-between">
                    <Grid item xs={2}>
                      <Box height="100%" display="flex" alignItems="center">
                        <Radio
                          checked={activeParametersGroup === "TAG"}
                          onChange={this.onParametersSetChose}
                          value="TAG"
                          name="radio-button-demo"
                          inputProps={{ "aria-label": "b" }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={10}>
                      <TextField
                        variant="outlined"
                        margin="dense"
                        onChange={this.handleInputChange("tag")}
                        onFocus={() => this.setParametersSet("TAG")}
                        fullWidth
                        id="tag"
                        label="tag"
                        name="tag"
                        autoFocus
                        autoComplete="off"
                        value={tag}
                      />
                    </Grid>
                  </Grid>
                </div>
              </Grid>
              <Grid item xs={3} className={classes.triggerButtonWrapper}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                >
                  Trigger
                </Button>
              </Grid>
            </Grid>
          </form>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(Repository);
