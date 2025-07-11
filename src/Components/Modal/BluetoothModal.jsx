import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import NewButton from '../NewButton';
import {Colors} from '../../../important/Colors';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import Toast from 'react-native-simple-toast';
import {PoppinsFont} from '../../Constants/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BluetoothModal = ({
  modalVisible,
  setModalVisible,
  allPairDevices,
  setSelectedMac,
}) => {
  const [loader, setLoader] = useState(false);

  const buttonCancell = {
    borderColor: Colors.primary,
    borderWidth: 1,
  };

  const handleOpenSetting = async () => {
    setLoader(true);
    try {
      await RNBluetoothClassic.openBluetoothSettings();
      setModalVisible(false);
    } catch (error) {
      console.log('error', error);
      Toast.show('Something went Wrong', Toast.SHORT);
    }
    setLoader(false);
  };

  const handlePrinterSelect = async item => {
    try {
      setSelectedMac(item?.address);
      await AsyncStorage.setItem('selectedPrinterMac', item?.address); // ⬅️ Save to AsyncStorage
      setModalVisible(false);
      Toast.show('Printer selected successfully', Toast.SHORT);
    } catch (e) {
      console.error('Failed to save selected printer:', e);
      Toast.show('Failed to save selected printer', Toast.SHORT);
    }
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      statusBarTranslucent
      visible={modalVisible}
       onRequestClose={() => setModalVisible(false)} // Android back button
      style={{
        flex: 1,
        margin: 0,
      }}>
      {/* <StatusBar backgroundColor={'rgba(0, 0, 0, 0.5)'} /> */}
      <View style={styles.modalOverlay}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 18,
            marginTop: 20,
            color: Colors.primary,
            fontFamily: PoppinsFont.Poppins600,
          }}>
          Select Your Printer
        </Text>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: Colors.primary,
            fontFamily: PoppinsFont.Poppins600,
          }}>
          If your printer does not appear in the list, please pair it via
          Bluetooth settings first.
        </Text>
        <FlatList
          data={allPairDevices}
          keyExtractor={item => item.address}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => handlePrinterSelect(item)}
              style={styles.devices}>
              <Text>
                {item.name || 'Unnamed'} ({item.address})
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
};

export default BluetoothModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Black background with 50% opacity
    paddingHorizontal: 12,
    paddingVertical: 30,
  },
  modalView: {
    marginVertical: 'auto',
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    height: 'auto',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: 10,
  },
  delete_text: {
    fontSize: 15,
    textAlign: 'center',
    color: Colors.black,
  },
  devices: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 3,
    elevation: 2,
  },
});
