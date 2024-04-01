import {Dimensions, StyleSheet, Alert} from 'react-native';

export const COLOR = {
  backgroundcolor: '#f0f0f0',
  white: '#fff',
  black: '#000000',
  textmuted: '#656363',
  blackbutton: '#323232',
  textfield: '#C4C4C4',
  bluecolor: '#0911b0',
  windowWidth: Dimensions.get('window').width / 100,
  windowHeight: Dimensions.get('window').height / 100,
};

export const STYLE = StyleSheet.create({
  font_bold: {
    fontWeight: 'bold',
  },
  normal_label: {
    color: 'black',
    fontSize: 16,
  },
  bold_label: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  Container: {
    flex: 1,
    backgroundColor: COLOR.white,
    padding: 8,
  },
  defaultTextInput: {
    backgroundColor: COLOR.white,
    borderBottomColor: COLOR.black,
    borderBottomWidth: 1,
    padding: 1,
    margin: 5,
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Pyidaungsu-Book',
    color:'black'
  },

  textInputnormal: {
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
  },

  blue_button: {
    backgroundColor: COLOR.bluecolor,
    padding: 8,
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  black_button: {
    backgroundColor: COLOR.blackbutton,
    padding: 8,
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  flexrow_aligncenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexrow_aligncenter_j_between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexrow_aligncenter_j_center: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const IMAGE = {
  d1: require('./assets/color/d1.png'),
  d2: require('./assets/color/d2.png'),
  d3: require('./assets/color/d3.png'),
  d4: require('./assets/color/d4.png'),

  app_logo: require('./assets/image/app_logo.png'),
  scan_barcode: require('./assets/image/scanbarcode.png'),

  thura: require('./assets/image/i.png'),

  spinnerloadgif: require('./assets/image/spinnerloading.gif'),
  profile: require('./assets/image/profile_images.jpeg'),
};

export const ALERT = {
  alert: a => Alert.alert('', a, [{text: 'OK'}]),
  rqf: () => Alert.alert('', 'Please fill require fields.', [{text: 'OK'}]),
  lqy: () => Alert.alert('', 'Limited Qty', [{text: 'OK'}]),
  spe: () =>
    Alert.alert(
      'Error',
      'Cannot connect to server, We will use local storage.',
      [{text: 'OK'}],
    ),
  asc: yes =>
    Alert.alert('', 'Are you sure want to close?', [
      {text: 'Yes', onPress: yes},
      {text: 'No'},
    ]),
  aslogout: yes =>
    Alert.alert('', 'Are you sure want to Logout?', [
      {text: 'Yes', onPress: yes},
      {text: 'No'},
    ]),
  aswantodelete: (yes, yesarg) =>
    Alert.alert('', 'Are you sure want to delete this voucher? ', [
      {text: 'Yes', onPress: () => yes(yesarg)},
      {text: 'No'},
    ]),
  sus: () =>
    Alert.alert('Successfully', 'Successfully Uploaded.', [{text: 'OK'}]),
  c_b: () =>
    Alert.alert(
      'Error',
      'The package cannot be purchased after the plan has been requested.',
      [{text: 'OK'}],
    ),
};
export const numberWithCommas = (x = 0) => {
  if (x === null || x === undefined) {
    return '';
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const isArrayhasData = (arr = []) => {
  return arr === null ? false : arr.length >= 1;
};

export const baseUrl = 'https://empirepsos.pythonanywhere.com'; //without image
// export const baseUrl = 'https://mttonlinepos.pythonanywhere.com'; //with image


// export const baseUrl = 'http://192.168.100.63:8000';  

// export const baseUrl = 'http://192.168.43.181:8000';
// export const baseUrl = 'http://192.168.100.198:8000';
// export const baseUrl = 'http://192.168.100.69:8000';



export const appversion = '1.0';  

export function calculateEAN13(input) {
  // Check if the input is a 12-digit number
  input = input?.toString().padStart(12, '0');

  if (/^\d{12}$/.test(input)) {
    // Convert the input to an array of integers
    let digits = input.split('').map(Number);

    // Calculate the check digit
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += i % 2 === 0 ? digits[i] : digits[i] * 3;
    }
    let checkDigit = (10 - (sum % 10)) % 10;

    // Return the check digit
    return input + '' + checkDigit;
  } else {
    // Return an error message if the input is not valid
    return '';
  }
}
