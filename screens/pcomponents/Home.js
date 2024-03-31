/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  RefreshControl,
  ScrollView,
  Dimensions,
  TouchableHighlight,
  TouchableOpacityBase,
  Button,
  TurboModuleRegistry,
  Modal,
  TextInput,
} from 'react-native';
import Icons from 'react-native-vector-icons/Ionicons';
import { IMAGE, STYLE as s, COLOR as C, isArrayhasData } from '../../Database';
import EncryptedStorage from 'react-native-encrypted-storage';
import MIcons from 'react-native-vector-icons/MaterialIcons';
import Icons2 from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { numberWithCommas } from '../../Database';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Table, Row, Rows } from 'react-native-table-component';
import { useTranslation } from 'react-i18next';
import '../../assets/i18n/i18n';
import { MessageModalNormal } from '../MessageModal';
import Pricing from './pricing';
import { useNetInfo } from '@react-native-community/netinfo';
import { DeleteAllProfile, insertProfile } from '../../localDatabase/profile';
import { computeCustomerRemaingAmount, getCustomerSales, useCustomer } from './extra/CustomerDataProvider';
import { computeSupplierRemainingAmount, useSupplier } from './extra/SupplierDataProvider';
Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};
const HomeScreen = ({ navigation, route }) => {
  const { token } = route.params;

  const [settings, setSettings] = useState({
    datascope: 'year',
    language: 'en',
    expirescope: 7,
    lessthan: 10,
  });
  const RemoveToken = () => {
    EncryptedStorage.removeItem('secure_token');
    // Container.InfoToken.setUserToken(null);

    token(null);
  };

  useEffect(() => {
    //  get Setting & Load Data
    getSettings();
  }, []);
  const getSettings = () => {
    // Set language from i18n
    // setSettings({...settings, ['language']: i18n.language});

    EncryptedStorage.getItem('setting_data')
      .then(res => {
        console.log('get Settings', res);
        if (res !== null) {

          let settings = JSON.parse(res);

          if (settings.expirescope) {

            setSettings(JSON.parse(res));
          } else {
            console.log("Expire scope", settings.expirescope)
            EncryptedStorage.setItem('setting_data', JSON.stringify({ ...settings, ['expirescope']: 7 }));
            setSettings({ ...settings, ['expirescope']: 7 });
          }


        } else {
          setSettings({ datascope: 'year', language: 'en', lessthan: 10, expirescope: 7 });
        }
        Load();
      })
      .catch(err => console.log(err));
  };

  const { t, i18n } = useTranslation();
  const { isConnected, connectionType } = useNetInfo();

  const [Sales_Data, setSales_Data] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);

  const [otherIncome, setOtherincomeData] = useState([]);
  const [pdata, setPddata] = useState(null);

  const [refresh, setRefresh] = useState();

  const [topProduct, setTopProduct] = useState(null);

  const { getCustomerData } = useCustomer();
  const { getSupplierData } = useSupplier();
  const Load = () => {
    // if (!isConnected) return;

    setRefresh(true);

    getSalesFromServer();

    getProductFromServer();

    getExpenseFromServer();

    getOtherIncomeFromServer();

    LoadProfile();

    getTopProduct();

    getSalesChartFServer();

    getCustomerData();

    getSupplierData();

  };

  const getTopProduct = (time = 'year') => {
    axios
      .get('/api/toproduct/', {
        params: {
          time: settings.datascope,
        },
      })
      .then(res => {
        let T_Freq = [];
        for (var [k, v] of Object.entries(res.data.T_Freq)) {
          console.log(k, v);
          T_Freq.push({
            name: k,
            freq: v,
            price: res.data.T_Money[k],
            color: getRandomColor(),
            legendFontColor: 'black',
            legendFontSize: 15,
          });
        }

        setTopProduct(T_Freq);
      })
      .catch(err => console.log(err));
  };

  const topproduct = React.useMemo(() => {
    if (topProduct) {
      return topProduct;
    } else {
      return piechartdata;
    }
  }, [topProduct]);

  const LoadProfile = () => {
    axios
      .get('/api/profile/')
      .then(res => {
        DeleteAllProfile();
        console.log(res.data);
        setPddata(res.data);
        ComputeWarningDate(res.data);
        insertProfile(res.data);
      })
      .catch(err => {
        if (err.response.status == 401) {
          RemoveToken();
        }
        setRefresh(false);
      });
  };

  const getSalesFromServer = (type = 'DT', time = 'year', startd, endd) => {
    axios
      .get('/api/sales/', {
        params: {
          type: 'DT',
          time: settings ? settings.datascope : time,
        },
      })
      .then(res => {
        setSales_Data(res.data.DATA);

        // setTimeout(() => {
        //   getSalesChartFromServer(res.data.DATA, 't');
        // }, 1000);
      })
      .catch(err => setRefresh(false));
  };

  const getSalesChartFServer = (type = 'DT', time = 'year', startd, endd) => {
    axios
      .get('/api/sales/', {
        params: {
          type: 'DT',
          time: 'year',
        },
      })
      .then(res => {
        setSalesData(res.data.DATA);

        setTimeout(() => {
          getSalesChartFromServer(res.data.DATA, 't');
        }, 1000);
      })
      .catch(err => setRefresh(false));
  };

  const getProductFromServer = () => {
    axios
      .get('/api/products/')
      .then(res => {
        setProductData(res.data);
        console.log('LESStock : ', showLS);
        console.log('STockOUT : ', showSO);
        if (showLS === true) {
          LessStockProducts();
        } else {
          StockOutProducts();
        }
      })
      .catch(err => setRefresh(false));
  };

  const getBeforeExpireProduct = useMemo(() => {
    //filter expire date before by day eg. 7 days
    const today = new Date();
    const temp = productData.filter(item => {
      if (item.expiry_date) {
        const end_date = new Date(item.expiry_date);
        console.log(end_date)

        const Difference_In_Time = end_date - today;
        const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

        console.log(settings?.expirescope, Difference_In_Days, "d , d")
        return Difference_In_Days <= settings.expirescope;
      }
    })
    console.log("Temp : ", temp)
    return temp;

  }, [productData])

  const getExpiredProduct = useMemo(() => {
    //filter expired products
    const today = new Date();
    const temp = productData.filter(item => {
      if (item.expiry_date) {
        const end_date = new Date(item.expiry_date);
        const Difference_In_Time = end_date - today;
        const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
        return Difference_In_Days <= 0;
      }

    });

    return temp;

  }, [productData])



  const getExpenseFromServer = () => {
    axios
      .get('/api/expenses/', { params: { time: settings.datascope } })
      .then(res => setExpenseData(res.data.DATA))
      .catch(err => setRefresh(false));
  };

  const getOtherIncomeFromServer = () => {
    axios
      .get('/api/otherincome/', { params: { time: settings.datascope } })
      .then(res => {
        setOtherincomeData(res.data.DATA);
        setRefresh(false);
      })
      .catch(err => setRefresh(false));
  };

  const SumSales = useMemo(() => {
    if (Sales_Data) {
      let price = 0;
      Sales_Data.forEach(e => {
        price += parseInt(e.grandtotal);
      });

      return price;
    }
    return 0;
  }, [Sales_Data]);

  const SumExpense = useMemo(() => {
    if (expenseData) {
      let price = 0;
      expenseData.forEach(e => {
        price += parseInt(e.price);
      });

      return price;
    }
    return 0;
  }, [expenseData]);

  const SumProduct = useMemo(() => {
    if (productData) {
      let price = 0;
      productData.forEach(e => {
        price += parseInt(e.price) * parseInt(e.qty);
      });
      return price;
    }
    return 0;
  }, [productData]);

  const SumProductCost = useMemo(() => {
    if (productData) {
      let price = 0;
      productData.forEach(e => {
        price += parseInt(e.cost) * parseInt(e.qty);
      });
      return price;
    }
    return 0;
  }, [productData]);

  const PutProductsToServer = (pd, pic, id) => {
    const d = new FormData();
    d.append('id', id);
    d.append('name', pd.name);
    d.append('price', pd.price);
    d.append('qty', pd.qty);

    d.append('category', pd.category);
    d.append('description', pd.description);
    d.append('pic', pic);

    console.log(d);

    axios
      .put('/api/products/', d, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(res => {
        getProductFromServer();
      })
      .catch(err => a.spe());
  };

  const [salesChartData, setSalesChartData] = useState([0]);
  const [salesTable, setSaleTableData] = useState([0, 0]);
  const [salesChartLabel, setSalesChartLabel] = useState(['0']);
  const [tabletotalprice, setTabletotalprice] = useState(0);
  const [dtSelect, setDtSelect] = useState('t');

  const getSalesChartFromServer = (salesData, t) => {
    Compute(salesData, t).then(res => {
      setSalesChartData(res.pricedata);
      setSalesChartLabel(res.label);
      setSaleTableData(res.tabledata);
      setTabletotalprice(res.totalprice);
    });
  };

  const Compute = async (salesData, t) => {
    const label = [];
    const pricedata = [];
    const tabledata = [];
    var totalprice = 0;

    /**
     * @param{Date} time The Date
     **/

    const format12H = time => {
      return (
        time
          .toLocaleTimeString()
          .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, '$1$3') +
        (time.getHours() >= 12 ? ' PM' : ' AM')
      );
    };

    if (t === 't') {
      const temp = salesData.filter(e => {
        let today = new Date();
        let d = new Date(e.date);
        // console.log(e.date);

        return (
          today.getDate() === d.getDate() &&
          today.getMonth() === d.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      });

      temp.forEach(e => {
        let d = new Date(e.date);
        // console.log(e.customerName)
        //  console.log(d.getHours() + ':' + d.getMinutes());
        let time = d.toTimeString().substring(0, 5);
        label.push(time);
        pricedata.push(kFormatter(parseInt(e.grandtotal)));
        tabledata.push([
          format12H(d),
          numberWithCommas(parseInt(e.grandtotal)) + ' MMK',
        ]);
        totalprice += parseInt(e.grandtotal);
      });
    } else if (t === 'w') {
      const weekString = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      var curr = new Date();
      var first = curr.getDate() - curr.getDay();
      var last = first + 6;

      var firstdate = new Date(curr.setDate(first));
      var lastdate = new Date(curr.setDate(last));

      console.log(firstdate.getTime());

      const tempw = salesData.filter(e => {
        let d = new Date(e.date);
        return (
          d.getTime() >= firstdate.getTime() &&
          d.getTime() <= lastdate.getTime()
        );
      });

      weekString.forEach((e, index) => {
        console.log(e);
        var price = 0;

        tempw.forEach(i => {
          var d = new Date(i.date);
          if (d.getDay() === index) {
            price += parseInt(i.grandtotal);
          }
        });

        label.push(e);
        pricedata.push(kFormatter(price));
        tabledata.push([e, numberWithCommas(parseInt(price)) + ' MMK']);
        totalprice += price;
      });
    } else {
      const monthString = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      var firstd = new Date();
      firstd.setDate(1);
      firstd.setMonth(0);
      firstd.setHours(0, 0, 0, 0);

      console.log('First :' + firstd);

      var lastd = new Date();
      lastd.setDate(31);
      lastd.setMonth(11);
      lastd.setHours(24, 0, 0, 0);

      const tempm = salesData.filter(e => {
        let d = new Date(e.date);
        return (
          d.getTime() >= firstd.getTime() && d.getTime() <= lastd.getTime()
        );
      });

      monthString.forEach((e, index) => {
        console.log(e);
        var price = 0;

        tempm.forEach(i => {
          var d = new Date(i.date);
          if (d.getMonth() === index) {
            price += parseInt(i.grandtotal);
          }
        });

        label.push(e);
        pricedata.push(kFormatter(price));
        tabledata.push([e, numberWithCommas(parseInt(price)) + ' MMK']);
        totalprice += price;
      });
    }

    if (pricedata.length > 0) {
      return {
        pricedata: pricedata,
        label: label,
        tabledata: tabledata,
        totalprice: totalprice,
      };
    }
  };

  const [SOData, setSOData] = useState();
  const [LSData, setLSData] = useState();
  const StockOutProducts = () => {
    console.log('COmputing Stock OUt Prodcuts');
    const pddata = productData.filter(item => item.qty <= 0);
    setSOData(pddata);
    // return pddata.length;
  };
  const LessStockProducts = React.useCallback(() => {
    setSOData(null);
    console.log('Computing LessThan Products', settings.lessthan);
    const pddata = productData.filter(
      item => item.qty <= parseInt(settings.lessthan, 10),
    );
    setSOData(pddata);
    // return pddata.length;
  }, [settings?.lessthan, productData]);

  const [showSO, setShowSO] = useState(false);
  const [showLS, setshowLS] = useState(false);
  const [editpd, setEditPD] = useState();


  const [showExpire, setShowExpire] = useState(false);

  const PDITEM = ({ item }) => {
    return (
      <View
        key={item.id}
        style={{
          flex: 1,
          backgroundColor: '#f0f0f0',
          padding: 10,
          margin: 5,
          flexDirection: 'row',
          borderRadius: 15,
        }}>
        <Image
          source={{
            uri:
              item.pic === '/media/null' || item.pic === null
                ? 'https://www.pngitem.com/pimgs/m/27-272007_transparent-product-icon-png-product-vector-icon-png.png'
                : axios.defaults.baseURL + item.pic,
          }}
          style={{ width: 100, height: 100 }}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ ...s.bold_label, fontSize: 18 }}>{item.name}</Text>
          <Text style={{ ...s.bold_label, fontSize: 15, marginTop: 5 }}>
            {numberWithCommas(item.price)} MMK
          </Text>
          {item.expiry_date && <Text style={{ ...s.bold_label, fontSize: 15, marginTop: 5 }}>
        Expire Date :     {new Date(item.expiry_date).toLocaleDateString()}
          </Text>}
        </View>
        <View style={{ position: 'absolute', right: 5, top: 8 }}>
          <TouchableOpacity
            onPress={() => {
              setCmodal(true);
              setEditPD(item);
            }}>
            <Icons name={'create-outline'} size={30} color={'#000'} />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            ...s.normal_label,
            backgroundColor: 'red',
            color: 'white',
            padding: 5,
            borderBottomRightRadius: 15,
            borderTopLeftRadius: 15,
            fontWeight: 'bold',
          }}>
          {item.qty}
        </Text>
      </View>
    );
  };

  const onCloseSO = () => {
    setShowSO(!showSO);
    setshowLS(!showLS);
  };

  const [cmodal, setCmodal] = useState(false);
  const onClosecmodal = () => setCmodal(!cmodal);

  const EditQty = () => {
    const onHandleEPdtData = (e, name) => {
      const temp = { ...editpd, [name]: e };
      setEditPD(temp);
      console.log(temp);
    };

    if (editpd) {
      return (
        <MessageModalNormal show={cmodal} onClose={onClosecmodal}>
          <View>
            <Text style={{ color: 'black' }}>{editpd.name}</Text>
            <View
              style={{
                ...s.flexrow_aligncenter_j_between,
                borderRadius: 15,
                height: 45,
                borderColor: 'black',
                borderWidth: 1.5,
                paddingRight: 10,
              }}>
              <TextInput
                style={{
                  padding: 10,
                  fontSize: 16,
                  fontWeight: '900',
                  flex: 1,
                }}
                defaultValue={editpd.qty + ''}
                placeholder={t('Qty')}
                autoFocus={true}
                onChangeText={e => onHandleEPdtData(e, 'qty')}
                keyboardType={'number-pad'}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                console.log(editpd);
                onClosecmodal();
                PutProductsToServer(editpd, null, editpd.id);
                onCloseSO();
              }}>
              <View
                style={{
                  ...s.flexrow_aligncenter_j_center,
                  padding: 10,
                  ...s.blue_button,
                }}>
                <Text style={{ ...s.font_bold, color: 'white', padding: 10 }}>
                  {t('Add_Quantity')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </MessageModalNormal>
      );
    }
  };

  let widthwidth = C.windowWidth * 95 - 50;

  let tablearr = [50, widthwidth / 2, widthwidth / 2, widthwidth / 3];

  const [d_w_modal, setD_w_modal] = useState(false);
  const [d_w_day, setD_w_day] = useState(1);
  const [price_modal, setprice_modal] = useState(false);
  const headerstyle = {
    ...styles.cell,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const ComputeWarningDate = data => {
    const end_date = new Date(data.end_d);
    const today_date = new Date();
    var Difference_In_Time = end_date - today_date;
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    console.log(Math.round(Difference_In_Days));

    if (Difference_In_Days <= 5) {
      setD_w_modal(true);
      setD_w_day(Math.round(Difference_In_Days));
    }

    if (data) {
      if (Difference_In_Days <= 0) {
        setprice_modal(true);
      }
      console.log(data.end_d, 'PD Data end');
    }
  };

  if (price_modal) {
    return (
      <Modal show={price_modal}>
        <Pricing route={{ params: route.params }} navigation={navigation} />
      </Modal>
    );
  }

  return (
    <ScrollView
      nestedScrollEnabled
      style={s.Container}
      refreshControl={<RefreshControl onRefresh={Load} refreshing={refresh} />}>
      {/* appbar */}

      <MessageModalNormal show={showSO} onClose={onCloseSO} width={'100%'}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ ...s.font_bold, color: 'black', padding: 5 }}>
            {showLS
              ? 'Less Than ' + settings?.lessthan + ' Qty Product'
              : 'Stock Out Products'}
          </Text>
        </View>
        <FlatList
          data={SOData}
          renderItem={PDITEM}
          keyExtractor={item => item.id.toString()}
          style={{ backgroundColor: 'white' }}
        />
      </MessageModalNormal>

      <MessageModalNormal show={showExpire} onClose={() => setShowExpire(false)} width={'100%'}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ ...s.font_bold, color: 'black', padding: 5 }}>
            {'Expire Products within ' + settings?.expirescope + ' days'}
          </Text>
        </View>
        <FlatList
          data={getBeforeExpireProduct}
          renderItem={PDITEM}
          keyExtractor={item => item.id.toString()}
          style={{ backgroundColor: 'white' }}
        />
      </MessageModalNormal>

      <MessageModalNormal
        show={d_w_modal}
        onClose={() => {
          setD_w_modal(false);
        }}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'black', fontWeight: 'bold' }}>Date Warning</Text>
          <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold' }}>
            {d_w_day} Days Left
          </Text>
          <Text style={{ color: 'black' }}>
            Only {d_w_day} days left for the plan to expire
          </Text>
        </View>
        <TouchableOpacity
          style={{ ...s.blue_button, padding: 8 }}
          onPress={() =>
            navigation.navigate({ name: 'pricing', params: route.params })
          }>
          <Text style={{ color: 'white' }}>See Plan</Text>
        </TouchableOpacity>
        { }
        <TouchableOpacity
          style={{ ...s.blue_button, padding: 8 }}
          onPress={() => setD_w_modal(false)}>
          <Text style={{ color: 'white' }}>Close</Text>
        </TouchableOpacity>
      </MessageModalNormal>

      {EditQty()}
      <View
        style={{
          ...s.flexrow_aligncenter_j_between,
          padding: 8,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={IMAGE.app_logo}
            style={{ width: 30, height: 30, borderRadius: 30 }}
            resizeMode={'cover'}
          />
          <Text style={{ ...s.bold_label, fontSize: 23, marginLeft: 5 }}>
            Rapid Retail
          </Text>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 50,
              backgroundColor: isConnected ? 'green' : 'orange',
              marginLeft: 5,
            }}
          />
          {isConnected ? null : (
            <TouchableOpacity
              style={{ marginLeft: 5 }}
              onPress={() => navigation.navigate('localreport')}>
              <MIcons name="storage" size={25} color={'#000'} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate({ name: 'profile', params: route.params })
          }>
          {pdata === null ? (
            <Image
              source={IMAGE.profile}
              style={{ width: 40, height: 40, borderRadius: 30 }}
            />
          ) : (
            <Image
              source={
                pdata.profileimage
                  ? {
                    uri: axios.defaults.baseURL + pdata.profileimage,
                  }
                  : IMAGE.profile
              }
              style={{ width: 40, height: 40, borderRadius: 30 }}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* view */}
      <View style={{ flex: 1 }}>
         <View style={{ maxHeight: 100, flexDirection: 'row', marginTop: 5 }}>
              <TouchableOpacity style={{ backgroundColor: C.bluecolor, borderRadius: 15, padding: 15, flex: 1 }} underlayColor="white" onPress={() => navigation.navigate('sales')}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icons name='cart' size={30} color={'#fff'} />
                  <Text style={{ ...s.bold_label, color: 'white', marginLeft: 2 }}>{t('Sales')}</Text>

                </View>
                <Text style={{ ...s.bold_label, color: 'white' }}>
                  {numberWithCommas(SumSales)} MMK
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('expense')} style={{ backgroundColor: C.bluecolor, borderRadius: 15, padding: 15, flex: 1, marginLeft: 4 }} underlayColor="white" >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icons2 name='cash' size={30} color={'#fff'} />
                  <Text style={{ ...s.bold_label, color: 'white', marginLeft: 2 }}>{t('Expense')}</Text>

                </View>
                <Text style={{ ...s.bold_label, color: 'white' }}>  {numberWithCommas(SumExpense)} MMK
                </Text>
              </TouchableOpacity>
          </View>
           <View style={{ maxHeight: 100, flexDirection: 'row', marginTop: 5 }}>
              <TouchableOpacity style={{ backgroundColor: C.bluecolor, borderRadius: 15, padding: 15, flex: 1 }} underlayColor="white" onPress={() => navigation.navigate('product', { screen: 'cpurchase' })}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icons name='layers' size={30} color={'#fff'} />
                  <Text style={{ ...s.bold_label, color: 'white', marginLeft: 2 }}>{t('Purchase')}</Text>

                </View>
                <Text style={{ ...s.bold_label, color: 'white' }}>
                  {numberWithCommas(SumProductCost)} MMK
                </Text>
              </TouchableOpacity>
              <TouchableOpacity  onPress={() => navigation.navigate('product', { screen: 'cproduct' })}  style={{ backgroundColor: C.bluecolor, borderRadius: 15, padding: 15, flex: 1, marginLeft: 4 }} underlayColor="white" >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icons2 name={'package-variant-closed'} size={30} color={'#fff'} />
                  <Text style={{ ...s.bold_label, color: 'white', marginLeft: 2 }}>{t('pd_balance_amount')}</Text>

                </View>
                <Text style={{ ...s.bold_label, color: 'white' }}>  {numberWithCommas(SumProduct)} MMK
                </Text>
              </TouchableOpacity>
          </View>

        <View style={{ maxHeight: 100, flexDirection: 'row', marginTop: 5 }}>
          <TouchableOpacity style={{ backgroundColor: C.bluecolor, borderRadius: 15, padding: 15, flex: 1 }} underlayColor="white" onPress={() => navigation.navigate('customer')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icons name='people' size={30} color={'#fff'} />
              <Text style={{ ...s.bold_label, color: 'white', marginLeft: 2 }}>Customer</Text>

            </View>
            <Text style={{ ...s.bold_label, color: 'white' }}>
              {numberWithCommas(computeCustomerRemaingAmount())} MMK
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('supplier')} style={{ backgroundColor: C.bluecolor, borderRadius: 15, padding: 15, flex: 1, marginLeft: 4 }} underlayColor="white" >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icons2 name='package-down' size={30} color={'#fff'} />
              <Text style={{ ...s.bold_label, color: 'white', marginLeft: 2 }}>Supplier</Text>

            </View>
            <Text style={{ ...s.bold_label, color: 'white' }}>  {numberWithCommas(computeSupplierRemainingAmount())} MMK
            </Text>
          </TouchableOpacity>
        </View>
      </View>




      <View style={{ ...s.flexrow_aligncenter_j_between, marginTop: 8 }} />
      <Text style={{ color: 'black', fontWeight: 'bold' }}>
          {t('Sales_Chart')}
        </Text>
        <ScrollView
          style={{ flexDirection: 'row' }}
          horizontal
          showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            underlayColor="white"
            onPress={() => getSalesChartFromServer(salesData, 't')}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: C.blackbutton,
                margin: 5,
                borderRadius: 15,
              }}>
              <Text style={{ color: 'white', padding: 10 }}>{t('Today')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            underlayColor="white"
            onPress={() => getSalesChartFromServer(salesData, 'w')}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: C.blackbutton,
                margin: 5,
                borderRadius: 15,
              }}>
              <Text style={{ color: 'white', padding: 10 }}>
                {t('Days_View')}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            underlayColor="white"
            onPress={() => getSalesChartFromServer(salesData, 'm')}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: C.blackbutton,
                margin: 5,
                borderRadius: 15,
              }}>
              <Text style={{ color: 'white', padding: 10 }}>
                {t('Months_View')}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
        <LineChart
          data={{
            labels: salesChartLabel,
            datasets: [
              {
                data: salesChartData,
              },
            ],
          }}
          verticalLabelRotation={-90}
          width={C.windowWidth * 95} // from react-native
          height={300}
          yAxisSuffix=" k"
          withHorizontalLines
          yAxisInterval={1} // optional, defaults to 1
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
        <Text style={{ color: 'black', fontWeight: 'bold' }}>
          {t('Sales_Table')}
        </Text>

        <Table borderStyle={{ borderWidth: 2, borderColor: '#000' }}>
          <Row
            data={[t('Date&Time'), t('Amount')]}
            style={{
              backgroundColor: '#f1f8ff',
              height: 40,
            }}
            textStyle={{ color: 'black', textAlign: 'center' }}
          />
          <Rows data={salesTable} textStyle={{ margin: 6, color: 'black' }} />
        </Table>
        <View
          style={{
            ...s.flexrow_aligncenter_j_between,
            margin: 10,
            padding: 5,
          }}>
          <Text style={{ ...s.font_bold, color: 'black' }}>
            {t('Total_Amount')}
          </Text>
          <Text style={{ ...s.font_bold, color: 'black' }}>
            {numberWithCommas(tabletotalprice) + ' MMK'}
          </Text>
        </View>
      <View>
        {productData ? (
          <View style={{ flexDirection: 'column' }}>
            {productData.filter(item => item.qty <= 0).length <= 0 ? null : (
              <TouchableOpacity
                style={{
                  padding: 10,
                  backgroundColor: '#fa1455',
                  borderRadius: 15,
                  ...s.flexrow_aligncenter,
                }}
                onPress={() => {
                  setShowSO(true);
                  StockOutProducts();
                }}>
                <Icons2
                  name={'package-variant-closed'}
                  size={25}
                  color={'white'}
                />
                <Text style={{ ...s.bold_label, color: 'white' }}>
                  {productData.filter(item => item.qty <= 0).length} {t('POOS')}
                </Text>
              </TouchableOpacity>
            )}
            {productData.filter(item => item.qty <= 10).length <= 0 ? null : (
              <TouchableOpacity
                style={{
                  padding: 10,
                  backgroundColor: '#f57a07',
                  borderRadius: 15,
                  ...s.flexrow_aligncenter,
                  marginTop: 5,
                }}
                onPress={() => {
                  setShowSO(true);
                  setshowLS(true);
                  LessStockProducts();
                }}>
                <Icons2
                  name={'package-variant-closed'}
                  size={25}
                  color={'white'}
                />
                <Text style={{ ...s.bold_label, color: 'white' }}>
                  {
                    productData.filter(item => item.qty <= settings?.lessthan)
                      .length
                  }{' '}
                  Products are less than {settings?.lessthan} qty
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {getBeforeExpireProduct.length > 0 ? (
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: '#d65420',
              borderRadius: 15,
              ...s.flexrow_aligncenter,
              marginTop: 5,
            }}
            onPress={() => {
             setShowExpire(true);
            }}>
            <Icons2
              name={'package-variant-closed'}
              size={25}
              color={'white'}
            />
            <Text style={{ ...s.bold_label, color: 'white' }}>
              {getBeforeExpireProduct.length
              }{' '}
              Products are expire within {settings?.expirescope} days
            </Text>
          </TouchableOpacity>
        ) : null}


        {isArrayhasData(topProduct) ? (
          <>
            <View style={{ marginTop: 8 }}>
              <Text style={{ ...s.font_bold, color: 'black' }}>{t('TFSP')}</Text>
              {topProduct ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  <PieChart
                    data={
                      topProduct.length >= 4
                        ? topproduct.slice(0, 4).reverse()
                        : topproduct.reverse()
                    }
                    width={300}
                    height={200}
                    chartConfig={{
                      backgroundColor: '#e26a00',
                      backgroundGradientFrom: '#fb8c00',
                      backgroundGradientTo: '#ffa726',
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      decimalPlaces: 2,
                      style: {
                        borderRadius: 16,
                      },
                    }}
                    accessor="freq"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                    hasLegend={false}
                  />
                  {/*Custom Legend*/}
                  <View style={{ flex: 1, position: 'absolute', right: -15, marginTop: 15, width: 120 }}>
                    {(topProduct.length >= 4
                      ? topproduct.slice(0, 4).sort((a, b) => a.freq - b.freq).reverse()
                      : topproduct.sort((a, b) => a.freq - b.freq).reverse()).map((item) => {
                        return (
                          <View style={{ flexDirection: 'row', alignItems: 'center', margin: 8, }}>
                            <View style={{ backgroundColor: item.color, width: 10, height: 10, borderRadius: 50, marginRight: 5 }} />
                            <Text style={{ color: 'black', fontSize: 15, fontWeight: 'bold' }}>{item.name}</Text>
                          </View>
                        )
                      })
                    }
                  </View>
                </ScrollView>
              ) : null}
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={{ ...s.font_bold, color: 'black' }}>{t('TMP')}</Text>
              {topProduct ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  style={{ height: 200 }}>
                  <View style={{ flexDirection: 'column' }}>
                    <View
                      style={{
                        height: 40,
                        flexDirection: 'row',
                        backgroundColor: C.bluecolor,
                      }}>
                      <View style={{ ...headerstyle, width: tablearr[0] }}>
                        <Text style={{ color: 'white', textAlign: 'center' }}>
                          {t('No')}
                        </Text>
                      </View>
                      <View style={{ ...headerstyle, width: tablearr[1] }}>
                        <Text style={{ color: 'white', textAlign: 'center' }}>
                          {t('ProductName')}
                        </Text>
                      </View>
                      <View style={{ ...headerstyle, width: tablearr[2] }}>
                        <Text style={{ color: 'white', textAlign: 'center' }}>
                          {t('Price2')}
                        </Text>
                      </View>
                    </View>

                    <ScrollView nestedScrollEnabled={true}>
                      {topProduct
                        .sort(
                          (i1, i2) =>
                            parseInt(i2.price, 10) - parseInt(i1.price, 10),
                        )
                        .map((item, index) => (
                          <View>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                              <View
                                style={{ ...styles.cell, width: tablearr[0] }}>
                                <Text
                                  style={{ color: 'black', textAlign: 'center' }}>
                                  {index + 1}
                                </Text>
                              </View>
                              <View
                                style={{ ...styles.cell, width: tablearr[1] }}>
                                <Text
                                  style={{ color: 'black', textAlign: 'center' }}>
                                  {item.name}
                                </Text>
                              </View>
                              <View
                                style={{ ...styles.cell, width: tablearr[2] }}>
                                <Text
                                  style={{ color: 'black', textAlign: 'right' }}>
                                  {numberWithCommas(item.price) + ' MMK'}
                                </Text>
                              </View>
                            </View>
                          </View>
                        ))}
                    </ScrollView>
                  </View>
                </ScrollView>
              ) : null}
            </View>
          </>
        ) : null}

        
      </View>
    </ScrollView>
  );
};

const kFormatter = num => {
  return Math.abs(num) > 999
    ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1)
    : Math.sign(num) * Math.abs(num);
};

export default HomeScreen;

const styles = StyleSheet.create({
  cell: {
    borderColor: 'black',
    borderWidth: 0.5,
    padding: 10,
    backgroundColor: 'transparent',
  },
});

const chartConfig = {
  backgroundColor: 'black',
  backgroundGradientFrom: '#548bf7',
  backgroundGradientTo: C.bluecolor,
  decimalPlaces: 0, // optional, defaults to 2dp
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  propsForVerticalLabels: { translateY: 15 },
  style: {
    borderRadius: 0,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#548bf7',
  },
};

const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const piechartdata = [
  {
    color: '#74892B',
    freq: 3,
    legendFontColor: 'black',
    legendFontSize: 15,
    name: 'Product C',
    price: 13500,
  },
  {
    color: '#6A14E0',
    freq: 2,
    legendFontColor: 'black',
    legendFontSize: 15,
    name: 'Product D',
    price: 1000,
  },
  {
    color: '#0FE763',
    freq: 2,
    legendFontColor: 'black',
    legendFontSize: 15,
    name: 'Product E',
    price: 3000,
  },
];
