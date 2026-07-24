const { Tooltip, Button } = require('@rneui/themed');

class TooltipCustom extends React.Component {
  state = {
    open: false
  };

  toggleState = () => {
    this.setState({ open: !this.state.open });
  };

  render() {
    return (
      <Button aria-label={this.props.title}>
        <Tooltip
          enterDelay={300}
          leaveDelay={300}
          onClose={this.toggleState}
          onOpen={this.toggleState}
          open={this.state.open}
          placement="bottom"
          title={this.props.title}
        >
          {this.props.children}
        </Tooltip>
      </Button>
    );
  }
}