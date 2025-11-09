import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { ThemeProvider } from '@rneui/themed';
import SplashScreen from './screens/SplashScreen';
import MainApp from './screens/MainApp';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#000' }
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="MainApp" component={MainApp} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

sys.path.append(r"C:\\")