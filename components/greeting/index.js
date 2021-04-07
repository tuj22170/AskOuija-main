import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

const Greeting = props => {
  const [currentStep, setCurrentStep] = useState('intro');
  const [gameCode, setGameCode] = useState('');
  const [gameDocID, setGameDocID] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  //write the createGame function here
  const createGame = () => {
    generateGameCode()
      .then(response => {
        if (!response.hasError) {
          setGameDocID(response);
          setCurrentStep('get-name');
        } else {
          let friendlyError = { friendly: "Something has gone terribly wrong.", technical: response.value !== undefined ? response.value.toString() : '' };
          setError(() => { throw friendlyError });
        }
      })
      .catch (err => {
        let friendlyError = { friendly: "Something has gone terribly wrong.", technical: err.toString() };
        setError(() => { throw friendlyError });
      });
  };
  //write the generateGameCode function here
  const generateGameCode = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    let newGameCode = '';
    for (var x=0; x<4; x++) {
      newGameCode+= letters[Math.floor(Math.random() * (25 - 0 + 1) + 0)];
    }
    return checkGameCode(newGameCode);
  };
  //write the checkGameCode function here
  const checkGameCode = newGameCode => {
    return firestore().collection("ao-games").where("gameCode", "==", newGameCode)
      .get()
      .then(results => {
        if (results.size > 0) {
          return generateGameCode();
        } else {
          return saveGame(newGameCode);
        }
      })
      .catch(err => {
        return { hasError: true, value: err };
      });
  };
  //write the saveGame function here
  const saveGame = newGameCode => {
    return firestore().collection("ao-games").add({
      gameCode: newGameCode,
      status: "waiting",
      players: [],
      owner: auth().currentUser.uid,
      answer: '',
      question: '',
    })
    .then(gameDoc => {
      return gameDoc.id;
    })
    .catch(err => {
      return { hasError: true, error: err };
    });
  };
  //write the updateName function here
  const updateName = () => {
    if (userName.length > 0) {
      return auth().currentUser.updateProfile({
        displayName: userName,
      })
      .then((r) => {
        props.joinGame(gameDocID);
      })
      .catch(err => {
        let friendlyError = { friendly: "Something has gone terribly wrong.", technical: err.toString() };
        setError(() => { throw friendlyError });
      });
    }
  };
  //write the joinGame function here
  const joinGame = () => {
    if (gameCode.length === 4) {
      return firestore().collection("ao-games").where("gameCode", "==", gameCode.toUpperCase())
      .get()
      .then(results => {
        if (results.size > 0) {
          let thisGameDocID = null;
          results.forEach(game => {
            thisGameDocID = game.id;
          });
          setGameDocID(thisGameDocID);
          setCurrentStep('get-name');
        } else {
          setCurrentStep('error-game-not-found');
        }
      })
      .catch(err => {
        let friendlyError = { friendly: "Something has gone terribly wrong.", technical: err.toString() };
        setError(() => { throw friendlyError });
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={props.styles.aoGameContainer}>
        <View style={props.styles.aoGameInnerContainer}>
          <Image style={props.styles.aoGreetingsImage} source={require('./img/ask-ouija-greetings-background.png')} resizeMode={"cover"} />
          <View style={props.styles.aoGameBar}>

            {currentStep === 'intro' ? (
              <>
                <Text style={props.styles.aoGameTitle}>
                  {"Ask Ouija"}
                </Text>
                <Text style={props.styles.aoHeadline}>
                  {"Greetings, mortal"}
                </Text>
                <Text style={props.styles.aoText}>
                  {"Join hands with your friends and ask the Spirits to answer your most pressing questions."}
                </Text>
                <TouchableOpacity style={props.styles.aoPrimaryButton} onPress={() => setCurrentStep('create-or-join')}>
                  <Text style={props.styles.aoPrimaryButtonText}>
                    {"Get Started"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              null
            )}

            {currentStep === 'create-or-join' ? (
              <>
                <TouchableOpacity style={props.styles.aoPrimaryButton} onPress={() => createGame()}>
                  <Text style={props.styles.aoPrimaryButtonText}>
                    {"Create a Group"}
                  </Text>
                </TouchableOpacity>
                <View style={props.styles.aoOrDividerRow}>
                  <View style={props.styles.aoOrDivider} />
                  <Text style={props.styles.aoOrDividerText}>
                    {"or"}
                  </Text>
                  <View style={props.styles.aoOrDivider} />
                </View>
                <Text style={{...props.styles.aoText, textAlign: 'left'}}>
                  {"Enter a code to join a group:"}
                </Text>
                <View style={props.styles.aoEnterCodeRow}>
                  <TextInput style={props.styles.aoCodeTextbox} placeholder="????" value={gameCode} onChangeText={text => setGameCode(text)} maxLength={4} />
                  <TouchableOpacity style={gameCode.length === 4 ? {...props.styles.aoPrimaryButton, marginTop: 0, marginLeft: 6, width: "auto"} : {...props.styles.aoPrimaryButtonDisabled, marginTop: 0, marginLeft: 6, width: "auto"}} onPress={() => joinGame()}>
                    <Text style={props.styles.aoPrimaryButtonText}>
                      {"Find Group"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              null
            )}

            {currentStep === 'get-name' ? (
              <>
                <Text style={props.styles.aoHeadline}>
                  {"Who dares disturb the slumber of the Spirits?"}
                </Text>
                <View style={props.styles.aoEnterCodeRow}>
                  <TextInput style={props.styles.aoTextbox} placeholder={"Give us your name..."} value={userName} onChangeText={text => setUserName(text)} />
                  <TouchableOpacity style={userName.length > 0 ? {...props.styles.aoPrimaryButton, marginTop: 0, marginLeft: 6, width: "auto"} : {...props.styles.aoPrimaryButtonDisabled, marginTop: 0, marginLeft: 6, width: "auto"}} onPress={() => updateName()}>
                    <Text style={props.styles.aoPrimaryButtonText}>
                      {"Join"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              null
            )}

            {currentStep === 'error-game-not-found' ? (
              <>
                <Text style={props.styles.aoText}>
                  {"The Spirits could not connect you with your friends. Have you provided the Spirits with the correct Group Code?"}
                </Text>
                <TouchableOpacity style={props.styles.aoPrimaryButton} onClick={() => setCurrentStep('create-or-join')}>
                  <Text style={props.styles.aoPrimaryButtonText}>
                    {"Go Back"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              null
            )}

          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Greeting;
