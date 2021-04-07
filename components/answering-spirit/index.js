import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import WaitingForAction from '../waiting-for-action';

const AnsweringSpirit = props => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' '];
  const [selectedLetter, setSelectedLetter] = useState('');
  const [error, setError] = useState('');

  //write the addLetter function here
  const addLetter = () => {
    return firestore().collection("ao-games").doc(props.GameID).update({
      answer: props.GameData.answer + selectedLetter,
    })
    .then(response => {
      let newAnsweringSpirit = getRandomPlayer();
      while ((newAnsweringSpirit.uid === props.GameData.answeringSpirit.uid) || (newAnsweringSpirit.uid === props.GameData.questionAsker.uid)) {
        newAnsweringSpirit = getRandomPlayer();
      }
      updateAnsweringSpirit(newAnsweringSpirit);
    })
    .catch(err => {
      let friendlyError = { friendly: "Something has gone horribly wrong.", technical: err.toString() };
      setError(() => { throw friendlyError });
    });
  };

  //select the letter if it's different from the already selected letter. If it's the same, deselect the letter
  const toggleLetter = letter => {
    if (letter === selectedLetter) {
      setSelectedLetter('');
    } else {
      setSelectedLetter(letter);
    }
  };

  //write the finalizeAnswer function here
  const finalizeAnswer = () => {
    let newQuestionAsker = getRandomPlayer();
    let newAnsweringSpirit = getRandomPlayer();
    while (newQuestionAsker.uid === newAnsweringSpirit.uid) {
      newQuestionAsker = getRandomPlayer();
    }
    return firestore().collection("ao-games").doc(props.GameID).update({
      questionAsker: newQuestionAsker,
      answeringSpirit: newAnsweringSpirit,
      question: '',
      answer: '',
    })
    .catch(err => {
      let friendlyError = { friendly: "Something has gone terribly wrong.", technical: err.toString() };
      setError(() => { throw friendlyError });
    });
  };

  //get a random player from the array of players
  const getRandomPlayer = () => {
    return props.GameData.players[Math.floor(Math.random() * ((props.GameData.players.length - 1) - 0 + 1) + 0)];
  };

  //write the updateAnsweringSpirit function here
  const updateAnsweringSpirit = newAnsweringSpirit => {
    return firestore().collection("ao-games").doc(props.GameID).update({
      answeringSpirit: newAnsweringSpirit,
    })
    .catch(err => {
      let friendlyError = { friendly: "Something has gone terribly wrong.", technical: err.toString() };
      setError(() => { throw friendlyError });
    });
  };

  //render a waiting screen for the answering spirit while the question asker selects their question
  if ((props.GameData !== undefined) && (props.GameData.status === "playing") && (props.GameData.question === "" )) {
    return (
      <WaitingForAction styles={props.styles} GameID={props.GameID} GameData={props.GameData} />
    );
  }

  //dislay the answer space for the answering spirit
  if ((props.GameData !== undefined) && (props.GameData.status === "playing") && (props.GameData.question !== "")) {
    return (
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
              <View style={props.styles.aoAnswerLetterTile}>
                <Text style={props.styles.aoAnswerLetterTileText}>
                  {"_"}
                </Text>
              </View>
            </View>
          </View>
          <View style={{...props.styles.aoSpiritWatchingGameBar, backgroundColor: "#000000"}}>
            <Text style={{...props.styles.aoText, alignSelf: "flex-start"}}>
              {"Add a letter to the answer (swipe to see more letters):"}
            </Text>
            <ScrollView style={props.styles.aoLetterBar} contentContainerStyle={{alignItems: "center", justifyContent: "center"}} horizontal={true}>
              {letters.map(letter => (
                <TouchableOpacity key={letter} style={selectedLetter === letter ? {...props.styles.aoAnswerLetterTileSelected, marginVertical: 0} : {...props.styles.aoAnswerLetterTile, marginVertical: 0}} onPress={() => toggleLetter(letter)}>
                  <Text style={selectedLetter === letter ? props.styles.aoAnswerLetterTileSelectedText : props.styles.aoAnswerLetterTileText}>
                    {letter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={selectedLetter !== "" ? props.styles.aoPrimaryButton : props.styles.aoPrimaryButtonDisabled} onPress={() => addLetter()}>
              <Text style={props.styles.aoPrimaryButtonText}>
                {"Add Letter"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={selectedLetter === "" ? props.styles.aoSecondaryButton : props.styles.aoSecondaryButtonDisabled} onPress={() => finalizeAnswer()}>
              <Text style={selectedLetter === "" ? props.styles.aoSecondaryButtonText : props.styles.aoSecondaryButtonDisabledText}>
                {"Finalize Answer"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
    );
  }

  //if all else fails, just display a blank screen
  return null;

};

export default AnsweringSpirit;
