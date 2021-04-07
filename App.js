/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
} from 'react-native';
import styles from './components/stylesheet';
import Greeting from './components/greeting';
import Lobby from './components/lobby';
import ParticipatingSpirit from './components/participating-spirit';
import AnsweringSpirit from './components/answering-spirit';
import QuestionAsker from './components/question-asker';
import ErrorBoundary from './components/error-boundary';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

const App: () => React$Node = () => {
  const [userAuth, setUserAuth] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('greeting');
  const [gameData, setGameData] = useState({});
  const [gameID, setGameID] = useState();
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');

  var subscriber = null;

  //change the current screen to a new screen
  const changeScreen = newScreen => {
    setCurrentScreen(newScreen);
  };

  //update the stored game data when the db game data changes
  const updateGameData = newGameData => {
    setGameData(newGameData);
  };

  //create the joinGame function here
  const joinGame = gameDocID => {
    setGameID(gameDocID);
    //start listening for updates to game data
    subscriber = firestore().collection("ao-games").doc(gameDocID).onSnapshot(doc => {
      updateGameData(doc.data());
    });

    //add me to the current players list
    return getAvatar()
      .then(avatar => {
        if (!avatar.hasError) {
          return getPlayers(gameDocID)
            .then(players => {
              if (!players.hasError) {
                let alreadyThere = false;
                let newPlayers = players;
                players.forEach(player => {
                  if (player.uid === auth().currentUser.uid) {
                    alreadyThere = true;
                  }
                });
                if (!alreadyThere) {
                  console.log(auth().currentUser.displayName);
                  newPlayers.push({
                    uid: auth().currentUser.uid,
                    displayName: auth().currentUser.displayName,
                    avatar: avatar,
                  });
                  return updatePlayers(gameDocID, newPlayers)
                    .then(response => {
                      if (!response.hasError) {
                        setCurrentScreen('lobby');
                      } else {
                        let friendlyError = { friendly: "Something has gone terribly wrong.", technical: response.value !== undefined ? response.value.toString() : '' };
                        setError(() => { throw friendlyError });
                      }
                    });
                } else {
                  setCurrentScreen('lobby');
                }
              } else {
                let friendlyError = { friendly: "Something has gone terribly wrong.", technical: players.value !== undefined ? players.value : ''};
                setError(() => { throw friendlyError });
              }
            });
        }
      });
  };

 

  //create the updatePlayers function here
  const updatePlayers = (gameDocID, playersArray) => {
    return firestore().collection("ao-games").doc(gameDocID).update({
      players: playersArray,
    })
    .then(() => {
      return { hasError: false, value: null }
    })
    .catch(err => {
      return { hasError: true, value: err }
    });
  };

  //create the getPlayers function here
  const getPlayers = gameDocID => {
    return firestore().collection("ao-games").doc(gameDocID).get()
      .then(doc => {
        if (doc.exists) {
          return doc.data().players;
        } else {
          return { hasError: true, value: 'doc-not-found' };
        }
      })
      .catch(err => {
        return { hasError: true, value: err };
      });
  };

  //create the getAvatar function here
  const getAvatar = () => {
    let key = firestore().collection("ao-avatars").doc().id;
    return firestore().collection("ao-avatars").where(firebase.firestore.FieldPath.documentId(), ">=", key).limit(1).get()
      .then(snapshot => {
        if (snapshot.size > 0) {
          let avatar = "";
          snapshot.forEach(doc => {
            avatar = doc.data().avatarText;
          });
          return avatar;
        } else {
          return firestore().collection("ao-avatars").where(firebase.firestore.FieldPath.documentId(), "<", key).limit(1).get()
            .then(snapshot => {
              let avatar = "";
              snapshot.forEach(doc => {
                avatar = doc.data().avatarText;
              });
              return avatar;
            })
            .catch(err => {
              return { hasError: true, error: err };
            });
        }
      })
      .catch(err => {
      return { hasError: true, error: err };
    });
  };

  const onAuthStateChanged = user => {
    setUserAuth(user);
    if (initializing) {
      setInitializing(false);
    }
  }

  //write your useEffect code here
  useEffect(() => {
    //declare the listener that will listen for changes to authentication state
    const authSubscriber = auth().onAuthStateChanged(onAuthStateChanged);

    //we don't use user accounts for this app, so sign in the user anonymously
    auth()
      .signInAnonymously()
        .then(() => {
          console.log('User signed in anonymously');
        })
        .catch(err => {
          let friendlyError = { friendly: "We couldn't authenticate you with the game service.", technical: err.toString() };
        });

    //when the component is destroyed, unsubscribe to any listeners
    return (() => {
      if (subscriber !== null) {
        subsciber();
        authSubscriber;
      }
    });
  }, []); 

  //while we wait for the authentication process to complete, show a blank screen
  if (initializing) {
    return null;
  };


  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ErrorBoundary style={styles}>
          {(() => {
            if ((gameData !== undefined) && (gameData.status === "playing") && (gameData.questionAsker.uid === auth().currentUser.uid)) {
              return <QuestionAsker styles={styles} GameData={gameData} GameID={gameID} auth={auth().currentUser} />
            }

            if ((gameData !== undefined) && (gameData.status === "playing") && (gameData.answeringSpirit.uid === auth().currentUser.uid)) {
              return <AnsweringSpirit styles={styles} GameData={gameData} GameID={gameID} />
            }

            if ((gameData !== undefined) && (gameData.status === "playing")) {
              return <ParticipatingSpirit styles={styles} GameData={gameData} GameID={gameID} />
            }

            if ((currentScreen === 'greeting') && (auth)) {
              return <Greeting styles={styles} CurrentScreen={currentScreen} changeScreen={changeScreen} joinGame={joinGame} />
            }

            if ((currentScreen === 'lobby') && (auth)) {
              return <Lobby styles={styles} auth={auth().currentUser} GameData={gameData} GameID={gameID} changeScreen={changeScreen} />
            }
          })()}
        </ErrorBoundary>
      </SafeAreaView>
    </>
  );
};

export default App;
