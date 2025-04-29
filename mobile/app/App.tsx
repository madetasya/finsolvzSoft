import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginPage from "./LoginPage";
import HomePage from "./Homepage";
import RevenuePage from "./RevenuePage";
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider } from "react-native-paper";
import SearchPage from "./Searchpage";
import CreateReportPage from "./CreateReport";

const Stack = createStackNavigator();
SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {
  const [fonts] = useFonts({
    UbuntuLight: require('../assets/fonts/Ubuntu-Light.ttf'),
    UbuntuRegular: require('../assets/fonts/Ubuntu-Regular.ttf'),
    UbuntuMedium: require('../assets/fonts/Ubuntu-Medium.ttf'),
    UbuntuBold: require('../assets/fonts/Ubuntu-Bold.ttf'),
    UbuntuLightItalic: require('../assets/fonts/Ubuntu-LightItalic.ttf'),
    UbuntuRegularItalic: require('../assets/fonts/Ubuntu-Italic.ttf'),
    UbuntuMediumItalic: require('../assets/fonts/Ubuntu-MediumItalic.ttf'),
    UbuntuBoldItalic: require('../assets/fonts/Ubuntu-BoldItalic.ttf'),
  })

  React.useEffect(() => {
    if (fonts) {
      SplashScreen.hideAsync();
    }
  }, [fonts]);

  if (!fonts) {
    return null
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="Home" component={HomePage} />
          <Stack.Screen name="SearchPage" component={SearchPage} />
          <Stack.Screen name="CreateReport" component={CreateReportPage} />
          {/* <Stack.Screen name="Revenue" component={RevenuePage} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );

};

export default App;
