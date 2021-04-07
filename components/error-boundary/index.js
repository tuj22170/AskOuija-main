import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    //Catch errors in any components below and re-render with error message
    this.setState({
      error: error.friendly ? error.friendly : error.toString(),
      errorInfo: errorInfo,
    });
  }

  clearError() {
    this.setState({
      error: null,
      errorInfo: null,
    });
  }

  render() {
    if (this.state.errorInfo) {
      return (
        <View style={this.props.styles.aoGameContainer}>
          <View style={this.props.styles.aoGameInnerContainer}>
            <View style={this.props.styles.aoLobbyContainer}>
              <View style={this.props.styles.aoLobbyInnerContainer}>
                <Text style={this.props.styles.aoHeadline}>
                  {"It's always risky to attempt to communicate with the Other World"}
                </Text>
                <Text style={this.props.styles.aoText}>
                  {this.state.error}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={this.props.styles.aoPrimaryButton} onPress={() => this.clearError()}>
              <Text style={this.props.styles.aoPrimaryButtonText}>
                {"Start Over"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    //Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;
