import { SafeAreaView, StatusBar, StyleSheet, Text, View, Platform } from 'react-native'
import React, { useCallback } from 'react'
import { Colors } from '../../../important/Colors'
import { useFocusEffect } from '@react-navigation/native'

const Body = (props) => {
    const {
        children,
        light
    } = props

    useFocusEffect(
        useCallback(() => {
            if (Platform.OS === 'android') {
                StatusBar.setBackgroundColor(Colors.primary);
            }
        }, [])
      );


  return (
    <SafeAreaView style={styles.mainCon}>
           {/* {
        light ? */}
          <StatusBar barStyle={'dark-content'}  />
    {/* //       :
    //       <StatusBar barStyle={'dark-content'} />
    //   } */}
      {children}
    </SafeAreaView>
  )
}

export default Body

const styles = StyleSheet.create({
    mainCon:{
        flex: 1,
        backgroundColor: Colors.white,
    }
})