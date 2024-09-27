/* eslint-disable react-native/no-inline-styles */
import { useNetInfo } from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  Vibration,
  View,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import SplashScreen from 'react-native-splash-screen';
import { COLOR, IMAGE, baseUrl } from '../Database';
import { createTables } from '../localDatabase/LocalDb';
import Login from './Login';
import Register from './SignUp';
import Container from './pcomponents/Container';
import AdminPricing from './pcomponents/adminpricing';
import FindPrinter from './pcomponents/extra/FindPrinter';
import Loading from './pcomponents/extra/Loading';
import LocalStorageReport from './pcomponents/localstorage/LocalReport';
import Pricing from './pcomponents/pricing';
import SetPrinter from './pcomponents/print/setPrint';
import Profile from './pcomponents/profile';
import SecurityView from './pcomponents/Password/SecurityVIEW';
import ReceiptView from './pcomponents/sales/ReceiptView';
import ChangePassword from './pcomponents/Password/ChangePassword';
import ForgotPassword from './pcomponents/Password/ForgotPassword';
import { UploadToCloud } from '../localDatabase/UploadToCloud';
import { AuthContext } from './pcomponents/context/AuthContext';
import ExpenseReceiptView from './pcomponents/Expense/ReceiptView';
import OtherIncomeRV from './pcomponents/OtherIncome/ReceiptView';
import CustomerView from './pcomponents/sales/CustomerView';
import SupplierView from './pcomponents/products/supplier';
import SupplierReceiptView from './pcomponents/products/SupplierReceiptView';
import CustomerReceiptView from './pcomponents/sales/CustomerReceiptView';
import { useTranslation } from 'react-i18next';
import { CustomerDataProvider } from './pcomponents/extra/CustomerDataProvider';
import { SupplierDataProvider } from './pcomponents/extra/SupplierDataProvider';
import {
  BluetoothEscposPrinter,
  BluetoothManager,
  BluetoothTscPrinter,
} from 'react-native-bluetooth-escpos-printer';


