import React from "react";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import { WithStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

const styles = (theme: Theme) =>
  createStyles({
    dialogContainer: {
      alignItems: "flex-start"
    },
    dialogScrollPaper: {
      margin: theme.spacing(2)
    },
    heading: {
      fontSize: theme.typography.pxToRem(18),
      flexBasis: "70%",
      flexShrink: 0
    },
    summaryRoot: {
      cursor: "initial !important"
    },
    actions: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      "justify-content": "space-between"
    }
  });

interface Props extends WithStyles<typeof styles> {
  onClose: () => void;
  open: boolean;
}

const About = ({ classes, open, onClose }: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll="paper"
      aria-labelledby="scroll-dialog-title"
      classes={{ paperScrollPaper: classes.dialogScrollPaper, container: classes.dialogContainer }}
    >
      <DialogContent dividers={true}>
        <Typography variant="h5" component="h2" gutterBottom>
          What is this tool?
        </Typography>
        <Typography variant="body1" paragraph>
          Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat. Aliquam eget maximus est, id dignissim
          quam.
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          What is this tool?
        </Typography>
        <Typography variant="body1" paragraph>
          Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat. Aliquam eget maximus est, id dignissim
          quam.
        </Typography>
        {/*             
        <dl>
          <dt>Denim (semigloss finish)</dt>
          <dd>Ceiling</dd>

          <dt>Denim (eggshell finish)</dt>
          <dt>Evening Sky (eggshell finish)</dt>
          <dd>Layered on the walls</dd>
        </dl> */}
        {/* <ExpansionPanel expanded={true}>
          <ExpansionPanelSummary
            role=""
            classes={{
              root: classes.summaryRoot
            }}
          >
            <Typography className={classes.heading}>What is this tool?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>
              Nulla facilisi. Phasellus sollicitudin nulla et quam mattis feugiat. Aliquam eget maximus est, id
              dignissim quam.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel expanded={true}>
          <ExpansionPanelSummary>
            <Typography className={classes.heading}>Users</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>
              Donec placerat, lectus sed mattis semper, neque lectus feugiat lectus, varius pulvinar diam eros in elit.
              Pellentesque convallis laoreet laoreet.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel> */}
      </DialogContent>
      <DialogActions classes={{ root: classes.actions }}>
        <Box justifySelf="flex-start">
          made by{" "}
          <Link href="https://twitter.com/itsmapil" target="_blank">
            mariusz pilarczyk
          </Link>
        </Box>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withStyles(styles)(About);
