import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginPage from "./LoginPage";
import HomePage from "./Homepage";
import RevenuePage from "./RevenuePage";
import BSPLPage from "./BSPLPage";
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider } from "react-native-paper";
import SearchPage from "./Searchpage";
import CreateReportPage from "./CreateReport";
import ClientHomePage from "./ClientHomepage";
import { I18nextProvider } from "react-i18next"
import i18n from "../src/i18n/index"


type RootStackParamList = {
  Login: undefined;
  HomePage: {
    openModal?: boolean;
    selectedUser?: any;
    openCompanyModal?: boolean;
    selectedCompany?: any;
  } | undefined;

  SearchPage: undefined;
  CreateReport: undefined;
  ClientHomePage: undefined;
  BSPLPage: { reportId: string; companyId: string; reportType: string }
  Revenue: {
    reportId: string;
    selectedCompany: string | null;
  };
};


const Stack = createStackNavigator<RootStackParamList>();
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
    <I18nextProvider i18n={i18n}>
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="HomePage" component={HomePage} />
          <Stack.Screen name="SearchPage" component={SearchPage} />
          <Stack.Screen name="CreateReport" component={CreateReportPage} />
          <Stack.Screen name="ClientHomePage" component={ClientHomePage} />
          <Stack.Screen name="Revenue" component={RevenuePage} />
          <Stack.Screen name="BSPLPage" component={BSPLPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
    </I18nextProvider>
  );

};

export default App;