const Stack = createNativeStackNavigator();
const SContainer = () => {
  axios.defaults.baseURL = baseUrl;
  const [isloading, setIsLoading] = useState();
  const [userToken, setToken] = useState();

  const { isConnected, connectionType } = useNetInfo();
  const [IsSyncing, setIsSyncing] = useState(false);

  const { t } = useTranslation();


  useEffect(() => {
    GetToken();
    console.log('Get Tokens');
  }, []);

  const UploadToServer = () => {
    setIsSyncing(true);
    UploadToCloud()
      .catch(res => {
        setIsSyncing(false);
      })
      .then(res => {
        setIsSyncing(false);
      });

    // setTimeout(() => {
    //   setIsSyncing(false);
    // }, [10000]);
  };

  useEffect(() => {
    if (isConnected && userToken != null) {
      UploadToServer();
    }
  }, [isConnected, userToken]);


  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    Vibration.vibrate(200);

    setShowModal(!isConnected);
  }, [isConnected]);

  const GetToken = () => {
    setIsLoading(true);
    EncryptedStorage.getItem('secure_token').then(res => {
      setToken(res);
      setIsLoading(false);
      if (res == null) {
        SplashScreen.hide();
      } else {
        axios.defaults.headers.common = { Authorization: `Token ${res}` };
        SplashScreen.hide();
      }
    });
  };

  //Create Local Storage Database
  useEffect(() => {
    createTables();
  }, []);

  const userTokenValue = useMemo(() => ({ userToken, setToken }), [userToken]);


  //Connect Printer
  useEffect(() => {
    EncryptedStorage.getItem('printer').then(res => {
      if(res != null){
        let printer = JSON.parse(res);
        BluetoothManager.connect(printer.boundAddress).then(
          async (s) => {
            console.log('connect success');
            await BluetoothEscposPrinter.printerInit();
            ToastAndroid.show('Printer Connected', ToastAndroid.SHORT);
          },
          (e) => {
            console.log('connect failed');
            console.log(e);
            ToastAndroid.show('Printer Not Connected', ToastAndroid.SHORT);
          },
        );
      }
    })
  
  }, [])

  if (!isloading || userToken) {
    SplashScreen.hide();
    return (
      <>
        <AuthContext.Provider value={userTokenValue}>
          <SupplierDataProvider>
            <CustomerDataProvider>
              <NavigationContainer>
                <Stack.Navigator
                  screenOptions={{
                    headerShown: false,
                  }}>
                  {userToken == null ? (
                    <>
                      <Stack.Screen
                        name="login"
                        component={Login}
                        initialParams={{ token: setToken }}
                      />
                      <Stack.Screen
                        name="register"
                        component={Register}
                        initialParams={{ token: setToken }}
                      />
                      <Stack.Screen
                        name="forgotpassword"
                        component={ForgotPassword}
                      />
                    </>
                  ) : (
                    <>
                      <Stack.Screen
                        name="main"
                        component={Container}
                        initialParams={{ token: setToken }}
                      />
                      <Stack.Screen
                        name="salesvoucher"
                        component={ReceiptView}
                        initialParams={{ token: setToken }}
                      />
                      <Stack.Screen
                        name="expensereceipt"
                        component={ExpenseReceiptView}
                        initialParams={{ token: setToken }}
                      />
                      <Stack.Screen
                        name="otherincomereceipt"
                        component={OtherIncomeRV}
                        initialParams={{ token: setToken }}
                      />

                      <Stack.Screen
                        name="netPrinter"
                        component={FindPrinter}
                        initialParams={{ token: setToken }}
                      />
                      <Stack.Screen
                        name="profile"
                        component={Profile}
                        initialParams={{ token: setToken }}
                      />
                      <Stack.Screen
                        name="printers"
                        component={SetPrinter}
                        initialParams={{ token: setToken }}
                      />
                      <Stack.Screen
                        name="pricing"
                        component={Pricing}
                        initialParams={{ token: setToken }}
                      />
                      <Stack.Screen
                        name="admin_pricing"
                        component={AdminPricing}
                        initialParams={{ token: setToken }}
                      />
                      <Stack.Screen
                        name="localreport"
                        component={LocalStorageReport}
                      />
                      <Stack.Screen
                        name="customersales"
                        component={CustomerReceiptView}
                      />
                     

                      <Stack.Screen name="security" component={SecurityView} />
                      <Stack.Screen
                        name="changepassword"
                        component={ChangePassword}
                      />
                      <Stack.Screen
                        name="forgotpassword"
                        component={ForgotPassword}
                      />
                    </>
                  )}
                </Stack.Navigator>
              </NavigationContainer>
            </CustomerDataProvider>
          </SupplierDataProvider>
          {showModal && <OfflineWarningModel setShowModal={setShowModal} />}
          {!isConnected && <YoureOffline />}
          {IsSyncing && <SyncingDataWithServer />}
        </AuthContext.Provider>
      </>
    );
  }
  return <Loading />;
};

export default SContainer;
const OfflineWarningModel = ({ setShowModal }) => {
  // Offiline Warning Model with style
  const { t } = useTranslation();

  return (
    <View
      style={{
        position: 'absolute',
        flex: 1,
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        alignItems: 'center',
      }}>
      <View
        style={{
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 15,
          elevation: 1,
          alignItems: 'center',
          position: 'relative',
          flexDirection: 'column',
        }}>
        <Text style={{ color: 'black', fontSize: 15, fontWeight: 'bold' }}>
          {t('NoInternet')}
        </Text>

        <TouchableOpacity
          style={{
            width: 200,
            alignItems: 'center',
            padding: 10,
            borderRadius: 10,
            marginTop: 10,
            backgroundColor: '#0d6efd',
          }}
          onPress={() => {
            setShowModal(false);
          }}>
          <Text style={{ color: 'white', fontSize: 18 }}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const YoureOffline = ({ }) => {
  const { t } = useTranslation();
  return (
    <View
      style={{
        backgroundColor: 'red',
        padding: 8,
        paddingBottom: 9,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>
        You're Offline
      </Text>
    </View>
  );
};

const SyncingDataWithServer = ({ }) => {
  return (
    <View
      style={{
        backgroundColor: 'blue',
        padding: 8,
        paddingBottom: 9,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      }}>
      <ActivityIndicator size={20} color={COLOR.bluecolor} />
      <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>
        Syncing Data with server...
      </Text>
    </View>
  );
};
