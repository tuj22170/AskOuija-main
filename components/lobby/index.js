import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

const Lobby = props => {
  const [error, setError] = useState('');

  //write the startGame function here
  const startGame = () => {
    if ((props.GameData !== undefined) && (props.GameData.owner === props.auth.uid) && (props.GameData.players.length > 2)) {


        let questionAsker = { displayName: '', uid: '', avatar: '' };
        let answeringSpirit = { displayName: '', uid: '', avatar: '' };
        while (questionAsker.uid === answeringSpirit.uid) {
          questionAsker = getRandomPlayer(props.GameData.players);
          answeringSpirit = getRandomPlayer(props.GameData.players);
        }
        return setRoles(questionAsker, answeringSpirit)
          .then(response => {
            if (response.hasError) {
              let friendlyError = { friendly: "Something has gone terribly wrong.", technical: response.value.toString() };
              setError(() => { throw friendlyError });
            }
          });
    }
  };

  //write the getRandomPlayer function here
  const getRandomPlayer = players => {
    return players[Math.floor(Math.random() * players.length)];
  };

  //write the setRoles function here
  const setRoles = (questionAsker, answeringSpirit) => {
    return firestore().collection("ao-games").doc(props.GameID).update({
      status: "playing",
      questionAsker: questionAsker,
      answeringSpirit: answeringSpirit,
      question: '',
      answer: '',
    })
    .then(() => {
      return { hasError: false, value: null };
    })
    .catch(err => {
      return { hasError: true, value: err };
    });
  };

  //if props.GameData is undefined, the game may have been deleted from the database. Take the player back to the greeting screen
  if (props.GameData === undefined) {
    props.changeScreen('greeting');
    return null;
  }

  return (
    <View style={props.styles.aoGameContainer}>
      <View style={props.styles.aoGameInnerContainer}>
        <View style={props.styles.aoLobbyContainer}>
          <View style={props.styles.aoLobbyInnerContainer}>
            <Text style={props.styles.aoText}>
              {"Your friends can join your group using this code:"}
            </Text>
            <Text style={props.styles.aoGameCode}>
              {props.GameData.gameCode}
            </Text>
            <>
              {props.GameData.players.map((player, index) => (
                <View key={index} style={props.styles.aoPlayerRow}>
                  <Image source={{uri: 'data:image/png;base64, ' + player.avatar}} style={props.styles.aoPlayerRowAvatar} />
                  <Text style={props.styles.aoPlayerRowName}>
                    {player.displayName}
                  </Text>
                </View>
              ))}
            </>
          </View>
          <Text style={{...props.styles.aoText, marginTop: 12, marginBottom: 24}}>
            {props.GameData.players.length < 8 ? "Waiting for people to join..." : null}
          </Text>
          {(props.GameData.owner === props.auth.uid && props.GameData.players.length > 2) ? (
            <TouchableOpacity style={props.styles.aoPrimaryButton} onPress={() => startGame()}>
              <Text style={props.styles.aoPrimaryButtonText}>
                {"Let's Play"}
              </Text>
            </TouchableOpacity>
          ) : (
            null
          )}
        </View>
      </View>
    </View>
  );
};

export default Lobby;
