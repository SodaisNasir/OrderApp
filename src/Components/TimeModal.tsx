import React from 'react';
import Modal from 'react-native-modal';
import {Colors} from '../Constants/Colors';
import {View, Text, TouchableOpacity} from 'react-native';
import {scale} from 'react-native-size-matters';
import CustomButton from './CustomButton';

interface ModalComponentProps {
  isVisible: boolean;
  time: number;
  increment: () => void;
  decrement: () => void;
  onBackdropPress: () => void;
}

const TimeModal: React.FC<ModalComponentProps> = ({
  isVisible,
  time,
  onBackdropPress,
  decrement,
  increment,
}) => {
  return (
    <Modal isVisible={isVisible} onBackdropPress={onBackdropPress}>
      <View
        style={{
          flex: 0.3,
          backgroundColor: Colors.backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: scale(10),
        }}>
        <View style={{marginVertical: scale(20)}}>
          <Text>Time To Deliver / Prepare (Minutes)</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={increment}>
            <Text style={{fontSize: scale(30)}}>+</Text>
          </TouchableOpacity>
          <View
            style={{
              borderWidth: scale(1),
              height: scale(50),
              width: scale(50),
              marginHorizontal: scale(10),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text>{time}</Text>
          </View>
          <TouchableOpacity onPress={decrement}>
            <Text style={{fontSize: scale(30)}}>-</Text>
          </TouchableOpacity>
        </View>
        <CustomButton
          title="Confirm"
          onPress={onBackdropPress}
          ButtonStyle={{height: '15%', width: '40%', marginTop: scale(20)}}
        />
      </View>
    </Modal>
  );
};

export default TimeModal;
