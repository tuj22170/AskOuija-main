import React from 'react';
import { View, Text, Image } from 'react-native';

const WaitingForAction = props => {
  return (
    <View style={props.styles.aoGameContainer}>
      <View style={{...props.styles.aoGameInnerContainer, justifyContent: "center"}}>
        <View style={props.styles.aoLobbyContainer}>
          <View style={props.styles.aoLobbyInnerContainer} />
          <View style={props.styles.aoSpiritWatchingGameBar}>
            <View style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end"}}>
              <Image source={{uri: 'data:image/png;base64, ' + props.GameData.questionAsker.avatar}} style={{...props.styles.aoPlayerRowAvatar, marginRight: 0}} />
              <Text style={props.styles.aoSpiritWatchingGameBarText}>
                <Text style={{color: "#ECA72C"}}>
                  {props.GameData.questionAsker.displayName}
                </Text>
                {" is asking a question"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WaitingForAction;
