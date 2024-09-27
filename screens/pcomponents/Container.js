/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from './Home';
import Product from './Product';
import Expense from './Expense';
import Sales from './Sales';
import Report from './Report';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useTranslation} from 'react-i18next';
import '../../assets/i18n/i18n';
import SupplierView from './products/supplier';
import CustomerView from './sales/CustomerView';

const Tab = createBottomTabNavigator();
const Container = ({navigation, route}) => {
  const bottomIconsize = 25;
  const {t, i18n} = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          padding: 8,
          paddingBottom: 20,
          height: 80,
        },
      }}>
      {/*  <Tab.Screen
        name="home"
        component={Home}
        initialParams={route.params}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center'}}>
              <Icon
                name={focused ? 'home-sharp' : 'home-outline'}
                size={bottomIconsize}
                color={'#0f0f0f'}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: focused ? 'bold' : '200',
                  color: 'black',
                }}>
                {t('Home')}
              </Text>
            </View>
          ),
        }}
      />*/}
      <Tab.Screen
        name="sales"
        component={Sales}
        initialParams={route.params}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center'}}>
              <Icon
                name={focused ? 'cart-sharp' : 'cart-outline'}
                size={bottomIconsize}
                color={'#0f0f0f'}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: focused ? 'bold' : '500',
                  color: 'black',
                }}>
                {t('Sales')}
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="expense"
        component={Expense}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center'}}>
              <Icon
                name={focused ? 'albums' : 'albums-outline'}
                size={bottomIconsize}
                color={'#0f0f0f'}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: focused ? 'bold' : '500',
                  color: 'black',
                }}>
                {t('Expense')}
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="product"
        component={Product}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center'}}>
              <MIcon
                name={focused ? 'shopping' : 'shopping-outline'}
                size={bottomIconsize}
                color={'#0f0f0f'}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: focused ? 'bold' : '500',
                  color: 'black',
                }}>
                {t('Products')}
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="customer"
        component={CustomerView}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center'}}>
              <Icon
                name={focused ? 'people' : 'people-outline'}
                size={bottomIconsize}
                color={'#0f0f0f'}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: focused ? 'bold' : '500',
                  color: 'black',
                }}>
                {t('Customer')}
              </Text>
            </View>
          ),
        }}
      />
      {/* <Tab.Screen
        name="supplier"
        component={SupplierView}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center'}}>
              <MIcon
                name={focused ? 'package-down' : 'package-down'}
                size={bottomIconsize}
                color={'#0f0f0f'}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: focused ? 'bold' : '500',
                  color: 'black',
                }}>
                {t('Supplier')}
              </Text>
            </View>
          ),
        }}
      /> */}

      {/* <Tab.Screen
        name="report"
        component={Report}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center'}}>
              <MIcon
                name={focused ? 'file-chart' : 'file-chart-outline'}
                size={bottomIconsize}
                color={'#0f0f0f'}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: focused ? 'bold' : '200',
                  color: 'black',
                }}>
                {t('Report')}
              </Text>
            </View>
          ),
        }}
      />*/}
    </Tab.Navigator>
  );
};

export default Container;
