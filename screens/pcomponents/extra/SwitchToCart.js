/* eslint-disable radix */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {View, TouchableOpacity, TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {MessageModalNormal} from '../../MessageModal';
import {
  STYLE as s,
  COLOR as C,
  IMAGE as i,
  ALERT as a,
} from '../../../Database';
import axios from 'axios';
import {numberWithCommas} from '../../../Database';
import {CartContext} from '../context/CartContext';
const SwitchToCart = ({item}) => {
  const {CartData, setCartData} = useContext(CartContext);
  const [selectedItem, setSelectItem] = useState(false);
  const [citem, setCitem] = useState();

  const onFirstSetItem = fitem => {
    if (fitem) {
      let d = {
        name: fitem.id,
        qty: 1,
        price: fitem.price,
        check: true,
        total: fitem.price,
        pdname: fitem.name,
        extraprice: fitem.extraprice,
      };

      setCitem(d);
      setSelectItem(true);
    }
  };

  const IncreaseValue = useCallback(() => {
    const temp = {...citem, ['qty']: parseInt(citem.qty + 1)};
    setCitem(temp);
  }, [citem]);

  const DecreaseValue = useCallback(() => {
    const temp = {...citem, ['qty']: parseInt(citem.qty - 1)};
    setCitem(temp);
  }, [citem]);

  const typeNumber = text => {
    const temp = {...citem, ['qty']: parseInt(text)};
    setCitem(temp);
  };

  useEffect(() => {
    if (citem) {
      if (citem.qty === 0) {
        setSelectItem(false);
      }
    }
  }, [citem]);

  useMemo(() => {
    console.log('Citem Changing');
    let cartdata = [...CartData];
    if (citem) {
      let index = cartdata.findIndex(it => it.name === citem.name);
      let joined = [];
      if (index === -1) {
        joined = CartData.concat(citem);
        setCartData(joined);
      } else if (citem.qty === 0) {
        cartdata = cartdata.filter(a => a.name !== citem.name);
        setCartData(cartdata);
      } else {
        cartdata[index] = {
          ...cartdata[index],
          ['qty']: parseInt(citem.qty),
        };
        cartdata[index] = {
          ...cartdata[index],
          ['total']: cartdata[index].price * cartdata[index].qty,
        };
        setCartData(cartdata);
      }

      console.log(citem);
      console.log(joined);
    }
  }, [citem]);

  useMemo(() => {
    let data = CartData.filter(d => d.name === item.id);
    if (data) {
      setSelectItem(true);
    }
  }, [CartData, setCartData]);

  useEffect(() => {
    let data = CartData.filter(d => d.name === item.id);
    if (data) {
      setSelectItem(true);
      setCitem(data[0]);
    }
  }, []);

 

  if (selectedItem && citem) {
    return (
      <View style={{...s.flexrow_aligncenter_j_center}}>
        <TouchableOpacity
          onPress={() => typeNumber('0')}
          style={{
            padding: 5,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'red',
            borderRadius: 50,
            margin: 5,
          }}>
          <Icon name={'close'} size={25} color={'#fff'} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => DecreaseValue()}
          style={{
            padding: 5,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'red',
            borderRadius: 10,
            margin: 5,
          }}>
          <Icon name={'remove'} size={25} color={'#fff'} />
        </TouchableOpacity>
        <TextInput
          style={{
            width: 35,
            height: 35,
            backgroundColor: 'white',
            fontSize: 20,
            padding: 0,
            color: 'black',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
          defaultValue={'1'}
          value={citem.qty.toString()}
          onChangeText={e => {
            if (parseInt(e) > item.qty) {
              a.lqy();
            } else {
              typeNumber(e);
            }
          }}
          maxLength={4}
          keyboardType={'numeric'}
          selectTextOnFocus
        />
        <TouchableOpacity
          onPress={() => {
            if (citem.qty >= item.qty) {
              a.lqy();
            } else {
              IncreaseValue();
            }
          }}
          style={{
            padding: 5,

            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'blue',
            borderRadius: 10,
            margin: 5,
          }}>
          <Icon name={'add'} size={25} color={'#fff'} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={{backgroundColor: 'green', padding: 10, borderRadius: 15}}
      onPress={() => {
        onFirstSetItem(item);
      }}>
      <MIcon name="cart-plus" size={25} color={'#fff'} />
    </TouchableOpacity>
  );
};

export default SwitchToCart;
