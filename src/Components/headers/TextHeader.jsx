import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { PoppinsFont } from '../../Constants/fonts'
import { Colors } from '../../../important/Colors'

const TextHeader = ({title}) => {
  return (
    <View style={styles.mainCOn}>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

export default TextHeader

const styles = StyleSheet.create({
    mainCOn:{
        height: 45,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor: Colors.primary
    },
    title:{
        fontFamily: PoppinsFont.Poppins500,
        fontSize: 16,
        color:'white'
    }
})