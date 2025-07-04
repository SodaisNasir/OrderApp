import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    Modal,
    StatusBar,
    StyleSheet,
    View
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Colors } from '../../../important/Colors';
import NewButton from '../NewButton';

const LogoutModal = ({modalVisible, setModalVisible}) => {

  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);


  const handleLogOut = async () => {
    setLoader(true)
     await AsyncStorage.removeItem('user');
    const loginAction = {
      type: 'LOGIN',
      payload: null,
    };

    dispatch(loginAction);
    setLoader(false)
  }


  const buttonCancell = {
    borderColor: Colors.primary,
    borderWidth: 1,
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      statusBarTranslucent
      visible={modalVisible}
      style={{
        flex: 1,
        margin:0
      }}
    >
      {/* <StatusBar backgroundColor={'rgba(0, 0, 0, 0.5)'} /> */}
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
              <NewButton
                name="Logout"
                txtColor="#fff"
                bgColor={Colors.primary}
                buttonCancell={buttonCancell}
                onpress={handleLogOut}
                loader={loader}
              />

              <NewButton
                onpress={setModalVisible}
                name="Cancel"
                txtColor={Colors.primary}
                buttonCancell={buttonCancell}
              />
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Black background with 50% opacity
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
});
