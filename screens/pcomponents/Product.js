/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Modal,
  ScrollView,
  Button,
  Alert,
  BackHandler,
  PermissionsAndroid,
  RefreshControl,
  ToastAndroid,
  Vibration,
  Dimensions,
} from 'react-native';
import Icons from 'react-native-vector-icons/Ionicons';
import {
  IMAGE,
  STYLE as s,
  COLOR as C,
  ALERT as a,
  numberWithCommas,
  calculateEAN13,
  isArrayhasData,
} from '../../Database';
import EncryptedStorage from 'react-native-encrypted-storage';
import MIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextInput } from 'react-native-gesture-handler';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessageModalNormal } from '../MessageModal';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';
import ProductField from './extra/productfield';
import ProductList from './extra/productlist';
import { useSupplier } from './extra/SupplierDataProvider';
import Purchase from './Purchase';
import Loading from '../Loading';
import { useTranslation } from 'react-i18next';
import '../../assets/i18n/i18n';
import DocumentPicker from 'react-native-document-picker';
import Collapsible from 'react-native-collapsible';

import { RNCamera } from 'react-native-camera';

const Stack = createNativeStackNavigator();

import axios from 'axios';
import { nullLiteralTypeAnnotation } from '@babel/types';
import RNFetchBlob from 'rn-fetch-blob';
import { set } from 'react-native-reanimated';
import {
  deleteCategories,
  deleteProducts,
  insertCategories,
  insertProduct,
} from '../../localDatabase/products';

String.prototype.replaceAllTxt = function replaceAll(search, replace) {
  return this.split(search).join(replace);
};

const requestStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'App needs access to your storage to download files.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Storage permission granted');
    } else {
      console.log('Storage permission denied');
    }
  } catch (error) {
    console.error(error);
  }
};
const Product = ({ navigation }) => {
  const RemoveToken = () => {
    EncryptedStorage.removeItem('secure_token');
  };

  const renderCount = useRef(0);

  const { t, i18n } = useTranslation();

  const [apmodal, setapmodal] = useState(false);
  const [cmodal, setcmodal] = useState(false);
  const [pmodal, setpmodal] = useState(false);

  const onOpenAndCloseAPModal = useCallback(e => {
    setapmodal(prev => !prev);
  }, []);
  const onClosecmodal = () => setcmodal(false);
  const onClosepmodal = () => setpmodal(false);

  const Category = () => { };
  // let t;
  const [categorytext, setCtext] = useState();

  const [categoryData, setCategoryData] = useState([]);
  const [ProductData, setProductData] = useState([]);
  const [load, setLoad] = useState(false);

  const [isUpload, setIsUpload] = useState(false);

  const GetCategoryFromServer = () => {
    setpRefreshing(true);
    axios.get('/api/categorys/').then(res => {
      deleteCategories();
      let a = [];
      res.data.forEach(item => {
        a.push({ label: item.title, value: item.id, id: item.id });
        insertCategories(item.id, item.title);
      });
      console.log(a);
      setCategoryData(a);
      setpRefreshing(false);
    });
  };

  useEffect(() => {
    if (load === false) {
      setTimeout(() => {
        Load();
      }, 1000);
    }
  }, []);

  const Load = () => {
    GetCategoryFromServer();
    GetProdcutsFromServer();
    setLoad(true);
  };

  const PostCategoryToServer = () => {
    axios
      .post('/api/categorys/', { title: categorytext })
      .then(res => {
        setCtext(null);
        onClosecmodal();
        GetCategoryFromServer();
      })
      .catch(err => a.spe());
  };

  const PostProductsToServer = (pd, pic, barcode = 0) => {
    const d = new FormData();
    d.append('name', pd.name);

    // if pd.price has ,699, 000, 00,

    if (pd.price.includes(',')) {

      let price = pd.price.slice(0, pd.price.indexOf(','));
      let extraprice = pd.price.slice(pd.price.indexOf(',') + 1, pd.price.length);

      d.append('price', price);
      d.append('extraprice', extraprice);

    } else {
      d.append('price', pd.price);
    }


    d.append('cost', pd.cost);
    d.append('qty', pd.qty);

    d.append('category', pd.category);
    if (pd.description) d.append('description', pd.description);

    if (!suppcoll) d.append('supplier_name', pd.supplier);
    d.append('barcode', barcode);
    d.append('pic', pic);

    if (!suppcoll) {
      if (pd.supplier) {
         d.append('supplier_name', pd.supplier);
      }
    }else{
      return a.rqf()
    }

    if (!expcoll) d.append('expiry_date', date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())


    console.log(d);
    setIsUpload(true);

    axios
      .post('/api/products/', d, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(res => {
        onClosepmodal();
        setPdData({
          price: '',
          category: value,
        });
        Load();
        setIsUpload(false);
      })
      .catch(err => {
        console.log(err)
        a.spe()
        setIsUpload(false)
      });
  };

  const PutProductsToServer = (pd, pic, id, date, expcoll) => {
    setIsUpload(true);
    const d = new FormData();
    d.append('id', id);
    d.append('name', pd.name);

    if (pd.price.includes(',')) {

      let price = pd.price.slice(0, pd.price.indexOf(','));
      let extraprice = pd.price.slice(pd.price.indexOf(',') + 1, pd.price.length);

      d.append('price', price);
      d.append('extraprice', extraprice);
    } else {

      d.append('price', pd.price);
    }
    d.append('cost', pd.cost);
    d.append('qty', pd.qty);

    d.append('category', pd.category);
    if (pd.description) d.append('description', pd.description);
    d.append('barcode', pd.barcode);
    d.append('pic', pic);

    if (!expcoll) d.append('expiry_date', date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())


    console.log(d);

    axios
      .put('/api/products/', d, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(res => {
        onClosepmodal();
        setPdData({
          price: '',
          category: value,
        });
        Load();
        setIsUpload(false);
      })
      .catch(err => a.spe());
  };

  const GetProdcutsFromServer = () => {
    setpRefreshing(true);
    axios
      .get('/api/products/', pdtData)
      .then(res => {
        deleteProducts();
        setProductData(res.data);

        res.data.forEach((item, index) => {
          insertProduct(
            item.id,
            item.name,
            item.price,
            item.cost,
            item.qty,
            item.date,

            item.description,
            item.category,
            item.pic,
            1,
            item.barcode,
          );
        });

        setpRefreshing(false);
        setSp(res.data);
      })
      .catch(err => a.spe());
  };

  const RequestExcelFomrat = async () => {
    requestStoragePermission();
    const { dirs } = RNFetchBlob.fs;
    const pathToWrite = `${dirs.DownloadDir}/Products.xlsx`;

    // User fetch url from axios.defualts.baseURL also auth token headers

    RNFetchBlob.config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: pathToWrite,
        description: 'Excel File',
        mime: 'application/octet-stream',
        mediaScannable: true,
      },
    })
      //Use axios.defaults.baseURL
      .fetch('GET', axios.defaults.baseURL + '/api/excelproductreport/', {
        //Use authorization from axios.defaults.ex
        Authorization: axios.defaults.headers.common['Authorization'],
        'Content-Type': 'application/json',
      })
      .then(res => {
        console.log('The file saved to ', res.path());
        ToastAndroid.show('File Saved to ' + res.path(), ToastAndroid.SHORT);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const [selectItem, setSelectedItem] = useState();

  const [open, setOpen] = useState(false); //#DropDrwonPicker
  const [dopen, setDopen] = useState(false); //DatePicker
  const [value, setValue] = useState(1);

  const [date, setDate] = useState(new Date());
  const [isImage, setImage] = useState();
  const LaunchCamera = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permisions',
          message: 'This app needs camera permsions to take photo',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        let options = {
          storageOptions: {
            skipBackup: true,
            path: 'images',
          },
        };

        ImagePicker.launchCamera(options, res => {
          console.log('Response = ', res);
          if (res.didCancel) {
            console.log('User cancelled image picker');
          } else if (res.error) {
            console.log('ImagePicker Error: ', res.error);
          } else if (res.customButton) {
            console.log('User tapped custom button: ', res.customButton);
            alert(res.customButton);
          } else {
            const source = {
              uri: res.assets[0].uri,
              name: res.assets[0].fileName,
              type: res.assets[0].type,
            };
            setImage(source);
            console.log(source, 'The ending...');
          }
        });
      } else {
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const launchImageLibrary = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.launchImageLibrary(options, response => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        alert(response.customButton);
      } else {
        const source = {
          uri: response.assets[0].uri,
          name: response.assets[0].fileName,
          type: response.assets[0].type,
        };

        setImage(source);
        console.log(source, 'The ending...');
      }
    });
  };
  const [pdtData, setPdData] = useState({
    cost: '',
    price: '',
    category: value,
  });

  console.log(pdtData);

  const onHandlePdtData = (e, name) => {
    const temp = { ...pdtData, [name]: e };

    console.log(temp);
    setPdData(temp);
  };

  const CategoryToText = id => {
    if (ProductData && categoryData) {
      const c = categoryData.filter(item => item.value == id);

      return c[0] ? c[0].label : '...';
    }
    return '...';
  };

  const SumProductBalance = pd => {
    let price = 0;
    pd.forEach(item => {
      let cost = parseInt(
        item.cost.replaceAllTxt(',', '').replaceAllTxt(' ', ''),
      );
      //if cost is NaN then set cost to 0

      if (isNaN(cost)) {
        cost = 0;
      }

      price += cost * parseInt(item.qty);
    });

    return price;
  };

  const [prefreshing, setpRefreshing] = useState(false);
  const [sp, setSp] = useState(ProductData);

  const [selectable, setSelectable] = useState(false);

  const SearchProducts = text => {
    const data = ProductData.filter(e => {
      console.log(e.name);
      console.log(text);
      console.log(e.name === text);
      var b = e.name.replaceAllTxt(' ', '').toLowerCase();

      var f = e.description
        ? e.description.replaceAllTxt(' ', '').toLowerCase()
        : '';
      var d = CategoryToText(e.category).replaceAllTxt(' ', '').toLowerCase();
      var barcode = e.barcode;
      var c = text.replaceAllTxt(' ', '').toLowerCase();

      return (
        b.includes(c) ||
        d.includes(c) ||
        f.includes(c) ||
        c.includes(e.id) ||
        c.includes(barcode)
      );
    });

    setSp(data);
  };

  const [filtershow, setFilterShow] = useState(false);

  const onCloseFiltershow = () => {
    setFilterShow(false);
  };

  const SelectProductItem = () => { };

  const ProductView = React.memo(({ navigation }) => {
    console.log('product view');
    const [showed, setShowed] = useState(false);
    const [editpd, seteditpd] = useState();

    const [isImage, setImage] = useState(null);


    const [date, setDate] = useState(new Date());
    const [expcoll, setExpcoll] = useState(false);
    const LaunchCamera = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permisions',
            message: 'This app needs camera permsions to take photo',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          let options = {
            storageOptions: {
              skipBackup: true,
              path: 'images',
            },
          };

          ImagePicker.launchCamera(options, res => {
            console.log('Response = ', res);
            if (res.didCancel) {
              console.log('User cancelled image picker');
            } else if (res.error) {
              console.log('ImagePicker Error: ', res.error);
            } else if (res.customButton) {
              console.log('User tapped custom button: ', res.customButton);
              alert(res.customButton);
            } else {
              const source = {
                uri: res.assets[0].uri,
                name: res.assets[0].fileName,
                type: res.assets[0].type,
              };
              setImage(source);
              console.log(source, 'The ending...');
            }
          });
        } else {
        }
      } catch (err) {
        console.warn(err);
      }
    };

    const launchImageLibrary = () => {
      let options = {
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };

      ImagePicker.launchImageLibrary(options, response => {
        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
          alert(response.customButton);
        } else {
          const source = {
            uri: response.assets[0].uri,
            name: response.assets[0].fileName,
            type: response.assets[0].type,
          };

          setImage(source);
          console.log(source, 'The ending...');
        }
      });
    };

    const [selectedItemId, setSelectedItemId] = useState([]);

    // Add to selected id, if id is already in selected id, remove it from selected id
    const onSelect = itemId => {
      if (selectedItemId.includes(itemId)) {
        setSelectedItemId(selectedItemId.filter(id => id !== itemId));
      } else {
        setSelectedItemId([...selectedItemId, itemId]);
      }
    };

    const ExportBarcode = async selectedItemsIds => {
      console.log(JSON.stringify(selectedItemsIds), 'SelectedItemsIds.....');
      requestStoragePermission();
      const { dirs } = RNFetchBlob.fs;
      const pathToWrite = `${dirs.DownloadDir}/Products_BarCodeData.pdf`;

      RNFetchBlob.config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: pathToWrite,
          description: 'PDF File',
          mime: 'application/pdf',
          mediaScannable: true,
          appendExt: 'pdf',
        },
      })
        .fetch(
          'GET',
          axios.defaults.baseURL +
          '/api/exportbarcode/?sid=' +
          JSON.stringify(selectedItemsIds),
          {
            'Content-Type': 'application/json',
            Authorization: axios.defaults.headers.common['Authorization'],
          },
        )
        .then(res => {
          console.log(res);
          ToastAndroid.show('Downloaded', ToastAndroid.SHORT);
        })
        .catch(err => console.log(err));
      // Use axios.defaults.baseURL
    };

    const PDITEM = ({ item }) => {
      if (selectable) {
        return (
          <TouchableOpacity
            key={item.id}
            style={{
              flex: 1,
              backgroundColor: '#f0f0f0',
              padding: 10,
              margin: 5,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 15,
              borderWidth: selectedItemId.includes(item.id) ? 2 : 0,
              borderColor: selectedItemId.includes(item.id)
                ? 'blue'
                : 'transparent',
            }}
            onPress={() => {
              if (selectedItemId.includes(item.id)) {
                setSelectedItemId(selectedItemId.filter(id => id !== item.id));
              } else {
                setSelectedItemId([...selectedItemId, item.id]);
              }
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text style={{ ...s.bold_label, fontSize: 15 }}>{item.name}</Text>
              <Text style={{ ...s.bold_label, fontSize: 15 }}>
                {numberWithCommas(item.price)} Ks
              </Text>

            </View>
            {selectedItemId.includes(item.id) ? (
              <View style={{ marginLeft: 20 }}>
                <Icons name={'checkmark-circle'} size={30} color={'blue'} />
              </View>
            ) : (
              <View style={{ marginLeft: 20 }}>
                <Icons
                  name={'checkmark-circle-outline'}
                  size={30}
                  color={'blue'}
                />
              </View>
            )}
          </TouchableOpacity>
        );
      } else {
        return (
          <View
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
              <Text
                style={{
                  ...s.normal_label,
                  backgroundColor: C.bluecolor,
                  color: 'white',
                  padding: 3,
                  borderRadius: 15,

                  marginTop: 5,
                }}>
                {CategoryToText(item.category)}
              </Text>


              <Text style={{ ...s.bold_label, fontSize: 15, marginTop: 5 }} ellipsizeMode="tail">
                {numberWithCommas(item.price)} Ks
                {item.extraprice ? item.extraprice.map((e, i) => {
                  return <Text key={i} style={{ ...s.bold_label, fontSize: 15, marginTop: 5 }}>
                    | {numberWithCommas(e.extraprice)} Ks
                  </Text>
                }) : null}
              </Text>
              <Text style={{ ...s.normal_label, fontSize: 12, marginTop: 5 }}>
                barcode : {item.barcode}
              </Text>
              {item.expiry_date && <Text style={{ ...s.bold_label, fontSize: 12, marginTop: 5 }}>
                Expire Date :     {new Date(item.expiry_date).toLocaleDateString()}
              </Text>}
            </View>
            <View style={{ position: 'absolute', right: 5, top: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowed(true);
                  seteditpd(item);
                  if (item.expiry_date !== null) {
                    console.log(item.expiry_date)
                    setDate(new Date(item.expiry_date))
                    setExpcoll(false)
                  } else {
                    setExpcoll(true)

                  }
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
      }
    };

    const onCloseShow = () => {
      setShowed(false);
    };

    const [depdshow, setDepdshow] = useState(false);
    const onCloseDepShow = () => {
      setDepdshow(false);
    };
    const DeleteProducts = id_ => {
      console.log(id_);
      // const fd = new FormData()
      // fd.append('cid',id_)
      axios
        .delete('/api/products/', { data: { id: id_ } })
        .then(res => {
          onCloseShow();
          GetProdcutsFromServer();
          onCloseDepShow();
        })
        .catch(err => console.log(err));
    };

    const [editpdshow, setEditpdshow] = useState(false);

    const onCloseeditpdshow = () => {
      setEditpdshow(false);
      setShowed(false);
    };

    const [open, setOpen] = useState(false); //#DropDrwonPicker

    const [value, setValue] = useState();


    const selectAll = () => {
      if (selectable) {
        if (selectable) {
          if (selectedItemId.length === sp.length) {
            setSelectedItemId([]);
          } else {
            setSelectedItemId(sp.map(item => item.id));
          }
        }
      }
    };

    const EditModal = ({ editpdshow, onCloseeditpdshow, expcol, _date, epd }) => {
      const [expcoll, setExpcoll] = useState(expcol)
      const [d, setd] = useState(_date)
      const [dop, setdop] = useState(false)
      const [editpd, seteditpd] = useState(epd)
      const [editbarcodemodal, seteditBarCodeModal] = useState(false);
      const onCloseeditBarCodeModal = () => seteditBarCodeModal(false);

      useEffect(() => {
        let data = epd;
        if (data?.extraprice?.length > 0) {
          let temp = { ...data, price: data.price + ',' + data?.extraprice.map(e => e.extraprice) }
          seteditpd(temp)
        } else {
          seteditpd(data)
        }

      }, [epd])


      const onHandleEPdtData = (e, name) => {
        const temp = { ...editpd, [name]: e };

        console.log(temp, '');
        seteditpd(temp);
      };


      return (
        <>
          <MessageModalNormal
            show={editpdshow}
            onClose={onCloseeditpdshow}
            width={'100%'}
            nobackExit={true}>
            <ScrollView style={{}}>
              {/*Edit Image Here by commething this code  */}
              {/* <View
                style={{
                  backgroundColor: C.bluecolor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  borderRadius: 15,
                }}>
                <Image
                  source={{
                    uri: isImage
                      ? isImage.uri
                      : 'https://www.pngitem.com/pimgs/m/27-272007_transparent-product-icon-png-product-vector-icon-png.png',
                  }}
                  style={{ width: '100%', height: 180, backgroundColor: 'black' }}
                />

                <View style={{ ...s.flexrow_aligncenter_j_between }}>
                  <TouchableOpacity onPress={() => LaunchCamera()}>
                    <Icons
                      name={'camera'}
                      size={30}
                      color={'#fff'}
                      style={{ margin: 5 }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => launchImageLibrary()}>
                    <Icons
                      name={'image'}
                      size={30}
                      color={'#fff'}
                      style={{ margin: 5 }}
                    />
                  </TouchableOpacity>
                </View>
              </View> */}

              <View style={{ marginTop: 10 }}>
                <Text style={{ ...s.bold_label }}>{t('ProductName')}</Text>
                <TextInput
                  style={{
                    padding: 10,
                    fontSize: 16,
                    fontWeight: '900',

                    ...inputS,
                  }}
                  placeholder={'Product Name'}
                  autoFocus={true}
                  defaultValue={editpd.name}
                  onChangeText={e => onHandleEPdtData(e, 'name')}
                />
                <Text style={{ ...s.bold_label }}>{t('BarCode')}</Text>
                <View
                  style={{
                    ...inputS,
                    ...s.flexrow_aligncenter_j_between,
                    padding: 0,
                    paddingLeft: 10,
                  }}>
                  <TextInput
                    style={{
                      flex: 1,
                      // backgroundColor: 'red',
                      ...s.bold_label,
                      color: '#0f0f0f',
                    }}
                    value={editpd.barcode}
                    onChangeText={e => onHandleEPdtData(e, 'barcode')}
                    placeholder={'Barcode ID'}
                  />
                  <TouchableOpacity
                    style={{ padding: 10 }}
                    onPress={() => seteditBarCodeModal(true)}>
                    <Icons name={'barcode'} size={20} color={'#000'} />
                  </TouchableOpacity>

                </View>
                <Text style={{ ...s.bold_label }}>{t('Category')}</Text>
                <DropDownPicker
                  open={open}
                  value={editpd.category}
                  items={categoryData.reverse()}
                  setOpen={setOpen}
                  setValue={setValue}
                  setItems={setCategoryData}
                  autoScroll
                  listMode={'SCROLLVIEW'}
                  style={{
                    ...inputS,
                    backgroundColor: 'transparent',
                  }}
                  onSelectItem={item => {
                    onHandleEPdtData(item.value, 'category');
                  }}
                />
                <Text style={{ ...s.bold_label, marginTop: 5 }}>
                  {t('Quantity')}
                </Text>
                <TextInput
                  style={{
                    padding: 10,
                    fontSize: 16,
                    fontWeight: '900',

                    ...inputS,
                  }}
                  placeholder={'Qty'}
                  keyboardType={'number-pad'}
                  defaultValue={editpd.qty}
                  onChangeText={e =>
                    onHandleEPdtData(e.replaceAllTxt(' ', ''), 'qty')
                  }
                />
                <Text style={{ ...s.bold_label, marginTop: 5 }}>
                  {t('Price4')}
                </Text>
                <TextInput
                  style={{
                    padding: 10,
                    fontSize: 16,
                    fontWeight: '900',

                    ...inputS,
                  }}
                  placeholder={t('Price4')}
                  keyboardType={'number-pad'}
                  defaultValue={editpd.price}
                  onChangeText={e =>
                    onHandleEPdtData(e.replaceAllTxt(' ', ''), 'price')
                  }
                />
                <Text style={{ ...s.bold_label, marginTop: 5 }}>
                  {t('Price5')}
                </Text>
                <TextInput
                  style={{
                    padding: 10,
                    fontSize: 16,
                    fontWeight: '900',

                    ...inputS,
                  }}
                  placeholder={t('Price5')}
                  keyboardType={'number-pad'}
                  defaultValue={editpd.cost}
                  onChangeText={e =>
                    onHandleEPdtData(e.replaceAllTxt(' ', ''), 'cost')
                  }
                />


                <TouchableOpacity
                  onPress={() => {
                    setExpcoll(!expcoll)
                    if (expcoll) {
                      setdop(true)
                    }
                  }}

                  style={{ ...s.flexrow_aligncenter, marginTop: 8 }}>
                  <Text style={{ ...s.bold_label, marginTop: 8 }}>{t('Expiry Date')}</Text>
                  <Icons
                    name={
                      expcoll ? 'checkmark-circle-outline' : 'checkmark-circle'
                    }
                    size={20}
                    color="#000"
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>

                <Collapsible collapsed={expcoll}>
                  <View
                    style={{
                      ...inputS,
                      ...s.flexrow_aligncenter_j_between,
                      padding: 0,
                      paddingLeft: 10,
                    }}>
                    <TextInput
                      style={{
                        ...s.bold_label,
                        color: '#0f0f0f',
                      }}
                      placeholder={'Date'}
                      value={d?.toLocaleDateString()}
                      defaultValue={editpd.expiry_date ? new Date(editpd.expiry_date).toLocaleDateString() : null}
                    />
                    <TouchableOpacity onPress={() => setdop(true)}>
                      <Icons name={'calendar'} size={20} color={'#000'} />
                    </TouchableOpacity>
                    <DatePicker
                      modal
                      open={dop}
                      date={d}
                      mode={'date'}
                      onConfirm={date => {
                        setdop(false);
                        setd(date);
                        onHandleEPdtData(date, 'expiry_date')
                      }}
                      onCancel={() => {
                        setdop(false);
                      }}
                    />
                  </View>
                </Collapsible>

                <Text style={{ ...s.bold_label, marginTop: 5 }}>
                  {t('Description')}
                </Text>
                <TextInput
                  style={{
                    padding: 10,
                    fontSize: 16,
                    fontWeight: '900',
                    ...inputS,
                    height: 100,
                    textAlign: 'auto',
                  }}
                  placeholder={'Description'}
                  multiline
                  defaultValue={editpd.description}
                  onChangeText={e => onHandleEPdtData(e, 'description')}
                />

                <TouchableOpacity
                  disabled={isUpload}
                  onPress={() => {
                    if (
                      editpd.name &&
                      editpd.category &&
                      editpd.price &&
                      editpd.qty
                    ) {
                      PutProductsToServer(editpd, isImage, editpd.id, d, expcoll);
                    } else {
                      a.rqf();
                    }
                  }}>
                  <View
                    style={{
                      ...s.flexrow_aligncenter_j_center,
                      padding: 10,
                      ...s.blue_button,
                    }}>
                    <Text style={{ ...s.font_bold, color: 'white', padding: 10 }}>
                      {t('Edit_Product')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>

          </MessageModalNormal>
          <BarcodeScanner
            onBarcodeRead={barcodeData => {
              onHandleEPdtData(barcodeData, 'barcode');
              Vibration.vibrate(100);
              onCloseeditBarCodeModal();
            }}
            show={editbarcodemodal}
            onClose={onCloseeditBarCodeModal}
            style={{
              zIndex: 999999
            }}
          /></>
      )
    }

    return (
      <View style={{ flex: 1 }}>


        <MessageModalNormal
          show={depdshow}
          onClose={onCloseDepShow}
          width={'95%'}>
          <View style={{ justifyContent: 'center' }}>
            <View style={{}}>
              <Text style={{ ...s.bold_label, marginBottom: 5 }}>
                {t('ASWDP')}
                {' \n'}
                {editpd ? editpd.name : ''}
              </Text>
              <Text style={{ ...s.normal_label }}>{t('ASWDP2')}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                DeleteProducts(editpd.id);
              }}>
              <View
                style={{
                  ...s.flexrow_aligncenter,
                  padding: 10,
                  backgroundColor: 'red',
                  borderRadius: 15,
                }}>
                <Icons name={'trash'} size={30} color={'#fff'} />
                <Text style={{ ...s.bold_label, marginLeft: 5, color: 'white' }}>
                  {t('DPAnyway')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setDepdshow(false);
              }}>
              <View
                style={{
                  ...s.flexrow_aligncenter,
                  padding: 10,
                  backgroundColor: '#32a852',
                  borderRadius: 15,
                  marginTop: 5,
                }}>
                <Icons name={'close'} size={30} color={'#fff'} />
                <Text style={{ ...s.bold_label, marginLeft: 5, color: 'white' }}>
                  {t('Cancel')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </MessageModalNormal>
        <MessageModalNormal show={showed} onClose={onCloseShow}>
          <View style={{ justifyContent: 'center' }}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ ...s.bold_label, marginBottom: 5 }}>
                {editpd ? editpd.name : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setEditpdshow(true);
              }}>
              <View
                style={{
                  ...s.flexrow_aligncenter,
                  padding: 20,
                  backgroundColor: C.bluecolor,
                  borderRadius: 15,
                  marginBottom: 8,
                }}>
                <Icons name={'create-outline'} size={30} color={'#fff'} />
                <Text
                  style={{
                    ...s.bold_label,
                    marginLeft: 5,
                    color: 'white',
                    fontSize: 22,
                  }}>
                  {t('Edit_Product')}
                </Text>
              </View>
            </TouchableOpacity>
            {/*   <TouchableOpacity
              onPress={() => {
                ExportBarcode([editpd.id]);
                onCloseShow();
              }}>
              <View
                style={{
                  ...s.flexrow_aligncenter,
                  padding: 15,
                  backgroundColor: C.bluecolor,
                  borderRadius: 15,
                  marginBottom: 8,
                }}>
                <Icons name={'barcode-outline'} size={30} color={'#fff'} />
                <Text
                  style={{
                    ...s.bold_label,
                    marginLeft: 5,
                    color: 'white',
                    fontSize: 22,
                  }}>
                  Export BarCode
                </Text>
              </View>
            </TouchableOpacity>
                */}
            <TouchableOpacity
              onPress={() => {
                setDepdshow(true);
              }}>
              <View
                style={{
                  ...s.flexrow_aligncenter,
                  padding: 10,
                  backgroundColor: 'red',
                  borderRadius: 15,
                }}>
                <Icons name={'trash'} size={30} color={'#fff'} />
                <Text style={{ ...s.bold_label, marginLeft: 5, color: 'white' }}>
                  {t('Delete_Product')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </MessageModalNormal>

        {isArrayhasData(sp) ? (
          <View>
            {selectable ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                }}>
                <TouchableOpacity onPress={selectAll}>
                  <View
                    style={{
                      ...s.flexrow_aligncenter_j_center,
                      padding: 10,
                      ...s.blue_button,
                    }}>
                    <Text>
                      {selectedItemId.length === sp.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </Text>
                  </View>
                </TouchableOpacity>
                <Text style={{ ...s.bold_label, fontSize: 20 }}>
                  {selectedItemId.length} selected
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    ExportBarcode(selectedItemId);
                    setSelectable(prev => !prev);
                  }}>
                  <View
                    style={{
                      ...s.flexrow_aligncenter_j_center,
                      padding: 10,
                      ...s.blue_button,
                    }}>
                    <Text>Export BarCode</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectable(prev => !prev);
                  }}>
                  <View
                    style={{
                      ...s.flexrow_aligncenter_j_center,
                      padding: 10,
                      ...s.black_button,
                      backgroundColor: 'red',
                    }}>
                    <Icons name="close" size={15} color={'white'} />
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}
            <FlatList
              refreshControl={
                <RefreshControl
                  refreshing={prefreshing}
                  onRefresh={GetProdcutsFromServer}
                />
              }
              style={{ backgroundColor: C.white }}
              data={sp}
              renderItem={PDITEM}
              keyExtractor={i => i.id}
            />
          </View>
        ) : (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'black', fontWeight: 'bold' }}>
              No Products, Click + Button to add products
            </Text>
          </View>
        )}
        {editpd ? <EditModal epd={editpd} editpdshow={editpdshow} onCloseeditpdshow={onCloseeditpdshow} expcol={expcoll} _date={date} /> : null}

      </View>
    );
  });

  const CategoryView = React.memo(({ navigation }) => {

    const [showmodal, setShowModal] = useState(false);
    const [editCategory, seteditCategory] = useState();
    const [refreshing, setRefreshing] = useState(false);

    const [title, setTitle] = useState('');


    const DeleteFromServer = (id) => {
      setRefreshing(true)
      axios.delete('/api/categorys/?id=' + id).then((res) => {
        console.log(res)
        setRefreshing(false);
        GetCategoryFromServer();
        GetProdcutsFromServer();
      }).catch(res => {
        setRefreshing(false);
      })
    }

    const UpdateCategoryToServer = (data) => {
      setRefreshing(true);
      axios.put('/api/categorys/', data).then(res => {
        setRefreshing(false);
        GetCategoryFromServer();

      }).catch(err => {
        setRefreshing(false);
      })

    }


    const DeleteCategory = (id) => {
      Alert.alert('Delete', "Are you sure you want to delete this category? If you delete a category, its associated items will also be deleted", [
        {
          text: 'Yes',
          onPress: () => {
            DeleteFromServer(id)
          }
        },
        {
          text: 'No',
          onPress: () => {

          }
        }
      ])
    }



    const CATITEM = ({ item }) => {
      return (
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#f0f0f0',
            padding: 10,
            margin: 5,
            borderRadius: 15,
          }}
          onPress={() => {
            console.log(item)
            seteditCategory(item);
            setShowModal(true);
            setTitle(item.label)
          }}
        >
          <Text style={{ ...s.bold_label }}>{item.label}</Text>
        </TouchableOpacity>
      );
    };

    const PDDITEM = ({ item }) => {
      return (
        <View
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
            <Text style={{ ...s.normal_label, fontSize: 12, marginTop: 5 }}>
              barcode : {item.barcode}
            </Text>
            {item.expiry_date && <Text style={{ ...s.bold_label, fontSize: 12, marginTop: 5 }}>
              Expire Date :     {new Date(item.expiry_date).toLocaleDateString()}
            </Text>}
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

    const RelatedProducts = React.useMemo(() => {
      console.log(editCategory?.id)
      if (ProductData && editCategory) {
        return ProductData.filter((item) => item.category == editCategory?.id)
      }
    }, [showmodal, editCategory, ProductData])

    const RelatedProductsModel = () => {
      return (
        <MessageModalNormal show={showmodal} onClose={() => setShowModal(false)} width={'95%'} height={'96%'}>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={{ ...s.defaultTextInput, flex: 1 }}
              defaultValue={editCategory?.label}
              onChangeText={(e) => {
                setTitle(e)
              }}

            />
            <TouchableOpacity
              onPress={() => {
                DeleteCategory(editCategory?.id)
              }}
              style={{ ...s.blue_button, marginLeft: 'auto', backgroundColor: 'red', flexDirection: 'row', alignItems: 'center' }}>
              <Icons name="trash-outline" color="#fff" size={20} />
              <Text style={{ ...s.bold_label, color: 'white' }}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ ...s.blue_button, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => {
                UpdateCategoryToServer({
                  id: editCategory?.id,
                  title: title,
                })
              }}
            >
              <Icons name="pencil" color="#fff" size={20} />

              <Text style={{ ...s.bold_label, color: 'white' }}>Update</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ marginLeft: "auto", ...s.normal_label }}>{RelatedProducts?.length} items</Text>
          <FlatList
            data={RelatedProducts}
            refreshControl={
              <RefreshControl
                refreshing={prefreshing}
                onRefresh={GetProdcutsFromServer}
              />
            }
            renderItem={PDDITEM}
            keyExtractor={i => i.id}
          />
        </MessageModalNormal>
      )
    }


    return (
      <View>
        <Loading show={refreshing} />
        {RelatedProductsModel()}
        {isArrayhasData(categoryData) ? (
          <FlatList
            data={categoryData.reverse()}
            refreshControl={
              <RefreshControl
                refreshing={prefreshing}
                onRefresh={GetCategoryFromServer}
              />
            }
            renderItem={CATITEM}
            keyExtractor={i => i.id}
            style={{ backgroundColor: 'white' }}
          />
        ) : (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'black', fontWeight: 'bold' }}>
              No Category, Click + Button to add category
            </Text>
          </View>
        )}
      </View>
    );
  });

  const [isImporting, setIsImporting] = useState(false);

  const handleExcelImport = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to download files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const res = await DocumentPicker.pick({
          type: [DocumentPicker.types.xls, DocumentPicker.types.xlsx],
        });
        console.log(res);
        let data = new FormData();

        const source = {
          uri: res[0].uri,
          name: res[0].name,
          type: res[0].type,
        };

        data.append('file', source);

        setIsImporting(true);
        axios
          .post('/api/excelproductreport/', data, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then(res => {
            console.log(res.data);
            setIsImporting(false);
            onOpenAndCloseAPModal();
            Load();
          })
          .catch(err => {
            setIsImporting(false);
            onOpenAndCloseAPModal();
          });
      } else {
        console.log('Storage permission denied');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [focusView, setFocusView] = useState('p');

  const SortProduct = type => {
    const temp_product = [...sp];
    if (type === 'name')
      temp_product.sort((p1, p2) => (p1.name > p2.name ? 1 : -1));
    if (type === 'qty') temp_product.sort((p1, p2) => p1.qty - p2.qty);
    if (type === 'price') temp_product.sort((p1, p2) => p1.price - p2.price);
    setSp(temp_product);
    onCloseFiltershow();
  };

  const onBarCodeRead = barcodeData => {
    // console.log(e, parseInt(e));
    // const barcodeID = parseInt(barcodeData);
    const product = ProductData.filter(item => item.barcode == barcodeData);

    if (product.length > 0) {
      console.log('Product found:', product, barcodeData);
      Vibration.vibrate(100); // Vibrate for 500 milliseconds
      setSp(product);
      onCloseBarCodeModal();
    } else {
      console.log('Product not found');
    }
  };
  const [barcodemodal, setBarCodeModal] = useState(false);

  const onCloseBarCodeModal = () => setBarCodeModal(false);

  const [changePriceShow, setChangePriceShow] = useState(false);
  const [changePrice, setChangePrice] = useState('');
  const [addbarcodemodal, setaddBarCodeModal] = useState(false);

  const onCloseaddBarCodeModal = () => setaddBarCodeModal(false);

  const [scannedbarcode, setScannedBarcode] = useState(0);

  const ChangePrice = data => {
    axios
      .put('api/products/changewithperentage/', data)
      .then(res => {
        console.log(res.data);
        Load();
      })
      .catch(err => console.log(err));
    setChangePriceShow(false);
    onOpenAndCloseAPModal();
  };

  const { supplierData, loading, getSupplierData } = useSupplier();
  const [showSupplier, setShowSupplier] = useState(false);
  const [selectedSupplier, setselectedSupplier] = useState('');
  const [suppcoll, setsuppcoll] = useState(true);

  useEffect(() => {
    getSupplierData();
  }, []);

  const onSelectedSupplier = name => {
    onHandlePdtData(name, 'supplier');
    setselectedSupplier(name);
  };

  const [expcoll, setExpcoll] = useState(true)


  return (
    <View style={{ ...s.Container }}>
      <Loading show={isUpload} infotext={'Creating Product'} />
      <Loading show={isImporting} infotext={'Importing Product from Excel'} />
      <MessageModalNormal show={filtershow} onClose={onCloseFiltershow}>
        <View>
          <Text style={{ ...s.bold_label }}>Sort Product</Text>
          <View>
            <TouchableOpacity
              onPress={() => {
                SortProduct('name');
              }}
              style={{ ...s.blue_button, marginTop: 8, padding: 10 }}>
              <Text style={{ ...s.bold_label, color: 'white' }}>
                Sort By Name
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                SortProduct('qty');
              }}
              style={{ ...s.blue_button, marginTop: 8, padding: 10 }}>
              <Text style={{ ...s.bold_label, color: 'white' }}>Sort By Qty</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                SortProduct('price');
              }}
              style={{ ...s.blue_button, marginTop: 8, padding: 10 }}>
              <Text style={{ ...s.bold_label, color: 'white' }}>
                Sort By Price
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </MessageModalNormal>

      <MessageModalNormal show={cmodal} onClose={onClosecmodal}>
        <View>
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
              placeholder={t('Category')}
              autoFocus={true}
              value={categorytext}
              onChangeText={e => setCtext(e)}
            />
            <TouchableOpacity onPress={() => setCtext(null)}>
              <Icons name={'close-outline'} size={20} color={'#000'} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            disabled={isUpload}
            onPress={() => {
              if (categorytext) {
                PostCategoryToServer();
              } else {
                a.rqf();
              }
            }}>
            <View
              style={{
                ...s.flexrow_aligncenter_j_center,
                padding: 10,
                ...s.blue_button,
              }}>
              <Text style={{ ...s.font_bold, color: 'white', padding: 10 }}>
                {t('Add_Category')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </MessageModalNormal>
      <MessageModalNormal show={apmodal} onClose={onOpenAndCloseAPModal}>
        <View>
          <TouchableOpacity
            onPress={() => {
              setcmodal(true);

              onOpenAndCloseAPModal();
            }}>
            <View style={{ ...s.flexrow_aligncenter, padding: 10 }}>
              <Icons name={'duplicate-outline'} size={30} color={'#000'} />
              <Text style={{ ...s.bold_label, marginLeft: 5 }}>
                {t('Add_Category')}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setpmodal(true);
              setImage(null);
              onOpenAndCloseAPModal();
            }}>
            <View style={{ ...s.flexrow_aligncenter, padding: 10 }}>
              <MIcons
                name={'package-variant-closed'}
                size={30}
                color={'#000'}
              />
              <Text style={{ ...s.bold_label, marginLeft: 5 }}>
                {t('Add_Product')}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleExcelImport();
            }}>
            <View style={{ ...s.flexrow_aligncenter, padding: 10 }}>
              <MIcons name="publish" size={30} color={'#000'} />
              <Text style={{ ...s.bold_label, marginLeft: 5 }}>
                {t('IW_Excel')}
              </Text>
            </View>
          </TouchableOpacity>
          {/*       <TouchableOpacity
            onPress={() => {
              setSelectable(prev => !prev);
              onOpenAndCloseAPModal();
            }}>
            <View style={{...s.flexrow_aligncenter, padding: 10}}>
              <MIcons name="barcode" size={30} color={'#000'} />
              <Text style={{...s.bold_label, marginLeft: 5}}>
                Export Barcode
              </Text>
            </View>
          </TouchableOpacity>*/}
          <TouchableOpacity
            onPress={() => {
              setChangePriceShow(true);
            }}>
            <View style={{ ...s.flexrow_aligncenter, padding: 10 }}>
              <Icons name="pricetags-outline" size={30} color={'#000'} />
              <Text style={{ ...s.bold_label, marginLeft: 5 }}>
                Change Price (%)
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </MessageModalNormal>

      <MessageModalNormal
        show={pmodal}
        onClose={onClosepmodal}
        width={'100%'}
        nobackExit={true}>
        <ScrollView style={{}}>
          {/*Edit Image Here by commething this code  */}
          {/* <View
            style={{
              backgroundColor: C.bluecolor,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              borderRadius: 15,
            }}>
            <Image
              source={{
                uri: isImage
                  ? isImage.uri
                  : 'https://www.pngitem.com/pimgs/m/27-272007_transparent-product-icon-png-product-vector-icon-png.png',
              }}
              style={{ width: '100%', height: 180, backgroundColor: 'black' }}
            />
            <View style={{ ...s.flexrow_aligncenter_j_between }}>
              <TouchableOpacity onPress={() => LaunchCamera()}>
                <Icons
                  name={'camera'}
                  size={30}
                  color={'#fff'}
                  style={{ margin: 5 }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => launchImageLibrary()}>
                <Icons
                  name={'image'}
                  size={30}
                  color={'#fff'}
                  style={{ margin: 5 }}
                />
              </TouchableOpacity>
            </View>
          </View> */}

          <View style={{ marginTop: 10 }}>
            <Text style={{ ...s.bold_label }}>{t('ProductName')}</Text>
            <TextInput
              style={{
                padding: 10,
                fontSize: 16,
                fontWeight: '900',

                ...inputS,
              }}
              placeholder={t('ProductName')}
              autoFocus={true}
              onChangeText={e => onHandlePdtData(e, 'name')}
            />
            <Text style={{ ...s.bold_label }}>{t('BarCode')}</Text>

            <View
              style={{
                ...inputS,
                ...s.flexrow_aligncenter_j_between,
                padding: 0,
                paddingLeft: 10,
              }}>
              <TextInput
                style={{
                  flex: 1,
                  ...s.bold_label,
                  color: '#0f0f0f',
                }}
                value={scannedbarcode}
                onChangeText={e => setScannedBarcode(e)}
                placeholder={'Barcode ID'}
                keyboardType='number-pad'

              />
              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => setaddBarCodeModal(true)}>
                <Icons name={'barcode'} size={20} color={'#000'} />
              </TouchableOpacity>
              <BarcodeScanner
                onBarcodeRead={barcodeData => {
                  setScannedBarcode(barcodeData);
                  Vibration.vibrate(100);
                  onCloseaddBarCodeModal();
                }}
                show={addbarcodemodal}
                onClose={onCloseaddBarCodeModal}
              />
            </View>
            <Text style={{ ...s.bold_label }}>{t('Category')}</Text>
            <DropDownPicker
              open={open}
              value={value}
              items={categoryData.reverse()}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setCategoryData}
              autoScroll
              listMode={'SCROLLVIEW'}
              style={{
                ...inputS,
                backgroundColor: 'transparent',
              }}
              onSelectItem={item => {
                onHandlePdtData(item.value, 'category');
              }}
            />
            <Text style={{ ...s.bold_label, marginTop: 5 }}>{t('Quantity')}</Text>
            <TextInput
              style={{
                padding: 10,
                fontSize: 16,
                fontWeight: '900',

                ...inputS,
              }}
              placeholder={'Qty'}
              keyboardType={'number-pad'}
              onChangeText={e =>
                onHandlePdtData(e.replaceAllTxt(' ', ''), 'qty')
              }
            />
            <Text style={{ ...s.bold_label, marginTop: 5 }}>{t('Price4')}</Text>
            <TextInput
              style={{
                padding: 10,
                fontSize: 16,
                fontWeight: '900',

                ...inputS,
              }}
              placeholder={t('Price4')}
              keyboardType={'number-pad'}
              value={pdtData.price}
              onChangeText={e =>
                onHandlePdtData(e.replaceAllTxt(' ', ''), 'price')
              }
            />
            <Text style={{ ...s.bold_label, marginTop: 5 }}>{t('Price5')}</Text>
            <TextInput
              style={{
                padding: 10,
                fontSize: 16,
                fontWeight: '900',

                ...inputS,
              }}
              placeholder={t('Price5')}
              keyboardType={'number-pad'}
              value={pdtData.cost}
              onChangeText={e =>
                onHandlePdtData(e.replaceAllTxt(' ', ''), 'cost')
              }
            />


            <View>
              <TouchableOpacity
                onPress={() => setsuppcoll(!suppcoll)}
                style={{ ...s.flexrow_aligncenter, marginTop: 8 }}>
                <Text style={{ ...s.bold_label }}>{t('Supplier_Name')}</Text>
                <Icons
                  name={
                    suppcoll ? 'checkmark-circle-outline' : 'checkmark-circle'
                  }
                  size={20}
                  color="#000"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>

              <Collapsible collapsed={suppcoll}>
                <View style={{ ...inputS }}>
                  <TextInput
                    style={{
                      height: 45,
                      ...s.bold_label,
                      color: '#0f0f0f',
                      flex: 1,
                    }}
                    placeholder={t('Supplier_Name')}
                    value={pdtData.supplier}
                    onChangeText={e => onHandlePdtData(e, 'supplier')}
                  />
                  <TouchableOpacity
                    onPress={() => onHandlePdtData('', 'supplier')}>
                    <Icons name="close-outline" size={20} color={'#000'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowSupplier(true)}>
                    <Icons name="people-outline" size={20} color={'#000'} />
                  </TouchableOpacity>
                </View>
              </Collapsible>
            </View>


            <TouchableOpacity
              onPress={() => {
                setExpcoll(!expcoll)
                if (expcoll) {
                  setDopen(true)
                }
              }}

              style={{ ...s.flexrow_aligncenter, marginTop: 8 }}>
              <Text style={{ ...s.bold_label, marginTop: 8 }}>{t('Expiry Date')}</Text>
              <Icons
                name={
                  expcoll ? 'checkmark-circle-outline' : 'checkmark-circle'
                }
                size={20}
                color="#000"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>

            <Collapsible collapsed={expcoll}>
              <View
                style={{
                  ...inputS,
                  ...s.flexrow_aligncenter_j_between,
                  padding: 0,
                  paddingLeft: 10,
                }}>
                <TextInput
                  style={{
                    ...s.bold_label,
                    color: '#0f0f0f',
                  }}
                  placeholder={'Date'}
                  value={date.toLocaleDateString()}
                  defaultValue={date.toLocaleDateString()}
                />
                <TouchableOpacity onPress={() => setDopen(true)}>
                  <Icons name={'calendar'} size={20} color={'#000'} />
                </TouchableOpacity>
                <DatePicker
                  modal
                  open={dopen}
                  date={date}
                  mode={'date'}
                  onConfirm={date => {
                    setDopen(false);
                    setDate(date);
                    onHandlePdtData(date, 'expiry_date')
                  }}
                  onCancel={() => {
                    setDopen(false);
                  }}
                />
              </View>
            </Collapsible>
            <Text style={{ ...s.bold_label, marginTop: 5 }}>
              {t('Description')}
            </Text>
            <TextInput
              style={{
                padding: 10,
                fontSize: 16,
                fontWeight: '900',
                ...inputS,
                height: 100,
                textAlign: 'auto',
              }}
              placeholder={t('Description')}
              multiline
              onChangeText={e => onHandlePdtData(e, 'description')}
            />

            <TouchableOpacity
              disabled={isUpload}
              onPress={() => {
                if (
                  pdtData.name &&
                  pdtData.category &&
                  pdtData.price &&
                  pdtData.cost &&
                  pdtData.qty
                ) {
                  PostProductsToServer(pdtData, isImage, scannedbarcode);
                } else {
                  a.rqf();
                }
              }}>
              <View
                style={{
                  ...s.flexrow_aligncenter_j_center,
                  padding: 10,
                  ...s.blue_button,
                }}>
                <Text style={{ ...s.font_bold, color: 'white', padding: 10 }}>
                  {t('Add_Product')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </MessageModalNormal>
      <MessageModalNormal
        show={changePriceShow}
        onClose={() => setChangePriceShow(false)}>
        <View>
          <Text style={{ ...s.bold_label }}>Change Price (%)</Text>
          <TextInput
            style={{
              padding: 10,
              fontSize: 16,
              fontWeight: '900',
              ...inputS,
            }}
            placeholder={'Perctange'}
            keyboardType={'number-pad'}
            onChangeText={e => setChangePrice(e.replaceAllTxt(' ', ''))}
          />
          <View style={{ ...s.flexrow_aligncenter_j_center }}>
            <TouchableOpacity
              onPress={() => {
                setChangePriceShow(false);
                ChangePrice({ minus_perctange: changePrice });
              }}>
              <View
                style={{
                  ...s.flexrow_aligncenter_j_center,
                  padding: 10,

                  ...s.blue_button,
                  backgroundColor: 'red',
                }}>
                <Icons name="remove-circle-outline" size={30} color={'white'} />
                <Text style={{ ...s.font_bold, color: 'white', padding: 10 }}>
                  Price
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setChangePriceShow(false);
                ChangePrice({ plus_perctange: changePrice });
              }}>
              <View
                style={{
                  ...s.flexrow_aligncenter_j_center,
                  padding: 10,
                  ...s.blue_button,
                }}>
                <Icons name="add-circle-outline" size={30} color={'white'} />
                <Text style={{ ...s.font_bold, color: 'white', padding: 10 }}>
                  Price
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </MessageModalNormal>
      <BarcodeScanner
        onBarcodeRead={onBarCodeRead}
        show={barcodemodal}
        onClose={onCloseBarCodeModal}
      />
      <SupplierListModal
        showSupplier={showSupplier}
        onClose={() => setShowSupplier(false)}
        onApply={onSelectedSupplier}
        suppliername={selectedSupplier}
        supplierData={supplierData}
      />
      {/* appbar */}
      <View
        style={{
          ...s.flexrow_aligncenter_j_between,
          padding: 8,
        }}>
        <Text style={{ ...s.bold_label, fontSize: 23 }}>{t('Products')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ ...s.bold_label }}>
            {numberWithCommas(SumProductBalance(ProductData))} MMK
          </Text>
        </View>
      </View>
      {/* view */}
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
            flex: 1,
            fontWeight: '900',
          }}
          placeholder={t('Search_Products')}
          onChangeText={e => SearchProducts(e)}
        />

        <Icons name={'search'} size={20} color={'#000'} />
        <TouchableOpacity onPress={() => setBarCodeModal(true)}>
          <Icons
            name={'barcode-outline'}
            size={25}
            color={'#000'}
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>
      <View style={{ ...s.flexrow_aligncenter_j_center }}>
        <TouchableOpacity onPress={() => setFilterShow(true)}>
          <Icons name={'filter'} size={25} color={'#000'} />
        </TouchableOpacity>
        <ScrollView
          style={{ flexDirection: 'row' }}
          horizontal
          showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('p');
              setFocusView('p');
            }}>
            <Text
              style={{
                ...s.normal_label,
                ...s.black_button,
                color: focusView === 'p' ? 'white' : 'black',
                backgroundColor: focusView === 'p' ? C.blackbutton : '#f0f0f0',
                padding: 10,
                borderRadius: 15,
                fontSize: 15,
              }}>
              {t('Products')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('c');
              setFocusView('c');
            }}>
            <Text
              style={{
                ...s.normal_label,
                ...s.black_button,
                color: focusView === 'c' ? 'white' : 'black',
                backgroundColor: focusView === 'c' ? C.blackbutton : '#f0f0f0',
                padding: 10,
                borderRadius: 15,
                fontSize: 15,
              }}>
              {t('Category')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              RequestExcelFomrat();
            }}>
            <Text
              style={{
                ...s.normal_label,
                ...s.black_button,
                color: focusView === 'c' ? 'white' : 'black',
                backgroundColor: focusView === 'c' ? C.blackbutton : '#f0f0f0',
                padding: 10,
                borderRadius: 15,
                fontSize: 15,
              }}>
              Export Excel
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <TouchableOpacity>
          <Text style={{ ...s.bold_label, fontSize: 14, padding: 5 }}>
            {ProductData.length}
          </Text>
        </TouchableOpacity>
      </View>

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={'p'} component={ProductView} />
        <Stack.Screen name={'c'} component={CategoryView} />
      </Stack.Navigator>
      <View
        style={{
          ...s.blue_button,
          borderRadius: 50,
          position: 'absolute',
          bottom: 55,
          right: 20,
          width: 50,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          onPress={() => {
            console.log('apmodal');
            onOpenAndCloseAPModal();
          }}>
          <Icons name={'pencil'} size={25} color={'#fff'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Container = ({ navigation }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={'cproduct'} component={Product} />
    </Stack.Navigator>
  );
};

const SupplierListModal = ({
  showSupplier,
  supplierData,
  onClose = {},
  suppliername,
  onApply,
}) => {
  return (
    <MessageModalNormal show={showSupplier} onClose={onClose}>
      <Text style={{ ...s.bold_label, marginBottom: 10 }}>Select Supplier</Text>
      <ScrollView style={{ maxHeight: Dimensions.get('window').height - 10 }}>
        {supplierData.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              onClose();
              onApply(item.name);
            }}
            style={{
              ...s.flexrow_aligncenter_j_between,
              padding: 10,
              borderColor: item.name == suppliername ? C.bluecolor : 'black',
              borderWidth: 1,
              borderRadius: 5,
              marginBottom: 10,
            }}>
            <Text style={{ ...s.bold_label }}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </MessageModalNormal>
  );
};

export default Container;

const BarcodeScanner = ({ onBarcodeRead, onClose, show, style }) => {
  const onBarCodeRead = e => {
    onBarcodeRead(e.data);
    // onClose();
  };

  return (
    <Modal visible={show} onRequestClose={onClose} style={style}>
      <View style={{ flex: 1 }}>

        <RNCamera
          style={{ flex: 1, width: '100%', height: '100%' }}
          onBarCodeRead={onBarCodeRead}
          captureAudio={false}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          width: '100%',
          height: Dimensions.get('window').height,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={IMAGE.scan_barcode}
          style={{ width: '80%', height: 100 }}
          objectFit={'contain'}
        />
        <Text style={{ color: 'white' }}>Scan BarCode from Products</Text>
      </View>
    </Modal>
  );
};

const inputS = {
  ...s.flexrow_aligncenter_j_between,
  borderRadius: 15,
  height: 45,
  borderColor: 'black',
  borderWidth: 1.5,
  paddingRight: 10,
  marginTop: 10,
};
