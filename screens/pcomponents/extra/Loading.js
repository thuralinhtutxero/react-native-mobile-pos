/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icons from 'react-native-vector-icons/Ionicons';
import EncryptedStorage from 'react-native-encrypted-storage';
import {STYLE as s, COLOR as C, IMAGE as I} from '../../../Database';
import axios from 'axios';
import {ScrollView} from 'react-native-gesture-handler';
import {MessageModalNormal} from '../../MessageModal';

const Loading = ({modal, show, onClose, infotext}) => {
  if (modal) {
    return (
      <MessageModalNormal show={show} onClose={onClose} width={90} height={90}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor:C.bluecolor}}>
          <Image
            source={I.app_logo}
            style={{width: 50, height: 50}}
            resizeMode={'contain'}
          />
          <Text style={{color:'white'}}>{infotext ? infotext : 'Loading'}</Text>
        </View>
      </MessageModalNormal>
    );
  } else {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: C.bluecolor,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={I.app_logo}
          style={{width: 50, height: 50}}
          resizeMode={'contain'}
        />
      </View>
    );
  }
};

export default Loading;
