/* eslint-disable react-native/no-inline-styles */
import React, { useState, useMemo, useRef, useCallback, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { baseUrl, numberWithCommas } from '../../../Database';
import {
  STYLE as s,
  COLOR as C,
  IMAGE as I,
  ALERT as A,
} from '../../../Database';
import Icons from 'react-native-vector-icons/MaterialIcons';

import MIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { printReceipt } from '../print/escpos';
import EditVoucherList from './EditVoucherList';
import ViewShot from "react-native-view-shot";
import { BluetoothEscposPrinter } from 'react-native-bluetooth-escpos-printer';
import EncryptedStorage from 'react-native-encrypted-storage';

/*
  
*/
let sepeator = {
  width: '100%',
  height: 1,
  backgroundColor: C.black,
  marginVertical: 5,
};

const VoucherDetails = ({
  open,
  onClose,
  data,
  setData,
  reload = () => { },
  navigation,
}) => {
  const t = a => a;
  const [loading, setLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [print, setPrint] = useState(false);
  const [profile, setProfile] = useState([]);
  const [showEditVoucher, setShowEditVoucher] = useState(false);


  const viewRef = useRef();

  const captureImage = async () => {
    const uri = await ViewShot.captureRef(viewRef, {
      result: "base64",
      format: "png",

    });
    return uri;
  }

  const printVoucher = async () => {
    const imageUri = await captureImage();

    await BluetoothEscposPrinter.printerInit();

    //get paper width from storage
    let paperWidth = await EncryptedStorage.getItem('paperWidth');
    if (paperWidth == null) {
      paperWidth = 800;
    }

    await BluetoothEscposPrinter.printPic(imageUri, {
      width: parseInt(paperWidth),
      left: 0,
      right: 0,
      align: 1,
      mode: 'NORMAL',
    });;
  };

  React.useEffect(() => {
    setLoading(true);
    axios
      .get('/api/profile/')
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(res => {
        console.log(res);
        setLoading(false);
      });
  }, []);

  const [footerText, setFooterText] = useState('Thanks for your shopping');

  //getfooter text from stoarge
  const getFooterText = async () => {
    const footerText = await EncryptedStorage.getItem('footerText');
    if (footerText != null) {
      setFooterText(footerText);
    } else {
      setFooterText('Thanks for your shopping');
    }
    return footerText;
  };

  React.useEffect(() => {
    getFooterText();
  }, []);

  const nameWidth = C.windowWidth * 35;
  const qtyWidth = C.windowWidth * 10;
  const priceWidth = C.windowWidth * 15;
  const totalWidth = C.windowWidth * 20;

  const renderItem = ({ item, index }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 5,
        }}>
        <Text style={{ ...s.normal_label, fontSize: 16, width: nameWidth }}>
          {item.name}
        </Text>
        <Text style={{ ...s.normal_label, fontSize: 16, width: qtyWidth }}>
          {item.qty}
        </Text>
        <Text
          style={{
            ...s.normal_label,
            fontSize: 16,
            width: priceWidth,
            textAlign: 'right'
          }}>
          {numberWithCommas(item.price)}
        </Text>
        <Text
          style={{
            ...s.normal_label,
            fontSize: 16,
            width: totalWidth,
            textAlign: 'right',
          }}>
          {numberWithCommas(item.qty * item.price)}
        </Text>
      </View>
    );
  };

  const DeleteVoucher = async id => {
    console.log('ID to Delete : ', id);
    setLoading(true);
    axios
      .delete(`/api/sales/?id=${id}`)
      .then(res => {
        console.log(res);
        setLoading(false);

        reload();
      })
      .catch(err => {
        console.log(err);
      });

    onClose();
  };

  const EditVoucher = () => {
    setShowEditVoucher(true);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={open}
      onRequestClose={() => onClose()}>
      <EditVoucherList
        show={showEditVoucher}
        onClose={() => {
          setShowEditVoucher(false);
          onClose();
          reload();
        }}
        data={data}
      />
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <View
          style={{
            width: '90%',
            height: '90%',
            backgroundColor: C.white,
            borderRadius: 10,
            padding: 10,
            elevation: 5,
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row' }}>
              <Icons name="receipt" size={30} color={'#000'} />
              <Text
                style={{
                  ...s.bold_label,
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginLeft: 5,
                }}>
                {t('Voucher Details')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => onClose()}>
              <Icons name="close" size={30} color={C.red} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }}>

            <ViewShot ref={viewRef} >
              <View style={{ backgroundColor: 'white' }}>
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                  {/* fields = ['name', 'username', 'email', 'phoneno', 'password','address']*/}
                  <Image
                    source={
                      profile.profileimage
                        ? {
                          uri: axios.defaults.baseURL + profile.profileimage,
                        }
                        : I.profile
                    }
                    style={{ width: 90, height: 90, alignSelf: 'center' }}
                  />
                  <Text style={{ ...s.bold_label }}>{profile.name}</Text>
                  <Text style={{ ...s.normal_label }}>{profile.email}</Text>
                  <Text style={{ ...s.normal_label, textAlign:'center' }}>{profile.phoneno}</Text>
                  <Text style={{ ...s.normal_label , textAlign:'center'}}>{profile.address}</Text>
                </View>
                <View style={sepeator} />
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text
                    style={{ ...s.normal_label, fontSize: 16, fontWeight: 'bold' }}>
                    {t('Receipt Number')}:{' '}
                  </Text>
                  <Text style={{ ...s.normal_label, fontSize: 16 }}>
                    {data.voucherNumber}
                  </Text>
                </View>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text
                    style={{ ...s.normal_label, fontSize: 16, fontWeight: 'bold' }}>
                    {t('Customer Name')}:{' '}
                  </Text>
                  <Text style={{ ...s.normal_label, fontSize: 16 }}>
                    {data.customerName}
                  </Text>
                </View>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text
                    style={{ ...s.normal_label, fontSize: 16, fontWeight: 'bold' }}>
                    {t('Date')}:{' '}
                  </Text>
                  <Text style={{ ...s.normal_label, fontSize: 16 }}>
                    {new Date(data.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={sepeator} />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 5,
                  }}>
                  <Text
                    style={{
                      ...s.normal_label,
                      fontSize: 16,
                      fontWeight: 'bold',
                      width: nameWidth,
                    }}>
                    {t('Product Name')}
                  </Text>
                  <Text
                    style={{
                      ...s.normal_label,
                      fontSize: 16,
                      fontWeight: 'bold',
                      width: qtyWidth,
                    }}>
                    {t('Qty')}
                  </Text>
                  <Text
                    style={{
                      ...s.normal_label,
                      fontSize: 16,
                      fontWeight: 'bold',
                      width: priceWidth,
                      textAlign: 'right'
                    }}>
                    {t('Price')}
                  </Text>
                  <Text
                    style={{
                      ...s.normal_label,
                      fontSize: 16,
                      fontWeight: 'bold',
                      width: totalWidth,
                      textAlign: 'right',
                    }}>
                    {t('Total')}
                  </Text>
                </View>
                <FlatList
                  data={data.sproduct}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => index.toString()}
                />
                <View style={sepeator} />
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text
                    style={{ ...s.normal_label, fontSize: 16, fontWeight: 'bold' }}>
                    {t('Total Amount')}:{' '}
                  </Text>
                  <Text style={{ ...s.normal_label, fontSize: 16 }}>
                    {numberWithCommas(data.totalAmount)} Ks
                  </Text>
                </View>
                {data.tax == '0' ? null : (
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text
                      style={{ ...s.normal_label, fontSize: 16, fontWeight: 'bold' }}>
                      {t('Tax')}:{' '}
                    </Text>
                    <Text style={{ ...s.normal_label, fontSize: 16 }}>
                      {numberWithCommas(data.tax)} %
                    </Text>
                  </View>
                )}
                {data.deliveryCharges == null ||
                  data.deliveryCharges == '0' ? null : (
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text
                      style={{ ...s.normal_label, fontSize: 16, fontWeight: 'bold' }}>
                      {t('Delivery Charges')}:{' '}
                    </Text>
                    <Text style={{ ...s.normal_label, fontSize: 16 }}>
                      {numberWithCommas(data.deliveryCharges)} Ks
                    </Text>
                  </View>
                )}
                {data.discount == '0' ? null : (
                  <>
                    <View style={sepeator} />
                    <View
                      style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text
                        style={{ ...s.normal_label, fontSize: 16, fontWeight: 'bold' }}>
                        {t('Discount')}:{' '}
                      </Text>
                      <Text style={{ ...s.normal_label, fontSize: 16 }}>
                      {data.discount} {data.isDiscountAmount ? 'Ks' : '%'}
                      </Text>
                    </View>
                  </>
                )}
                <View style={sepeator} />

                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text
                    style={{ ...s.normal_label, fontSize: 16, fontWeight: 'bold' }}>
                    {t('Grand Total')}:{' '}
                  </Text>
                  <Text style={{ ...s.normal_label, ...s.font_bold, fontSize: 16 }}>
                    {numberWithCommas(parseInt(data.grandtotal, 10))} Ks
                  </Text>
                </View>

                {parseInt(data.customer_payment, 10) ==
                  parseInt(data.grandtotal, 10) ? null : (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          ...s.normal_label,
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}>
                        Payment Amount:{' '}
                      </Text>
                      <Text
                        style={{ ...s.normal_label, ...s.font_bold, fontSize: 16 }}>
                        {numberWithCommas(data.customer_payment)} Ks
                      </Text>
                    </View>
                    <View style={sepeator} />

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          ...s.normal_label,
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}>
                        Remaining Amount:{' '}
                      </Text>
                      <Text
                        style={{ ...s.normal_label, ...s.font_bold, fontSize: 16 }}>
                        {numberWithCommas(
                          parseInt(data.grandtotal, 10) -
                          parseInt(data.customer_payment, 10),
                        )}
                        Ks
                      </Text>

                    </View>
                  </>
                )}
                {data.description == '' ||
                  data.description == '#cashier' ? null : (
                  <>
                    <View style={sepeator} />
                    <View
                      style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text
                        style={{ ...s.normal_label, fontSize: 16, fontWeight: 'bold' }}>
                        {t('Description')}:{' '}
                      </Text>
                      <Text style={{ ...s.normal_label, fontSize: 16 }}>
                        {data?.description?.replace('#cashier', '')}
                      </Text>
                    </View>
                  </>

                )}
                <Text style={{ ...s.normal_label, textAlign: 'center', marginTop: 10 }}>{footerText}</Text>
              </View>

            </ViewShot>

          </ScrollView>
          <View style={{ flexDirection: 'column' }}>
            <TouchableOpacity
              style={[s.blue_button, s.flexrow_aligncenter_j_center]}
              onPress={() => printVoucher()}>
              {printLoading ? (
                <ActivityIndicator size="small" color={C.white} />
              ) : (
                <>
                  <Icons name="print" size={25} color={'white'} />
                  <Text
                    style={{ ...s.bold_label, color: 'white', marginLeft: 5 }}>
                    {t('Print Voucher')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.blue_button,
                s.flexrow_aligncenter,
                { backgroundColor: 'red' },
              ]}
              onPress={() => onClose()}>
              <Icons name="close" size={25} color={'white'} />
              <Text style={{ ...s.bold_label, color: 'white' }}>
                {t('Close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default VoucherDetails;
