import React from 'react';
import { View, Text, Image } from 'react-native';
import WaitingForAction from '../waiting-for-action';

const ParticipatingSpirit = props => {
  //if the question asker has asked their question, show the game board
  if ((props.GameData !== undefined) && (props.GameData.status === "playing")  && (props.GameData.question !== "")) {
    return (
      <View style={props.styles.aoGameContainer}>
        <View style={{...props.styles.aoGameInnerContainer, justifyContent: "center"}}>
          <View style={props.styles.aoLobbyContainer}>
            <View style={props.styles.aoLobbyInnerContainer}>
              <Text style={props.styles.aoHeadline}>
                {"O Spirit, answer my query, please. "}
                <Text style={{color: "#ECA72C"}}>
                  {props.GameData.question}
                </Text>
              </Text>
              <View style={props.styles.aoAnswerSpace}>
                {[...props.GameData.answer].map((letter, index) => (
                  <View key={index} style={props.styles.aoAnswerLetterTile}>
                    <Text style={props.styles.aoAnswerLetterTileText}>
                      {letter}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={props.styles.aoSpiritWatchingGameBar}>
              <View style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end"}}>
                <Image source={{uri: 'data:image/png;base64, ' + props.GameData.answeringSpirit.avatar}} style={{...props.styles.aoPlayerRowAvatar, marginRight: 0}} />
                <Text style={props.styles.aoSpiritWatchingGameBarText}>
                  <Text style={{color: "#ECA72C"}}>
                    {props.GameData.answeringSpirit.displayName}
                  </Text>
                  {" is answering the query"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  //if the question asker has not asked their question, show a waiting screen
  if ((props.GameData !== undefined) && (props.GameData.status === "playing") && (props.GameData.question === "")) {
    return (
      <WaitingForAction styles={props.styles} GameID={props.GameID} GameData={props.GameData} />
    );
  }

  //if all else fails, show nothing
  return null;
};

export default ParticipatingSpirit;
