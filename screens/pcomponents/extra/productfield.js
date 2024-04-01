/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  RefreshControl,
  Button,
  ScrollView,
  KeyboardAvoidingView,
  KeyboardAvoidingViewBase,
  ActivityIndicator,
} from 'react-native';
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
import SwitchToCart from './SwitchToCart';
import PDITEM from './pditem';
import {CartContext} from '../context/CartContext';
import {ProductsContext} from '../context/ProductContext';
import BarCodeToCart from '../sales/AddWithBarCode';
import CartView from '../sales/EditCartList';
import {
  deleteCategories,
  deleteProducts,
  getAllCategories,
  getAllProducts,
  insertCategories,
  insertProduct,
} from '../../../localDatabase/products';
import {useNetInfo} from '@react-native-community/netinfo';
import {set} from 'react-native-reanimated';

const ProductField = ({
  ContainerProps,
  setTotalAmount,
  data,
  setData,
  custom = false,
}) => {
  const [open, setOpen] = useState(false);

  const [load, setLoad] = useState(false);

  const [ProductData, setProductData] = useState();
  const [categoryData, setCategoryData] = useState();

  const [searchtext, setSearchText] = useState('');
  const [categoryId, setCategoryId] = useState('All');
  const [editcartshow, seteditcartshow] = useState(false);

  const {CartData, setCartData} = useContext(CartContext);

  const {isConnected} = useNetInfo();

  const SetOpenModal = () => {
    setOpen(true);
    GetProdcutsFromServer();
    GetCategoryFromServer();
  };

  const GetProdcutsFromServer = async () => {
    setLoad(true);
    if (isConnected) {
      axios
        .get('/api/products/')
        .then(res => {
          deleteProducts();
          res.data.forEach(item => {
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
          res.data = res.data.filter(e => e.qty > 0);
          setProductData(res.data);

          setLoad(false);
        })
        .catch(err => {
          a.spe();
          setLoad(false);
          getProductFromLocal();
        });
    } else {
      getProductFromLocal();
      setLoad(false);

      // console.log('Result ::: ', result);
    }
  };
  const getProductFromLocal = async () => {
    let result = await getAllProducts();
    console.log('Product Result : ', result);
    result = result?.filter(item => item.qty > 0);
    setProductData(result);
  };

  const getCategoryFromLocal = async () => {
    let result = await getAllCategories();
    console.log(result);
    let a = [];
    result.forEach(i => {
      a.push({label: i.title, value: i.id, id: i.id});
    });
    setCategoryData(a);
  };

  const GetCategoryFromServer = () => {
    if (!isConnected) {
      getCategoryFromLocal();
      // console.log('I need result : ', result);
      //setCategoryData(result);
      return;
    }

    axios.get('/api/categorys/').then(res => {
      let a = [];
      deleteCategories();
      res.data.forEach(item => {
        a.push({label: item.title, value: item.id, id: item.id});
        insertCategories(item.id, item.title);
      });
      console.log(a);
      setCategoryData(a);
    });
  };

  const ProductFilter = useMemo(() => {
    if (ProductData && categoryId) {
      const data = ProductData.filter(e => {
        var b = e?.name.replaceAllTxt(' ', '').toLowerCase();
        var c = searchtext.replaceAllTxt(' ', '').toLowerCase();
        var id = e?.barcode?.toString();

        console.log(id);

        return (
          id?.includes(c) ||
          ((categoryId === 'All' ? true : e.category === categoryId) &&
            b.includes(c))
        );
      });
      return data;
    }
    return ProductData;
  }, [searchtext, ProductData, categoryId]);

  console.log('re render Products Field');

  const ProductDataValue = useMemo(
    () => ({ProductData, setProductData}),
    [ProductData, setProductData],
  );

  const [cpriceclick, setCPriceClick] = useState([]);

  const ProductView = () => {
    const SumTotal = useMemo(() => {
      console.log('here');
      if (CartData.length === 0) return 0;

      let amount = 0;
      CartData.forEach(e => {
        amount += parseInt(e.total, 10);
      });
      setTotalAmount(amount);
      return amount;
    }, [CartData, setTotalAmount]);


    const changePrice = (id) => {

      let count = cpriceclick.filter(e => e == id).length;

      setCPriceClick([...cpriceclick, id]);


      let temp = [...CartData];
      let index = temp.findIndex(e => e.name == id);
      console.log(temp[index]);

      temp[index].extraprice.push({ extraprice: temp[index].price });

      let position = count % temp[index]?.extraprice.length;

      let total = temp[index].extraprice[position].extraprice * temp[index].qty;

      temp[index] = { ...temp[index], ['price']: temp[index].extraprice[position].extraprice, ['total']: total };
      setCartData(temp);
    };

    const CTITEM = ({item}) => {
      const labelstyle = {
        ...s.normal_label,
        color: 'black',
        flex: 1,
        padding: 2,
        textAlign: 'center',
        borderColor: 'black',
        borderWidth: 1,
      };
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
          <Text style={labelstyle}>{item.pdname}</Text>
          <Text style={labelstyle}>{item.qty}</Text>
          {item?.extraprice?.length > 0 ? (
            <TouchableOpacity onPress={() => changePrice(item.name)}>
              <Text style={labelstyle}>{item.price}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={labelstyle}>{item.price}</Text>
          )}
          <Text style={{...labelstyle, textAlign: 'right'}}>
            {numberWithCommas(item.total)}
          </Text>
        </View>
      );
    };

    const [openbarcode, setOpenBarcode] = useState(false);

    if (load) {
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size={50} color={C.bluecolor} />
      </View>;
    }

    return (
      <ProductsContext.Provider value={ProductDataValue}>
        <KeyboardAvoidingView style={{flex: 1, padding: 0}}>
          <View style={{flexDirection: 'column', padding: 5}}>
            <View
              style={{
                ...s.flexrow_aligncenter_j_between,
                borderRadius: 15,
                height: 45,
                borderColor: 'black',
                borderWidth: 1.5,
                paddingRight: 10,
                margin: 5,
              }}>
              <TextInput
                style={{
                  padding: 10,
                  flex: 1,
                  fontWeight: '900',
                }}
                placeholder={'Search Products'}
                onChangeText={e => setSearchText(e)}
              />
              <Icon name={'search'} size={20} color={'#000'} />
              <TouchableOpacity onPress={() => setOpenBarcode(true)}>
                <Icon
                  name={'barcode-outline'}
                  size={25}
                  color={'#000'}
                  style={{marginLeft: 10}}
                />
              </TouchableOpacity>
            </View>
            {/* Category View */}
            {categoryData ? (
              <ScrollView
                style={{
                  flexDirection: 'row',
                }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}>
                <TouchableOpacity onPress={e => setCategoryId('All')}>
                  <Text
                    style={{
                      backgroundColor:
                        categoryId === 'All' ? C.blackbutton : '#f0f0f0',
                      color: categoryId === 'All' ? 'white' : 'black',
                      padding: 10,
                      marginLeft: 5,
                      marginRight: 5,
                      borderRadius: 15,
                    }}>
                    All
                  </Text>
                </TouchableOpacity>
                {categoryData.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={e => setCategoryId(item.value)}>
                    <Text
                      style={{
                        backgroundColor:
                          categoryId === item.value ? C.blackbutton : '#f0f0f0',
                        color: categoryId === item.value ? 'white' : 'black',
                        padding: 10,
                        marginLeft: 5,
                        marginRight: 5,
                        borderRadius: 15,
                      }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}
          </View>
          <BarCodeToCart open={openbarcode} setOpen={setOpenBarcode} />

          {/* Product View */}
          <View style={{flex: 1}}>
            <FlatList
              refreshControl={
                <RefreshControl
                  refreshing={load}
                  onRefresh={GetProdcutsFromServer}
                />
              }
              initialNumToRender={10} // how many item to display first
              keyboardShouldPersistTaps={'always'}
              removeClippedSubviews={false}
              style={{backgroundColor: C.white}}
              data={ProductFilter}
              renderItem={PDITEM}
              keyExtractor={i => i.id}
            />
          </View>
          {/*Cart View */}
          <View
            style={{
              borderColor: 'black',
              borderRadius: 15,

              backgroundColor: 'yellow',
              borderWidth: 1,
              maxHeight: C.windowHeight * 30,
              padding: 5,
            }}>
            <CartView
              setTotalAmount={setTotalAmount}
              show={editcartshow}
              onClose={() => seteditcartshow(false)}
            />
            <View style={{...s.flexrow_aligncenter_j_between}}>
              <Text style={{...s.bold_label}}>Cart List</Text>
              <Text style={{...s.bold_label, fontSize: 15}}>
                {CartData.length} Items
              </Text>
              <TouchableOpacity
                style={{padding: 5}}
                onPress={() => seteditcartshow(true)}>
                <Icon name={'pencil'} size={20} color={'#000'} />
              </TouchableOpacity>
            </View>
            <FlatList
              contentContainerStyle={{flexDirection: 'column-reverse'}}
              style={{backgroundColor: C.white}}
              data={CartData}
              renderItem={CTITEM}
              keyExtractor={i => i.name}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 5,
              }}>
              <Text style={{...s.bold_label}}>Total Amount :</Text>
              <Text style={{...s.bold_label}}>
                {numberWithCommas(SumTotal)} MMK
              </Text>
            </View>
            <Button
              title={'Done'}
              onPress={() => {
                setOpen(false);
                setCartData(CartData);
                setData(CartData);
              }}
            />
            <TextInput
              style={{...s.textInputnormal}}
              keyboardType={'number-pad'}
            />
          </View>
        </KeyboardAvoidingView>
      </ProductsContext.Provider>
    );
  };

  const ListItem = ({item}) => {
    return (
      <View
        style={{
          padding: 5,
          backgroundColor: C.blackbutton,
          marginLeft: 5,
          borderRadius: 15,
        }}>
        <Text style={{fontWeight: 'bold', color: 'white'}}>{item.pdname}</Text>
      </View>
    );
  };

  return (
    <>
      <Modal visible={open}>{ProductView()}</Modal>
      {custom ? (
        <TouchableOpacity
          style={{
            padding: 5,
            backgroundColor: C.bluecolor,
            borderRadius: 15,
            marginRight: 5,
          }}
          onPress={() => SetOpenModal()}>
          <Icon name={'add'} size={25} color={'#fff'} />
        </TouchableOpacity>
      ) : (
        <View {...ContainerProps}>
          <View style={{flex: 1}}>
            {CartData ? (
              <FlatList
                horizontal
                contentContainerStyle={{flexDirection: 'row'}}
                style={{backgroundColor: C.white}}
                data={CartData}
                renderItem={ListItem}
                keyExtractor={i => i.name}
              />
            ) : (
              <TouchableOpacity
                style={{padding: 5}}
                onPress={() => SetOpenModal()}>
                <Text>Choose Prodcuts</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={{padding: 5}} onPress={() => SetOpenModal()}>
            <Icon name={'add'} size={20} color={'#000'} />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default ProductField;
